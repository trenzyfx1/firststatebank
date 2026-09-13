/* =====================================================================
   First State Bank — Firebase Configuration
   ---------------------------------------------------------------------
   1. Go to Firebase Console → Project Settings → General → Your apps
   2. Under "Your apps", click the Web app (</>) icon
   3. Copy the firebaseConfig object from there
   4. Paste the real values below, replacing the YOUR_* placeholders
   ---------------------------------------------------------------------
   DO NOT commit real keys to a public repo. For Vercel, use
   Environment Variables and reference them here if you prefer.
   ===================================================================== */

// Firebase v10 modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage }    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

/* ---------------------------------------------------------------------
   ⬇⬇⬇  REPLACE THESE WITH YOUR REAL FIREBASE VALUES  ⬇⬇⬇
   --------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY_HERE",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "YOUR_APP_ID",
  measurementId:     "G-XXXXXXXXXX"    // optional — only if you enabled Analytics
};
/* ---------------------------------------------------------------------
   ⬆⬆⬆  REPLACE THESE WITH YOUR REAL FIREBASE VALUES  ⬆⬆⬆
   --------------------------------------------------------------------- */

// Initialise Firebase
const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

// Export instances for use in other scripts
export { app, auth, db, storage, firebaseConfig };

/* =====================================================================
   ADMIN CONFIG
   ---------------------------------------------------------------------
   Set the email that should be treated as the admin. Every other
   registered user is a normal user.
   ===================================================================== */
export const ADMIN_EMAIL = "admin@firststatebank.example";

/* =====================================================================
   SITE CONSTANTS
   ---------------------------------------------------------------------
   These are the default values. An admin can override them at runtime
   via admin.html → Site Settings, which writes to Firestore
   (collection: "config", doc: "site").
   ===================================================================== */
export const SITE_DEFAULTS = {
  currency:                "USD",
  minWithdrawal:           100,
  minTransfer:             1,
  personalInterest:        2,        // % per month
  corporateInterest:       3,        // % per month
  supportEmail:            "support@firststatebank.example",
  supportPhone:            "+1 (319) 555-0148",
  maintenanceMode:         false
};

/* =====================================================================
   FIRESTORE COLLECTION NAMES
   ---------------------------------------------------------------------
   Centralised so they're easy to rename in one place.
   ===================================================================== */
export const COLLECTIONS = {
  users:         "users",
  transactions:  "transactions",
  beneficiaries: "beneficiaries",
  tickets:       "tickets",
  config:        "config",
  loginHistory:  "loginHistory"
};