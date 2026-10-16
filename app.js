// Sections and their topics. Add a topic here and it gets its own button and heading,
// even before it has any posts.
const SECTIONS = {
  professional: {
    title: "Professional",
    blurb: "Thoughts on my work and the industry.",
    topics: ["AI"],
  },
  personal: {
    title: "Personal",
    blurb: "Everything else I'm curious about.",
    topics: ["America", "Healthcare", "Personal finance", "Space", "World"],
  },
};

const fmtDate = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const topicUrl = (section, topic) => `${section}.html?topic=${encodeURIComponent(topic)}`;

// "Personal · Healthcare" label, linking to the section and topic.
const placeLabel = (p) => {
  const sec = SECTIONS[p.section];
  if (!sec) return "";
  const topic = p.topic ? ` · <a href="${topicUrl(p.section, p.topic)}">${esc(p.topic)}</a>` : "";
  return `<span class="place"><a href="${p.section}.html">${sec.title}</a>${topic}</span>`;
};

const postItem = (p) => `
  <li>
    <div class="meta"><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time>${placeLabel(p)}</div>
    <h2><a href="post.html?p=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h2>
    ${p.summary ? `<p>${esc(p.summary)}</p>` : ""}
  </li>`;

const LOAD_ERROR = "<li>Couldn't load posts. If you just edited posts.json, check it for a missing or extra comma.</li>";

document.getElementById("year").textContent = new Date().getFullYear();

async function loadPosts() {
  const res = await fetch("posts.json", { cache: "no-cache" });
  const posts = (await res.json()).filter((p) => !p.hidden);
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

async function renderIndex() {
  const list = document.getElementById("post-list");
  try {
    list.innerHTML = (await loadPosts()).map(postItem).join("") || "<li>No posts yet.</li>";
  } catch {
    list.innerHTML = LOAD_ERROR;
  }
}

async function renderSection(key) {
  const sec = SECTIONS[key];
  const bar = document.getElementById("tags");
  const groups = document.getElementById("groups");
  const active = new URLSearchParams(location.search).get("topic");

  document.getElementById("section-title").textContent = sec.title;
  document.getElementById("section-blurb").textContent = sec.blurb;
  document.title = `${sec.title} · My Blog`;

  let posts;
  try {
    posts = (await loadPosts()).filter((p) => p.section === key);
  } catch {
    groups.innerHTML = `<ol class="post-list">${LOAD_ERROR}</ol>`;
    return;
  }

  // Topics from the list above, plus any a post uses that isn't listed yet.
  const topics = [...new Set([...sec.topics, ...posts.map((p) => p.topic).filter(Boolean)])];
  bar.innerHTML =
    `<a href="${key}.html" class="tag${active ? "" : " on"}">All</a>` +
    topics.map((t) => `<a href="${topicUrl(key, t)}" class="tag${t === active ? " on" : ""}">${esc(t)}</a>`).join("");

  // In the "All" view, skip topics with no posts; a selected topic always shows.
  const shown = active ? [active] : topics.filter((t) => posts.some((p) => p.topic === t));
  groups.innerHTML = shown.map((t) => {
    const inTopic = posts.filter((p) => p.topic === t);
    return `
      <section class="topic-group">
        <h2 class="topic-heading">${esc(t)}</h2>
        <ol class="post-list">${inTopic.map(postItem).join("") || `<li class="empty">Nothing here yet.</li>`}</ol>
      </section>`;
  }).join("") || `<ol class="post-list"><li class="empty">Nothing here yet. Check back soon.</li></ol>`;
}

async function renderPost() {
  const el = document.getElementById("post");
  const slug = new URLSearchParams(location.search).get("p");
  try {
    const meta = (await loadPosts()).find((p) => p.slug === slug);
    if (!meta) throw new Error("not found");
    const md = await (await fetch(`posts/${encodeURIComponent(slug)}.md`, { cache: "no-cache" })).text();
    document.title = `${meta.title} · My Blog`;
    el.innerHTML = `
      <header>
        <div class="meta"><time datetime="${esc(meta.date)}">${fmtDate(meta.date)}</time>${placeLabel(meta)}</div>
        <h1>${esc(meta.title)}</h1>
      </header>
      <div class="body">${marked.parse(md)}</div>`;
  } catch {
    el.innerHTML = "<h1>Post not found</h1><p>That post doesn't exist (yet).</p>";
  }
}
