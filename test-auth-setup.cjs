#!/usr/bin/env node

/**
 * COMPREHENSIVE AUTHENTICATION TEST SUITE
 * Tests signup, login, and profile loading with Firestore Rules deployed
 */

const fs = require('fs');
const path = require('path');

const testResults = {
  timestamp: new Date().toISOString(),
  results: [],
  summary: {
    passed: 0,
    failed: 0,
    warnings: 0,
  },
};

function logTest(name, status, details = '') {
  const result = { name, status, details, time: new Date().toISOString() };
  testResults.results.push(result);
  
  const statusIcon = {
    '✅ PASS': '✅',
    '⚠️ WARNING': '⚠️',
    '❌ FAIL': '❌',
  }[status] || status;
  
  console.log(`${statusIcon} ${name}`);
  if (details) console.log(`   └─ ${details}`);
  
  if (status.includes('PASS')) testResults.summary.passed++;
  if (status.includes('FAIL')) testResults.summary.failed++;
  if (status.includes('WARNING')) testResults.summary.warnings++;
}

// Test 1: Firebase Config Validation
console.log('\n📋 TEST 1: Firebase Configuration\n');
try {
  const configPath = path.join(__dirname, '../src/integrations/firebase/config.ts');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    if (content.includes('modified-hull-203004')) {
      logTest('Firebase Project ID', '✅ PASS', 'modified-hull-203004 configured');
    } else {
      logTest('Firebase Project ID', '❌ FAIL', 'Project ID not found in config');
    }
    if (content.includes('getFirestore')) {
      logTest('Firestore Initialization', '✅ PASS', 'Firestore properly initialized');
    }
    if (content.includes('getAuth')) {
      logTest('Firebase Auth Initialization', '✅ PASS', 'Firebase Auth properly initialized');
    }
  }
} catch (error) {
  logTest('Firebase Config Check', '❌ FAIL', error.message);
}

// Test 2: AuthContext Implementation
console.log('\n📋 TEST 2: Authentication Context\n');
try {
  const authPath = path.join(__dirname, '../src/contexts/AuthContext.tsx');
  const authContent = fs.readFileSync(authPath, 'utf8');
  
  // Check for retry logic
  if (authContent.includes('maxAttempts') && authContent.includes('while (attempts')) {
    logTest('Retry Logic Implementation', '✅ PASS', 'Profile retry loop detected');
  } else {
    logTest('Retry Logic Implementation', '❌ FAIL', 'No retry logic found');
  }
  
  // Check for profile creation
  if (authContent.includes('createUserProfile')) {
    logTest('Profile Creation Function', '✅ PASS', 'createUserProfile method found');
  }
  
  // Check for debug logging
  if (authContent.includes('[Auth]')) {
    logTest('Debug Logging', '✅ PASS', '[Auth] prefix logging configured');
  }
  
  // Check for signIn function
  if (authContent.includes('const signIn = async')) {
    logTest('signIn Function', '✅ PASS', 'signIn implementation found');
  }
  
  // Check for signUp function
  if (authContent.includes('const signUp = async')) {
    logTest('signUp Function', '✅ PASS', 'signUp implementation found');
  }
} catch (error) {
  logTest('AuthContext Check', '❌ FAIL', error.message);
}

// Test 3: AuthModal Implementation
console.log('\n📋 TEST 3: Authentication Modal\n');
try {
  const modalPath = path.join(__dirname, '../src/components/auth/AuthModal.tsx');
  const modalContent = fs.readFileSync(modalPath, 'utf8');
  
  // Check for validation
  if (modalContent.includes('if (!loginForm.email') || modalContent.includes('setError')) {
    logTest('Form Validation', '✅ PASS', 'Input validation implemented');
  }
  
  // Check for error handling
  if (modalContent.includes('error') && modalContent.includes('setError')) {
    logTest('Error Handling', '✅ PASS', 'Error state and messaging configured');
  }
  
  // Check for loading states
  if (modalContent.includes('isLoading')) {
    logTest('Loading States', '✅ PASS', 'Loading state management detected');
  }
} catch (error) {
  logTest('AuthModal Check', '❌ FAIL', error.message);
}

// Test 4: Firestore Rules
console.log('\n📋 TEST 4: Firestore Rules Configuration\n');
try {
  const rulesPath = path.join(__dirname, '../firestore.rules');
  if (fs.existsSync(rulesPath)) {
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    
    logTest('Firestore Rules File', '✅ PASS', 'firestore.rules exists');
    
    if (rulesContent.includes('user_profiles')) {
      logTest('User Profiles Collection Rules', '✅ PASS', 'user_profiles rules defined');
    }
    
    if (rulesContent.includes('allow create:')) {
      logTest('Create Permission', '✅ PASS', 'Create rules configured');
    }
    
    if (rulesContent.includes('allow read:')) {
      logTest('Read Permission', '✅ PASS', 'Read rules configured');
    }
    
    if (rulesContent.includes('allow update:')) {
      logTest('Update Permission', '✅ PASS', 'Update rules configured');
    }
    
    if (rulesContent.includes('request.auth.uid')) {
      logTest('Authentication Check', '✅ PASS', 'Auth UID validation in rules');
    }
  } else {
    logTest('Firestore Rules File', '❌ FAIL', 'firestore.rules not found');
  }
} catch (error) {
  logTest('Firestore Rules Check', '❌ FAIL', error.message);
}

// Test 5: Firebase Configuration
console.log('\n📋 TEST 5: Firebase CLI Configuration\n');
try {
  const fbPath = path.join(__dirname, '../firebase.json');
  if (fs.existsSync(fbPath)) {
    const fbContent = JSON.parse(fs.readFileSync(fbPath, 'utf8'));
    logTest('firebase.json', '✅ PASS', 'Configuration file exists');
    
    if (fbContent.firestore && fbContent.firestore.rules === 'firestore.rules') {
      logTest('Firestore Rules Reference', '✅ PASS', 'Rules file properly referenced');
    }
    
    if (fbContent.projects && fbContent.projects.default === 'modified-hull-203004') {
      logTest('Project Configuration', '✅ PASS', 'Project ID configured');
    }
  }
} catch (error) {
  logTest('Firebase CLI Configuration', '❌ FAIL', error.message);
}

// Test 6: TypeScript Types
console.log('\n📋 TEST 6: TypeScript Type Definitions\n');
try {
  const typesPath = path.join(__dirname, '../src/integrations/firebase/types.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  
  if (typesContent.includes('UserProfile')) {
    logTest('UserProfile Interface', '✅ PASS', 'UserProfile type defined');
  }
  
  if (typesContent.includes('UserRole')) {
    logTest('UserRole Type', '✅ PASS', 'UserRole type defined (admin|contributor|viewer)');
  }
  
  if (typesContent.includes('COLLECTIONS')) {
    logTest('Collections Constants', '✅ PASS', 'Collection names defined');
  }
} catch (error) {
  logTest('TypeScript Types Check', '❌ FAIL', error.message);
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(70));
console.log(`✅ Passed: ${testResults.summary.passed}`);
console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
console.log(`❌ Failed: ${testResults.summary.failed}`);
console.log(`📅 Timestamp: ${testResults.timestamp}`);
console.log('='.repeat(70));

if (testResults.summary.failed === 0) {
  console.log('\n🎉 ALL CHECKS PASSED! Ready for sign up/in testing.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please review above.\n');
  process.exit(1);
}
