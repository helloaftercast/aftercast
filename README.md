# Aftercast

Live Pages URL: https://aftercast-2sa.pages.dev  
Domain: **aftercast.net** (Cloudflare Registrar)

Static one-page site. Videos are unlisted YouTube embeds (`data-youtube` on each `.player`).

## Custom domain (after purchase)

1. Cloudflare → **Workers & Pages** → project **aftercast** (not “Deploy with Workers” on the domain receipt page).
2. **Custom domains** → add `aftercast.net` and `www.aftercast.net`.
3. Wait until both show **Active**.
4. **Email** → **Email Routing**: destination Gmail, address `hello@aftercast.net`.

## Push updates

```bash
cd "/Users/tianzhong/交易看板/aftercast"
git add -A
git commit -m "Update site"
git push
```

## YouTube clips

Upload Unlisted. Paste the video ID (or full watch URL) into `data-youtube=""` on In the tank / On the water.

## Local preview

```bash
python3 -m http.server 8765
```

Open http://127.0.0.1:8765/
