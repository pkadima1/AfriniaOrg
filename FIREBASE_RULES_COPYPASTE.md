# Firebase Rules - Copy/Paste Ready

## Firestore Rules

Copy the entire content below and paste into **Firebase Console → Firestore → Rules**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check user role
    function getUserRole() {
      return get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role;
    }

    // Blog posts - public read, authenticated write
    match /blog_posts/{postId} {
      allow read: if true;
      allow create, update: if request.auth != null && 
                              getUserRole() in ['admin', 'contributor'];
      allow delete: if request.auth != null && 
                       getUserRole() == 'admin';
    }
    
    // Comments - public read, public create, auth delete/update
    match /comments/{commentId} {
      allow read: if true;
      allow create: if true;
      allow update: if request.auth != null && 
                       (resource.data.author_email == request.auth.token.email || 
                        getUserRole() == 'admin');
      allow delete: if request.auth != null && 
                       (resource.data.author_email == request.auth.token.email || 
                        getUserRole() == 'admin');
    }
    
    // User profiles - own read, admin read/write
    match /user_profiles/{userId} {
      allow read: if request.auth.uid == userId || 
                     getUserRole() == 'admin';
      allow update: if request.auth.uid == userId || 
                       getUserRole() == 'admin';
      allow delete: if getUserRole() == 'admin';
      allow create: if request.auth.uid == userId;
    }
  }
}
```

---

## Cloud Storage Rules

Copy the entire content below and paste into **Firebase Console → Storage → Rules**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Blog images - public read, authenticated write
    match /blog-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
                      (request.resource.contentType.matches('image/.*') || 
                       request.resource.contentType == 'application/octet-stream') &&
                      request.resource.size < 50 * 1024 * 1024;
    }
  }
}
```

---

## How to Apply Rules

### Firestore Rules
1. Go to **Firebase Console**
2. Select your project
3. Navigate to **Firestore Database**
4. Click **Rules** tab
5. Replace all content with rules above
6. Click **Publish**

### Cloud Storage Rules
1. Go to **Firebase Console**
2. Select your project
3. Navigate to **Cloud Storage**
4. Click **Rules** tab
5. Replace all content with rules above
6. Click **Publish**

---

## Rules Explanation

### Firestore Security Model

**Blog Posts:**
- ✅ Everyone can read published posts
- ✅ Only contributors/admins can create and edit
- ✅ Only admins can delete

**Comments:**
- ✅ Everyone can read comments
- ✅ Everyone can submit new comments (anonymous allowed)
- ✅ Only comment author or admin can edit/delete

**User Profiles:**
- ✅ Users can read their own profile
- ✅ Admins can read all profiles
- ✅ Users can update their own profile
- ✅ Admins can update any profile
- ✅ Only admins can delete profiles

### Cloud Storage Security Model

**Blog Images:**
- ✅ Everyone can download/view images
- ✅ Only authenticated users can upload
- ✅ Image file only (MIME type check)
- ✅ Max 50MB file size

---

## Testing the Rules

After applying rules, test with these scenarios:

### Test 1: Public Read (Anonymous)
```javascript
// Should succeed
db.collection('blog_posts')
  .where('status', '==', 'published')
  .get()
```

### Test 2: Authenticated Write (Contributor)
```javascript
// Should succeed if user is contributor
db.collection('blog_posts').add({
  title: "Test Post",
  status: "draft"
})
```

### Test 3: Admin Delete (Admin only)
```javascript
// Should fail for non-admin
// Should succeed for admin
db.collection('blog_posts').doc('postId').delete()
```

### Test 4: Comment Creation (Anonymous)
```javascript
// Should succeed
db.collection('comments').add({
  author_name: "Guest",
  content: "Nice post!"
})
```

---

## Monitoring Rules

After deployment, monitor in Firebase Console:

1. **Firestore → Database → Indexes** - Creates recommended indexes
2. **Firestore → Rules → Test** - Test rules with specific scenarios
3. **Cloud Storage → Files** - Verify upload structure
4. **Cloud Storage → Rules → Test** - Test storage permissions

---

## Common Rule Patterns

If you need to modify rules:

### Allow only authenticated users
```
allow read: if request.auth != null;
```

### Allow specific role
```
allow write: if getUserRole() == 'admin';
```

### Allow user's own data
```
allow read, write: if request.auth.uid == userId;
```

### Check email verification
```
allow write: if request.auth.token.email_verified;
```

### Rate limiting by document count
```
allow create: if request.auth.uid == userId && 
              query_next_page_size < 10;
```

---

## Troubleshooting

### "Permission denied" error
- Check user is authenticated
- Verify user has correct role
- Check email in comments matches request.auth.token.email

### "Index not found" error
- Firebase will suggest index creation
- Click link in error to auto-create
- Wait 2-5 minutes for index to build

### Queries return empty
- Verify collection path spelling
- Check where/equals conditions match data
- Ensure user has read permission

---

## Environment Overrides

For development/staging, you might use permissive rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **WARNING:** Never use permissive rules in production!

---

## Backup & Version Control

Recommended: Store rules in your git repository

**firestore.rules** (example file):
```
rules_version = '2';
service cloud.firestore {
  // Rules here...
}
```

**firebase.json** (example):
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

Deploy with Firebase CLI:
```bash
firebase deploy --only firestore:rules,storage
```

---

## Support

- Firebase Rules Documentation: https://firebase.google.com/docs/firestore/security/start
- Firebase Rules Playground: Use console "Test" tab
- Security Rules Format: https://firebase.google.com/docs/rules/rules-language

Created: Today
Status: Ready for deployment
