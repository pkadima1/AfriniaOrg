# Root cause: Documents not in the "right" Firestore

## What was happening

- The app **was** writing to Firestore in project `modified-hull-203004`.
- The Console URL showed the **same** project (`project/modified-hull-203004/firestore/.../data`).
- The database you had selected in the Console was **"nodematics"** (a named database), and it stayed empty.

## Cause

A single Firebase **project** can have **multiple Firestore databases**:

| Database   | When it's used |
|-----------|-----------------|
| `(default)` | Used when the app calls `getFirestore(app)` with **no** second argument. |
| Named (e.g. `nodematics`) | Used when you create another database in Console and select it, or when the app calls `getFirestore(app, 'nodematics')`. |

- The app was **not** setting a database id → it used **`(default)`**.
- You were viewing the **"nodematics"** database in the Console.
- So all writes went to **`(default)`**, while you were looking at **"nodematics"** → documents never appeared in the view you had open.

## Fix applied

1. **`.env`**  
   - `VITE_FIRESTORE_DATABASE_ID=nodematics`  
   - So the app uses the **nodematics** database instead of `(default)`.

2. **`src/integrations/firebase/config.ts`**  
   - Uses `VITE_FIRESTORE_DATABASE_ID` when initializing Firestore.  
   - In dev, logs which database and project are used so you can confirm.

## After the fix

1. Restart the dev server (so `.env` is picked up).
2. Create/save a document (e.g. blog post or profile); it should appear under the **nodematics** database in the Console.
3. In the browser console you should see:  
   `[Firebase] Firestore database: nodematics | Project: modified-hull-203004`.

## If your "right" database has a different id

- In Firebase Console, check the **database dropdown** (or database settings) for the **exact database id**.
- Set that in `.env`:  
  `VITE_FIRESTORE_DATABASE_ID=<that-id>`  
  (e.g. if the id is `app`, use `app`).

## Rules and indexes for the nodematics database

Rules and indexes are **per database**. Deploy them for the **nodematics** database:

- In Console: switch the database to **nodematics**, then edit/publish **Rules** and **Indexes** for that database.
- Or use Firebase CLI and target that database if your CLI version supports it.
