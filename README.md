# My Blog

A tiny static blog: no build step, no dependencies. Posts are Markdown files.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 (opening index.html directly won't load posts).

## Write a post

1. Add `posts/<slug>.md`
2. Add an entry to the top of `posts.json` with the same `slug`, plus `title`, `date`, `tags`, `summary`.

## Customize

- Blog name: search and replace "My Blog" in the `.html` files.
- About page: `about.html`
- Colors and fonts: the top of `style.css`

## Publish (free)

- **GitHub Pages:** push this folder to a repo, then Settings → Pages → deploy from the main branch.
- **Netlify / Cloudflare Pages:** drag and drop this folder into their dashboard.
