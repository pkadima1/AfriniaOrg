# Why blog content is empty in the Firestore doc

## Design

- **Firestore document size limit is 1 MiB.** To avoid hitting it, large blog body content is not stored in the Firestore document.
- **Small content** (under ~900 KB) is stored in the document field `content`.
- **Large content** (over ~900 KB) is stored in **Firebase Storage** at `blog-content/{postId}.html`, and the Firestore document keeps:
  - `content`: `""` (empty)
  - `content_storage_path`: `"blog-content/{postId}.html"`

So **“content not being recorded in the Firestore doc”** for large posts is **by design**: the content is recorded in Storage, and the doc only holds the path.

## What you see in the console

- In Firestore you see `content: ""` and `content_storage_path: "blog-content/....html"` → content is in Storage; the doc is correct.
- On the blog post page, if content does not load and you see a CORS message, the issue is **loading** (CORS), not recording.

## Fixing “content not loading” (CORS)

If the app runs on `localhost` and content is in Storage but does not load:

1. Apply CORS to the Storage bucket once (see [docs/STORAGE_CORS.md](./STORAGE_CORS.md)).
2. After that, blog content from Storage should load on the post page and in the admin editor.

## Saving when content is in Storage

When you **edit** a post whose content is in Storage:

- The app fetches the HTML from Storage and merges it into the post. If that fetch fails (e.g. CORS), the editor may show empty content.
- On save, the service **preserves** the existing `content_storage_path` when the saved content is empty (e.g. after a failed load), so the reference to the Storage file is not wiped.
