# 🧪 QUICK TEST CHECKLIST

## ✅ DEPLOYMENT COMPLETED

- [x] Firestore Rules deployed to Firebase Console
- [x] Build verified (0 errors)
- [x] Linting verified (0 errors)
- [x] Dev server running on http://localhost:8082
- [x] All code changes in place and tested

---

## 🎯 MANUAL TESTS TO PERFORM

### Test 1: Signup Flow ⏱️ 5 minutes

1. Go to http://localhost:8082
2. Click **Sign Up** button
3. Fill form:
   - Full Name: `Test User`
   - Email: `testuser01@example.com`
   - Password: `Test@123456`
   - Confirm: `Test@123456`
4. Click **Create Account**

**✅ Success When:**
- Toast says "Account created!"
- Menu shows avatar (not "Sign Up" button)
- Page redirects to /profile automatically
- Console shows: `[Auth] Profile loaded after signup`
- **NO** "permission denied" errors

**❌ If Failed:**
- Check console for `[Auth]` logs
- Look for permission/security errors
- Verify Firestore rules were published
- Hard refresh: Ctrl+F5

---

### Test 2: Profile Page ⏱️ 3 minutes

1. After signup (should be on /profile)
2. Verify profile content loads
3. Navigate to http://localhost:8082/settings
4. Verify settings page loads

**✅ Success When:**
- Pages load without redirects
- No errors in console
- All content visible

---

### Test 3: Login Flow ⏱️ 5 minutes

1. Click avatar → **Logout**
2. Click **Sign In** button
3. Enter:
   - Email: `testuser01@example.com`
   - Password: `Test@123456`
4. Click **Sign In**

**✅ Success When:**
- Login succeeds
- Menu shows avatar
- Console shows: `[Auth] Profile loaded successfully`
- **NO** permission errors

---

### Test 4: Firestore Verification ⏱️ 3 minutes

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Project: `modified-hull-203004`
3. Firestore Database → Collections
4. Click `user_profiles`

**✅ Success When:**
- See your test user document
- Document has all required fields:
  - `email`
  - `full_name`
  - `role` (should be `viewer`)
  - `is_active` (should be `true`)
  - `created_at`
  - `updated_at`

---

## 📋 Console Log Checklist

When performing tests, you should see logs like:

### Signup Flow
```
[Auth] Starting sign up...
[Auth] User created: abc123...
[Auth] Profile creation initiated
[Auth] Waiting for profile after signup... attempt 1/20
[Auth] Profile loaded after signup, signup complete
```

### Login Flow
```
[Auth] Starting sign in...
[Auth] Waiting for profile... attempt 1/20
[Auth] Profile loaded successfully, sign in complete
```

### What NOT to See
```
❌ Missing or insufficient permissions
❌ FirebaseError: permission-denied
❌ Error fetching user profile
❌ Profile creation error (without retry)
```

---

## 🚨 Common Issues & Fixes

### "Missing or insufficient permissions"
**Cause:** Firestore rules not published  
**Fix:** Check Firebase Console → Firestore → Rules should show our rules

### Form won't submit
**Cause:** Validation error  
**Fix:** Ensure all fields filled, password 6+ chars, passwords match

### Can't see /profile page
**Cause:** User profile not created  
**Fix:** Check console for [Auth] logs, look for profile creation error

### Avatar doesn't show in menu
**Cause:** Auth state not updated  
**Fix:** Try hard refresh (Ctrl+F5) or sign out/in again

---

## ✨ When Complete

All tests pass when:
- ✅ Can signup without permission errors
- ✅ Profile page accessible
- ✅ Can login successfully
- ✅ Avatar shows in menu
- ✅ Firestore documents created
- ✅ No permission errors anywhere

**Total Time:** ~16 minutes for all tests

---

## 📞 Quick Reference

- **Dev Server:** http://localhost:8082
- **Firebase Console:** https://console.firebase.google.com
- **Project ID:** modified-hull-203004
- **Test Email:** testuser01@example.com
- **Test Password:** Test@123456

---

**Status: Ready to Test! 🚀**
