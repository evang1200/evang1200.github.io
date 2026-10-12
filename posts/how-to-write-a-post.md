Every post is a Markdown file in the `posts/` folder, plus one entry in `posts.json`.

## 1. Write the post

Create `posts/my-new-post.md` and write in Markdown:

```markdown
Some **bold** text, a [link](https://example.com), and a list:

- one
- two
```

## 2. Add it to the list

Open `posts.json` and add an entry at the top:

```json
{
  "slug": "my-new-post",
  "title": "My new post",
  "date": "2026-10-20",
  "tags": ["books"],
  "summary": "One sentence shown on the home page."
}
```

The `slug` must match the file name (without `.md`). Tags become filter buttons on the home page automatically.

> Images work too: put them in an `images/` folder and write `![alt text](images/photo.jpg)`.
