const fmtDate = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

document.getElementById("year").textContent = new Date().getFullYear();

async function loadPosts() {
  const res = await fetch("posts.json");
  const posts = await res.json();
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

async function renderIndex() {
  const list = document.getElementById("post-list");
  const tagBar = document.getElementById("tags");
  let posts;
  try {
    posts = await loadPosts();
  } catch {
    list.innerHTML = "<li>Couldn't load posts. Open this site through a web server (see README).</li>";
    return;
  }

  const active = new URLSearchParams(location.search).get("tag");
  const tags = [...new Set(posts.flatMap((p) => p.tags || []))].sort();
  tagBar.innerHTML =
    `<a href="index.html" class="tag${active ? "" : " on"}">All</a>` +
    tags.map((t) => `<a href="?tag=${encodeURIComponent(t)}" class="tag${t === active ? " on" : ""}">${esc(t)}</a>`).join("");

  const shown = active ? posts.filter((p) => (p.tags || []).includes(active)) : posts;
  list.innerHTML = shown.map((p) => `
    <li>
      <time datetime="${esc(p.date)}">${fmtDate(p.date)}</time>
      <h2><a href="post.html?p=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h2>
      ${p.summary ? `<p>${esc(p.summary)}</p>` : ""}
    </li>`).join("") || "<li>No posts with that tag yet.</li>";
}

async function renderPost() {
  const el = document.getElementById("post");
  const slug = new URLSearchParams(location.search).get("p");
  try {
    const meta = (await loadPosts()).find((p) => p.slug === slug);
    if (!meta) throw new Error("not found");
    const md = await (await fetch(`posts/${encodeURIComponent(slug)}.md`)).text();
    document.title = `${meta.title} · My Blog`;
    el.innerHTML = `
      <header>
        <time datetime="${esc(meta.date)}">${fmtDate(meta.date)}</time>
        <h1>${esc(meta.title)}</h1>
        <div class="tags">${(meta.tags || []).map((t) => `<a class="tag" href="index.html?tag=${encodeURIComponent(t)}">${esc(t)}</a>`).join("")}</div>
      </header>
      <div class="body">${marked.parse(md)}</div>`;
  } catch {
    el.innerHTML = "<h1>Post not found</h1><p>That post doesn't exist (yet).</p>";
  }
}
