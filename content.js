const APP_ROOT_ID = "xic-root";
const INLINE_BADGE_CLASS = "xic-inline-badge";
const PROFILE_FLAG_CLASS = "xic-profile-flag";
const ABOUT_ACCOUNT_QUERY_ID = "zs_jFPFT78rBpXv9Z3U2YQ";
const X_BEARER_TOKEN =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs=1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
const ABOUT_PROFILE_CACHE_TTL_MS = 10 * 60 * 1000;
const CLOUD_CACHE_URL_KEY = "xic_cloud_cache_url";
const CLOUD_CACHE_URL_PLACEHOLDER = "https://x-india-cache.YOUR_SUBDOMAIN.workers.dev";
const CLOUD_CACHE_TIMEOUT_MS = 5000;
const CLOUD_CONTRIBUTION_DEDUP_MS = 24 * 60 * 60 * 1000;
const ISO_REGION_CODES = [
  "AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ",
  "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS",
  "BT","BV","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN",
  "CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE",
  "EG","EH","ER","ES","ET","FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF",
  "GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY","HK","HM",
  "HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT","JE","JM",
  "JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC",
  "LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MF","MG","MH","MK",
  "ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ","NA",
  "NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF","PG",
  "PH","PK","PL","PM","PN","PR","PS","PT","PW","PY","QA","RE","RO","RS","RU","RW",
  "SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS",
  "ST","SV","SX","SY","SZ","TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO",
  "TR","TT","TV","TW","TZ","UA","UG","UM","US","UY","UZ","VA","VC","VE","VG","VI",
  "VN","VU","WF","WS","YE","YT","ZA","ZM","ZW"
];
const RESERVED_ROUTES = new Set([
  "compose",
  "explore",
  "hashtag",
  "home",
  "i",
  "intent",
  "jobs",
  "login",
  "messages",
  "notifications",
  "privacy",
  "search",
  "settings",
  "share",
  "signup",
  "tos"
]);
const PROFILE_SUBPAGES = new Set([
  "affiliates",
  "articles",
  "followers",
  "following",
  "likes",
  "media",
  "verified_followers",
  "with_replies",
  "about"
]);
const INDIA_TERMS = [
  "india",
  "bharat",
  "new delhi",
  "delhi",
  "mumbai",
  "bombay",
  "bengaluru",
  "bangalore",
  "hyderabad",
  "chennai",
  "kolkata",
  "calcutta",
  "pune",
  "gurugram",
  "gurgaon",
  "noida",
  "ahmedabad",
  "jaipur",
  "kochi",
  "ernakulam",
  "lucknow",
  "surat",
  "thane",
  "indore",
  "bhopal",
  "patna",
  "goa",
  "kerala",
  "tamil nadu",
  "karnataka",
  "maharashtra",
  "gujarat",
  "rajasthan",
  "punjab",
  "haryana",
  "telangana",
  "andhra pradesh",
  "uttar pradesh",
  "west bengal",
  "odisha",
  "assam",
  "jharkhand",
  "madhya pradesh",
  "chandigarh"
];
const INDIA_REGEX = new RegExp(`\\b(?:${INDIA_TERMS.map(escapeRegex).join("|")})\\b`, "i");
const LOCATION_HINT_REGEX = /\b(?:based in|from|living in|located in|hq|headquartered in|made in)\b/i;
const COUNTRY_NAME_ALIASES = new Map([
  ["uk", "GB"],
  ["u.k.", "GB"],
  ["united kingdom", "GB"],
  ["great britain", "GB"],
  ["britain", "GB"],
  ["england", "GB"],
  ["scotland", "GB"],
  ["wales", "GB"],
  ["u.s.", "US"],
  ["usa", "US"],
  ["u.s.a.", "US"],
  ["united states", "US"],
  ["united states of america", "US"],
  ["america", "US"],
  ["uae", "AE"],
  ["u.a.e.", "AE"],
  ["united arab emirates", "AE"],
  ["south korea", "KR"],
  ["north korea", "KP"],
  ["russia", "RU"],
  ["vietnam", "VN"],
  ["venezuela", "VE"],
  ["bolivia", "BO"],
  ["tanzania", "TZ"],
  ["syria", "SY"],
  ["moldova", "MD"],
  ["laos", "LA"],
  ["brunei", "BN"],
  ["iran", "IR"],
  ["palestine", "PS"],
  ["macau", "MO"],
  ["macao", "MO"],
  ["hong kong", "HK"],
  ["taiwan", "TW"],
  ["cape verde", "CV"],
  ["czech republic", "CZ"]
]);

const aboutProfileCache = new Map();
const cloudContributionTimestamps = new Map();
let countryCodeByName = null;
let currentAnalysis = null;
let profileRefreshTimer = 0;
let inlineRefreshTimer = 0;
let observerStarted = false;
let cloudCacheUrlPromise = null;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeCountryLookupKey(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[().,']/g, "")
    .replace(/\s+/g, " ");
}

function buildCountryCodeByName() {
  if (countryCodeByName) {
    return countryCodeByName;
  }

  const map = new Map(COUNTRY_NAME_ALIASES);
  for (const locale of ["en", document.documentElement.lang || "en"]) {
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    for (const code of ISO_REGION_CODES) {
      const label = displayNames.of(code);
      if (!label) {
        continue;
      }

      map.set(normalizeCountryLookupKey(label), code);
    }
  }

  countryCodeByName = map;
  return map;
}

function getCountryCode(countryName) {
  if (!countryName) {
    return "";
  }

  const normalized = normalizeCountryLookupKey(countryName);
  return buildCountryCodeByName().get(normalized) || "";
}

function getFlagEmoji(countryName) {
  const code = getCountryCode(countryName);
  if (!/^[A-Z]{2}$/.test(code)) {
    return "";
  }

  return String.fromCodePoint(
    code.charCodeAt(0) + 127397,
    code.charCodeAt(1) + 127397
  );
}

function getCookieValue(name) {
  return (
    document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
      ?.slice(name.length + 1) || ""
  );
}

function storageLocalGet(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        resolve({});
        return;
      }

      resolve(result || {});
    });
  });
}

async function getCloudCacheUrl() {
  if (cloudCacheUrlPromise) {
    return cloudCacheUrlPromise;
  }

  cloudCacheUrlPromise = storageLocalGet([CLOUD_CACHE_URL_KEY]).then((result) => {
    const value = normalizeText(
      result?.[CLOUD_CACHE_URL_KEY] || window.localStorage.getItem(CLOUD_CACHE_URL_KEY)
    );
    if (!value || value === CLOUD_CACHE_URL_PLACEHOLDER) {
      return "";
    }

    try {
      const url = new URL(value);
      if (url.protocol !== "https:") {
        return "";
      }
      return url.origin;
    } catch {
      return "";
    }
  });

  return cloudCacheUrlPromise;
}

function buildCloudLookupUrl(baseUrl, handles) {
  const url = new URL("/lookup", baseUrl);
  url.searchParams.set(
    "users",
    handles.map((handle) => handle.toLowerCase()).join(",")
  );
  return url.toString();
}

function isExactIndiaLocation(countryName) {
  return getCountryCode(countryName) === "IN";
}

function createAboutProfile({
  country,
  source = "",
  locationAccurate = true,
  lookupSource = "AboutAccountQuery"
}) {
  return {
    account_based_in: normalizeText(country),
    source: normalizeText(source),
    location_accurate: locationAccurate !== false,
    lookup_source: lookupSource
  };
}

function getAboutProfileSignalLabel(aboutProfile) {
  return normalizeText(aboutProfile?.lookup_source) || "AboutAccountQuery";
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = CLOUD_CACHE_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function lookupCloudAboutProfile(handle) {
  const baseUrl = await getCloudCacheUrl();
  if (!baseUrl) {
    return null;
  }

  const response = await fetchJsonWithTimeout(buildCloudLookupUrl(baseUrl, [handle]), {
    method: "GET",
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Cloud lookup failed with ${response.status}`);
  }

  const data = await response.json();
  const entry = data?.results?.[handle.toLowerCase()];
  const country = normalizeText(entry?.l || entry?.location);

  if (!isExactIndiaLocation(country)) {
    return null;
  }

  return createAboutProfile({
    country,
    source: normalizeText(entry?.d || entry?.device || "Cloud cache"),
    locationAccurate: entry?.a !== false,
    lookupSource: "Cloud cache"
  });
}

function shouldContributeCloudAboutProfile(aboutProfile) {
  return (
    aboutProfile &&
    isExactIndiaLocation(aboutProfile.account_based_in) &&
    getAboutProfileSignalLabel(aboutProfile) !== "Cloud cache"
  );
}

async function contributeCloudAboutProfile(handle, aboutProfile) {
  if (!shouldContributeCloudAboutProfile(aboutProfile)) {
    return;
  }

  const baseUrl = await getCloudCacheUrl();
  if (!baseUrl) {
    return;
  }

  const key = handle.toLowerCase();
  const lastContribution = cloudContributionTimestamps.get(key) || 0;
  if (Date.now() - lastContribution < CLOUD_CONTRIBUTION_DEDUP_MS) {
    return;
  }

  const response = await fetchJsonWithTimeout(new URL("/contribute", baseUrl).toString(), {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      entries: {
        [key]: {
          l: normalizeText(aboutProfile.account_based_in),
          d: normalizeText(aboutProfile.source),
          a: aboutProfile.location_accurate !== false
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Cloud contribute failed with ${response.status}`);
  }

  cloudContributionTimestamps.set(key, Date.now());
}

function getProfileHandleFromPath(pathname = window.location.pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  const [candidate, subpage] = parts;
  const normalizedCandidate = candidate.toLowerCase();

  if (candidate.startsWith("@") || RESERVED_ROUTES.has(normalizedCandidate)) {
    return null;
  }

  if (parts.length > 1 && !PROFILE_SUBPAGES.has((subpage || "").toLowerCase())) {
    return null;
  }

  return candidate;
}

function extractHandleFromHref(href) {
  if (!href) {
    return null;
  }

  try {
    const url = new URL(href, window.location.origin);
    return getProfileHandleFromPath(url.pathname);
  } catch {
    return null;
  }
}

function extractDomains(text) {
  return [...new Set((text.match(/\b(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+\.)+[a-z]{2,}\b/gi) || []))]
    .map((domain) => domain.replace(/^https?:\/\//i, "").replace(/^www\./i, "").toLowerCase());
}

function getLikelyLocationLine(metadataText) {
  return metadataText
    .split(/\n+/)
    .map(normalizeText)
    .find((line) => {
      if (!line) {
        return false;
      }
      if (/^(joined|born)\b/i.test(line)) {
        return false;
      }
      if (/(followers|following)\b/i.test(line)) {
        return false;
      }
      if (/\.(?:com|org|net|io|co|in|ai|me|app|dev)\b/i.test(line)) {
        return false;
      }
      return true;
    }) || "";
}

function buildAboutAccountUrl(handle) {
  const query = new URLSearchParams({
    variables: JSON.stringify({ screenName: handle })
  });
  return `/i/api/graphql/${ABOUT_ACCOUNT_QUERY_ID}/AboutAccountQuery?${query.toString()}`;
}

async function fetchAboutProfile(handle) {
  if (!handle) {
    return null;
  }

  const cached = aboutProfileCache.get(handle);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const promise = (async () => {
    const cloudProfile = await lookupCloudAboutProfile(handle).catch(() => null);
    if (cloudProfile) {
      return cloudProfile;
    }

    const ct0 = getCookieValue("ct0");
    if (!ct0) {
      return null;
    }

    const headers = {
      authorization: `Bearer ${X_BEARER_TOKEN}`,
      "x-csrf-token": ct0,
      "x-twitter-active-user": "yes",
      "x-twitter-client-language": document.documentElement.lang || "en",
      "content-type": "application/json"
    };

    if (getCookieValue("twid")) {
      headers["x-twitter-auth-type"] = "OAuth2Session";
    }

    const response = await fetch(buildAboutAccountUrl(handle), {
      credentials: "include",
      headers
    });

    if (!response.ok) {
      throw new Error(`AboutAccountQuery failed with ${response.status}`);
    }

    const data = await response.json();
    const aboutProfile = data?.data?.user_result_by_screen_name?.result?.about_profile || null;

    if (shouldContributeCloudAboutProfile(aboutProfile)) {
      void contributeCloudAboutProfile(handle, aboutProfile).catch(() => {});
    }

    return aboutProfile;
  })()
    .catch((error) => {
      aboutProfileCache.delete(handle);
      throw error;
    });

  aboutProfileCache.set(handle, {
    expiresAt: Date.now() + ABOUT_PROFILE_CACHE_TTL_MS,
    promise
  });

  return promise;
}

function findProfileNodes(handle) {
  const main = document.querySelector("main");
  if (!main) {
    return null;
  }

  const aboutLink =
    main.querySelector(`a[href="/${handle}/about"]`) ||
    main.querySelector(`a[href$="/${handle}/about"]`) ||
    main.querySelector('a[href$="/about"]');

  const metadataNode =
    main.querySelector('[data-testid="UserProfileHeader_Items"]') ||
    aboutLink?.parentElement ||
    null;

  const bioNode =
    main.querySelector('[data-testid="UserDescription"]') ||
    metadataNode?.previousElementSibling ||
    null;

  const titleNode =
    main.querySelector('[data-testid="UserName"]') ||
    main.querySelector('h2[role="heading"]') ||
    main.querySelector('h1[role="heading"]');

  return {
    aboutLink,
    titleNode,
    bioNode,
    metadataNode
  };
}

function findAboutCardText() {
  const selectors = [
    '[role="dialog"]',
    '[aria-modal="true"]',
    '[data-testid*="HoverCard"]',
    '[data-testid*="sheetDialog"]',
    '[data-testid*="popover"]',
    '[data-testid*="flyout"]'
  ];

  for (const selector of selectors) {
    for (const candidate of document.querySelectorAll(selector)) {
      const text = candidate.innerText || "";
      if (/about this account/i.test(text) || /account based in /i.test(text)) {
        return text.trim();
      }
    }
  }

  return "";
}

function parseAccountBasedLocation(text) {
  const line = text
    .split(/\n+/)
    .map(normalizeText)
    .find((entry) => /^account based in /i.test(entry));

  return normalizeText(line?.replace(/^account based in /i, "") || "");
}

function buildAnalysis(overrides = {}) {
  const handle = getProfileHandleFromPath();
  if (!handle) {
    return {
      type: "not-profile",
      handle: "",
      title: "",
      confidence: 0,
      summary: "Open an X profile to inspect it.",
      evidence: [],
      metadata: "",
      bio: ""
    };
  }

  const nodes = findProfileNodes(handle);
  const title = normalizeText(nodes?.titleNode?.innerText);
  const bio = normalizeText(nodes?.bioNode?.innerText);
  const metadata = normalizeText(nodes?.metadataNode?.innerText);
  const aboutCardText = overrides.aboutCardText || findAboutCardText();
  const aboutProfile = overrides.aboutProfile || null;
  const accountBasedLocation = normalizeText(
    aboutProfile?.account_based_in || parseAccountBasedLocation(aboutCardText)
  );

  if (!title && !bio && !metadata && !accountBasedLocation) {
    return {
      type: "loading",
      handle,
      title: "",
      confidence: 0,
      summary: "Waiting for the profile header to load.",
      evidence: [],
      metadata: "",
      bio: ""
    };
  }

  const signals = [];
  let score = 0;

  if (accountBasedLocation) {
    score = 100;
    if (aboutProfile) {
      const source = normalizeText(aboutProfile.source);
      const signalLabel = getAboutProfileSignalLabel(aboutProfile);
      signals.push(
        source
          ? `${signalLabel} says "Account based in ${accountBasedLocation}" via "${source}".`
          : `${signalLabel} says "Account based in ${accountBasedLocation}".`
      );
    } else {
      signals.push(`About this account says "Account based in ${accountBasedLocation}".`);
    }
  }

  const metadataMatch = metadata.match(INDIA_REGEX);
  if (metadataMatch && score < 100) {
    score += 75;
    signals.push(`Profile metadata includes "${metadataMatch[0]}".`);
  }

  const bioMatch = bio.match(INDIA_REGEX);
  if (bioMatch && score < 100) {
    const weightedScore = LOCATION_HINT_REGEX.test(bio) ? 45 : 25;
    score += weightedScore;
    signals.push(
      LOCATION_HINT_REGEX.test(bio)
        ? `Bio includes a location-style India signal: "${bioMatch[0]}".`
        : `Bio references "${bioMatch[0]}".`
    );
  }

  const domains = extractDomains(`${metadata}\n${bio}`);
  const indiaDomain = domains.find((domain) => /\.(?:co\.)?in$/i.test(domain));
  if (indiaDomain && score < 100) {
    score += 15;
    signals.push(`Website uses an Indian domain: ${indiaDomain}.`);
  }

  const locationLine = getLikelyLocationLine(metadata);
  const confidence = Math.min(score, 100);

  let type = "no-signal";
  let summary = "No India signal found in the visible profile metadata.";

  if (accountBasedLocation && !INDIA_REGEX.test(accountBasedLocation)) {
    type = "not-india";
    summary = `${getAboutProfileSignalLabel(aboutProfile)} says the account is based in ${accountBasedLocation}.`;
  } else if (confidence >= 70) {
    type = "likely";
    summary = "Likely India-based.";
  } else if (confidence >= 35) {
    type = "possible";
    summary = "Possibly India-based.";
  } else if (!metadata && !bio) {
    type = "inconclusive";
    summary = "Not enough visible profile metadata to decide.";
  }

  if (type === "no-signal" && locationLine) {
    summary = `Visible location signal: "${locationLine}", but it does not match the India rules.`;
  }

  return {
    type,
    handle,
    title,
    confidence,
    summary,
    evidence: signals,
    aboutProfile,
    aboutCardText,
    metadata,
    bio
  };
}

function ensureRoot() {
  let root = document.getElementById(APP_ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = APP_ROOT_ID;
    document.body.appendChild(root);
  }
  return root;
}

function removeRoot() {
  document.getElementById(APP_ROOT_ID)?.remove();
}

function removeProfileFlag() {
  document.querySelector(`.${PROFILE_FLAG_CLASS}`)?.remove();
}

function findVerifiedAccountElement(root) {
  if (!(root instanceof Element)) {
    return null;
  }

  return root.querySelector(
    'svg[aria-label="Verified account"], img[alt="Verified account"], [aria-label="Verified account"]'
  );
}

function ensureProfileFlag(handle, aboutProfile) {
  const nodes = findProfileNodes(handle);
  if (!nodes?.titleNode) {
    removeProfileFlag();
    return;
  }

  const country = normalizeText(aboutProfile?.account_based_in);
  const flag = isExactIndiaLocation(country) ? "🇮🇳" : "";
  if (!flag) {
    removeProfileFlag();
    return;
  }

  let badge = nodes.titleNode.querySelector(`.${PROFILE_FLAG_CLASS}`);
  if (!badge) {
    badge = document.createElement("span");
    badge.className = PROFILE_FLAG_CLASS;

    const verifiedElement = findVerifiedAccountElement(nodes.titleNode);
    const verifiedWrapper = verifiedElement?.parentElement || null;
    if (verifiedWrapper) {
      verifiedWrapper.insertAdjacentElement("beforebegin", badge);
    } else {
      nodes.titleNode.appendChild(badge);
    }
  }

  const source = normalizeText(aboutProfile?.source);
  badge.textContent = flag;
  badge.dataset.xicCountry = country;
  badge.setAttribute("aria-label", `Account based in ${country}`);
  badge.setAttribute("role", "img");
  badge.title = source
    ? `Account based in ${country} via ${source}`
    : `Account based in ${country}`;
}

function renderBadge(analysis) {
  const profileHandle = getProfileHandleFromPath();
  if (analysis.type === "not-profile") {
    removeRoot();
    removeProfileFlag();
    return;
  }

  if (profileHandle) {
    removeRoot();
    ensureProfileFlag(profileHandle, analysis.aboutProfile);
    return;
  }

  const root = ensureRoot();
  root.className = `xic-card xic-${analysis.type}`;

  const title = analysis.title || `@${analysis.handle}`;
  const confidenceText = analysis.confidence > 0 ? `${analysis.confidence}/100` : "No score";
  const evidenceText = analysis.evidence[0] || "Visible profile text is the only input.";

  root.innerHTML = `
    <div class="xic-eyebrow">X India Checker</div>
    <div class="xic-title">${escapeHtml(analysis.summary)}</div>
    <div class="xic-meta">${escapeHtml(title)}${analysis.handle ? ` · @${escapeHtml(analysis.handle)}` : ""}</div>
    <div class="xic-confidence">${escapeHtml(confidenceText)}</div>
    <div class="xic-evidence">${escapeHtml(evidenceText)}</div>
  `;
}

function shouldDecorateHandleLink(anchor) {
  if (!(anchor instanceof HTMLAnchorElement)) {
    return false;
  }

  const handle = extractHandleFromHref(anchor.getAttribute("href") || "");
  if (!handle) {
    return false;
  }

  const text = normalizeText(anchor.textContent);
  return text.toLowerCase() === `@${handle}`.toLowerCase();
}

function findInlineHandleAnchors(handle) {
  return [...document.querySelectorAll('a[href^="/"]')].filter((anchor) => {
    if (!shouldDecorateHandleLink(anchor)) {
      return false;
    }

    return extractHandleFromHref(anchor.getAttribute("href") || "")?.toLowerCase() === handle.toLowerCase();
  });
}

function ensureInlineBadge(anchor, handle, aboutProfile) {
  if (!(anchor instanceof HTMLElement)) {
    return;
  }

  const country = normalizeText(aboutProfile?.account_based_in);
  const flag = isExactIndiaLocation(country) ? "🇮🇳" : "";
  if (!flag) {
    removeInlineBadge(anchor, handle);
    return;
  }

  let badge = anchor.parentElement?.querySelector(`[data-xic-inline-badge-for="${handle}"]`);
  if (!badge) {
    badge = document.createElement("span");
    badge.className = INLINE_BADGE_CLASS;
    badge.dataset.xicInlineBadgeFor = handle;
    anchor.insertAdjacentElement("afterend", badge);
  }

  badge.textContent = flag;
  badge.dataset.xicCountry = country;
  badge.setAttribute("aria-label", `Account based in ${country}`);
  badge.setAttribute("role", "img");

  const source = normalizeText(aboutProfile?.source);
  badge.title = source
    ? `Account based in ${country} via ${source}`
    : `Account based in ${country}`;
}

function removeInlineBadgesForHandle(handle) {
  for (const badge of document.querySelectorAll(`[data-xic-inline-badge-for="${handle}"]`)) {
    badge.remove();
  }
}

function removeInlineBadge(anchor, handle) {
  const badge = anchor.parentElement?.querySelector(`[data-xic-inline-badge-for="${handle}"]`);
  if (badge) {
    badge.remove();
  }
}

function applyInlineResult(handle, aboutProfile) {
  const anchors = findInlineHandleAnchors(handle);
  const country = normalizeText(aboutProfile?.account_based_in);
  const flag = isExactIndiaLocation(country) ? "🇮🇳" : "";

  if (!flag) {
    removeInlineBadgesForHandle(handle);
    return;
  }

  for (const anchor of anchors) {
    ensureInlineBadge(anchor, handle, aboutProfile);
  }
}

async function hydrateHandle(handle) {
  try {
    const aboutProfile = await fetchAboutProfile(handle);
    applyInlineResult(handle, aboutProfile);

    if (getProfileHandleFromPath()?.toLowerCase() === handle.toLowerCase()) {
      currentAnalysis = buildAnalysis({ aboutProfile });
      renderBadge(currentAnalysis);
    }
  } catch {
    applyInlineResult(handle, null);
  }
}

function refreshProfileBadge() {
  currentAnalysis = buildAnalysis();
  renderBadge(currentAnalysis);

  const handle = getProfileHandleFromPath();
  if (!handle) {
    removeProfileFlag();
    return;
  }

  void hydrateHandle(handle);
}

function refreshInlineBadges() {
  const handles = new Set();
  for (const anchor of document.querySelectorAll('a[href^="/"]')) {
    if (!shouldDecorateHandleLink(anchor)) {
      continue;
    }

    const handle = extractHandleFromHref(anchor.getAttribute("href") || "");
    if (!handle) {
      continue;
    }

    handles.add(handle);
  }

  for (const handle of handles) {
    const cached = aboutProfileCache.get(handle);
    if (cached) {
      void cached.promise.then((aboutProfile) => applyInlineResult(handle, aboutProfile)).catch(() => {
        applyInlineResult(handle, null);
      });
      continue;
    }

    void hydrateHandle(handle);
  }
}

function scheduleProfileRefresh() {
  window.clearTimeout(profileRefreshTimer);
  profileRefreshTimer = window.setTimeout(refreshProfileBadge, 150);
}

function scheduleInlineRefresh() {
  window.clearTimeout(inlineRefreshTimer);
  inlineRefreshTimer = window.setTimeout(refreshInlineBadges, 250);
}

function scheduleRefresh() {
  scheduleProfileRefresh();
  scheduleInlineRefresh();
}

function installNavigationHooks() {
  if (window.__xicHooksInstalled) {
    return;
  }
  window.__xicHooksInstalled = true;

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function pushState(...args) {
    const result = originalPushState.apply(this, args);
    scheduleRefresh();
    return result;
  };

  history.replaceState = function replaceState(...args) {
    const result = originalReplaceState.apply(this, args);
    scheduleRefresh();
    return result;
  };

  window.addEventListener("popstate", scheduleRefresh);
}

function startObserver() {
  if (observerStarted) {
    return;
  }

  observerStarted = true;
  const observer = new MutationObserver(() => {
    scheduleRefresh();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "XIC_GET_ANALYSIS" && message?.type !== "XIC_RUN_DEEP_CHECK") {
    return;
  }

  (async () => {
    const handle = getProfileHandleFromPath();
    let aboutProfile = null;

    if (handle) {
      try {
        aboutProfile = await fetchAboutProfile(handle);
      } catch {
        aboutProfile = null;
      }
    }

    currentAnalysis = buildAnalysis({ aboutProfile });
    renderBadge(currentAnalysis);
    sendResponse(currentAnalysis);
  })();

  return true;
});

installNavigationHooks();
startObserver();
scheduleRefresh();
