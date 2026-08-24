# Aftercast

Static one-page site. Host on **Cloudflare Pages** (free). Do not use a China mainland server.

## 1. GitHub

From this folder only (`aftercast/`), not the parent trading-dashboard repo:

```bash
cd aftercast
git init
git add index.html styles.css assets _headers .gitignore README.md
git commit -m "Add Aftercast site"
```

Create an empty GitHub repo named `aftercast`, then:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USER/aftercast.git
git push -u origin main
```

Repo root must contain `index.html`.

## 2. Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect to Git.
2. Select the `aftercast` repo.
3. Framework preset: **None**. Build command: empty. Output directory: `/` (leave default).
4. Deploy. Open the `*.pages.dev` URL and check the logo, FAQ, and mail links.

## 3. Domain

1. Buy `aftercast.com` (or `.co`) at Cloudflare Registrar.
2. Pages → Custom domains → add apex and `www`.
3. Email → Email Routing: `hello@aftercast.com` → your Gmail.

Then replace `hello@aftercast.com` in `index.html` if the domain is different, and push.

## Local preview

```bash
python3 -m http.server 8765
```

Open http://127.0.0.1:8765/
