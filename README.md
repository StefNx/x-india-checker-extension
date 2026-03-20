# X India Checker

Chrome extension for `x.com` that focuses on India first.

It reads X's account-country signal and shows an `🇮🇳` badge when an account is based in India.

What it uses:

- X's internal web `AboutAccountQuery` response while you are logged in
- optional Cloudflare shared cache for previously resolved India matches
- visible profile location text
- visible profile bio text
- visible website domain

What it does not use:

- paid X developer API credits
- IP geolocation
- hidden account metadata

## Result states

- `Likely India-based`: `account_based_in` is India or the visible profile has a strong India signal
- `Not India-based`: X says the account is based somewhere else
- `Possibly India-based`: weaker India signal, usually from bio text or a `.in` domain
- `No India signal found`: the visible profile metadata does not match the India rules
- `Inconclusive`: not enough profile metadata was visible yet

## Install

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select `/Users/clawdmac/x-india-checker-extension`.

## Cloud Cache

The repo includes a minimal Worker backend in [cloud-server/README.md](/Users/clawdmac/x-india-checker-extension/cloud-server/README.md).

After you deploy your Worker, set its URL in X's page console:

```js
localStorage.setItem(
  "xic_cloud_cache_url",
  "https://YOUR_WORKER_SUBDOMAIN.workers.dev"
);
```

Then reload the extension and refresh X.

## Notes

- When you are logged into X, the extension queries the same internal web endpoint X uses for `About this account`, so it can read `account_based_in` without opening the Joined panel manually.
- It only renders inline/profile badges for India right now.
- If the Cloudflare worker URL is configured, the extension checks that cache before calling X directly.
- This is still unofficial and can break if X changes its internal web endpoints.
- If X changes its profile DOM, the selector fallbacks in `content.js` may need small updates.
