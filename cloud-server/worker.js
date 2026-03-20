const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

const CONFIG = {
  maxLookupUsers: 100,
  maxContributeEntries: 250,
  maxUsernameLength: 50,
  entryTtlSeconds: 30 * 24 * 60 * 60
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...CORS_HEADERS,
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function isValidUsername(username) {
  return (
    username.length > 0 &&
    username.length <= CONFIG.maxUsernameLength &&
    /^[a-z0-9_]+$/i.test(username)
  );
}

function sanitizeText(value) {
  const text = String(value || "").trim();
  if (!text || text.length > 100) {
    return "";
  }

  if (/[<>]/.test(text) || /javascript:/i.test(text)) {
    return "";
  }

  return text;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        return jsonResponse({ status: "ok", timestamp: Date.now() });
      }

      if (request.method === "GET" && url.pathname === "/lookup") {
        return handleLookup(url, env);
      }

      if (request.method === "POST" && url.pathname === "/contribute") {
        return handleContribute(request, env);
      }

      if (request.method === "GET" && url.pathname === "/stats") {
        return handleStats(env);
      }

      return jsonResponse({ error: "Not found" }, 404);
    } catch (error) {
      return jsonResponse(
        {
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error)
        },
        500
      );
    }
  }
};

async function handleLookup(url, env) {
  const users = (url.searchParams.get("users") || "")
    .split(",")
    .map(normalizeUsername)
    .filter(isValidUsername)
    .slice(0, CONFIG.maxLookupUsers);

  if (users.length === 0) {
    return jsonResponse({ error: "Missing valid users parameter" }, 400);
  }

  const results = {};
  const misses = [];

  const entries = await Promise.all(
    users.map(async (username) => ({
      username,
      value: await env.CACHE_KV.get(username, "json").catch(() => null)
    }))
  );

  for (const entry of entries) {
    if (entry.value) {
      results[entry.username] = entry.value;
    } else {
      misses.push(entry.username);
    }
  }

  return jsonResponse({
    results,
    misses,
    count: Object.keys(results).length
  });
}

async function handleContribute(request, env) {
  const body = await request.json().catch(() => null);
  const entries = body?.entries;

  if (!entries || typeof entries !== "object") {
    return jsonResponse({ error: "Missing entries object" }, 400);
  }

  const normalizedEntries = Object.entries(entries).slice(0, CONFIG.maxContributeEntries);
  if (normalizedEntries.length === 0) {
    return jsonResponse({ error: "No entries provided" }, 400);
  }

  let accepted = 0;
  let rejected = 0;
  const writes = [];

  for (const [rawUsername, rawValue] of normalizedEntries) {
    const username = normalizeUsername(rawUsername);
    if (!isValidUsername(username) || !rawValue || typeof rawValue !== "object") {
      rejected += 1;
      continue;
    }

    const location = sanitizeText(rawValue.l || rawValue.location);
    const device = sanitizeText(rawValue.d || rawValue.device);
    const accurate =
      rawValue.a !== undefined
        ? rawValue.a !== false
        : rawValue.locationAccurate !== undefined
          ? rawValue.locationAccurate !== false
          : true;

    if (!location) {
      rejected += 1;
      continue;
    }

    writes.push(
      env.CACHE_KV.put(
        username,
        JSON.stringify({
          l: location,
          d: device,
          a: accurate,
          t: Math.floor(Date.now() / 1000)
        }),
        { expirationTtl: CONFIG.entryTtlSeconds }
      )
    );
    accepted += 1;
  }

  await Promise.all(writes);
  await incrementStats(env, accepted);

  return jsonResponse({
    accepted,
    rejected,
    message: `Stored ${accepted} entries`
  });
}

async function handleStats(env) {
  const stats = (await env.CACHE_KV.get("__stats__", "json").catch(() => null)) || {
    totalContributions: 0,
    lastUpdated: null
  };

  return jsonResponse(stats);
}

async function incrementStats(env, accepted) {
  if (!accepted) {
    return;
  }

  const current = (await env.CACHE_KV.get("__stats__", "json").catch(() => null)) || {
    totalContributions: 0,
    lastUpdated: null
  };

  current.totalContributions += accepted;
  current.lastUpdated = new Date().toISOString();

  await env.CACHE_KV.put("__stats__", JSON.stringify(current));
}
