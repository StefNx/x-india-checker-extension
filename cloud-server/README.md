# Cloud Cache

This is a minimal Cloudflare Worker + KV cache for the X India Checker extension.

It stores:
- username
- country
- device/source
- accuracy flag
- timestamp

Entries expire after 30 days.

## Deploy

1. Create a free Cloudflare account.
2. Install Wrangler:

```bash
npm install -g wrangler
```

3. Log in:

```bash
wrangler login
```

4. Create the KV namespace:

```bash
wrangler kv:namespace create "CACHE_KV"
```

5. Put the returned namespace ID into [wrangler.toml](/Users/clawdmac/x-india-checker-extension/cloud-server/wrangler.toml).

6. Deploy:

```bash
cd /Users/clawdmac/x-india-checker-extension/cloud-server
wrangler deploy
```

7. Copy the deployed `https://...workers.dev` URL.

## Connect It To The Extension

After deploy, set the worker URL in X's page console:

```js
localStorage.setItem(
  "xic_cloud_cache_url",
  "https://YOUR_WORKER_SUBDOMAIN.workers.dev"
);
```

Then reload the unpacked extension and refresh X.

## Endpoints

- `GET /health`
- `GET /lookup?users=user1,user2`
- `POST /contribute`
- `GET /stats`
