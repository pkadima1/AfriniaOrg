# Firebase Storage CORS Setup

Uploads and **blog content fetches** from the browser require **CORS** on the Google Cloud Storage bucket. Without it:

- **Uploads** (featured image, blog content) from `http://localhost:8081` are blocked.
- **Blog view page** fails with "Failed to fetch" when loading HTML from Storage (`content_storage_path`).

## One-time setup

1. **Install Google Cloud SDK** (if needed): https://cloud.google.com/sdk/docs/install  
2. **Log in**:  
   `gcloud auth login`  
3. **Set project**:  
   `gcloud config set project modified-hull-203004`  
4. **Apply CORS** (from project root). The app uses the default bucket (`.firebasestorage.app`):

   ```bash
   gcloud storage buckets update gs://modified-hull-203004.firebasestorage.app --cors-file=storage-cors.json --project=modified-hull-203004
   ```

   If you use the legacy bucket instead:
   ```bash
   gcloud storage buckets update gs://modified-hull-203004.appspot.com --cors-file=storage-cors.json --project=modified-hull-203004
   ```

Or with **gsutil**:  
`gsutil cors set storage-cors.json gs://modified-hull-203004.firebasestorage.app`

## What’s in `storage-cors.json`

- **Origins**: localhost (8081, 5173), 127.0.0.1, and your Firebase Hosting URLs.
- **Methods**: GET, HEAD, PUT, POST, DELETE, OPTIONS (needed for uploads and for fetching blog content).
- **Response headers**: Content-Type, x-goog-resumable, Authorization, etc.

After applying CORS, reload the app: blog list, blog view (content from Storage), and uploads should work from localhost.
