/* =====================================================================
   First State Bank — Firebase Configuration
   ---------------------------------------------------------------------
   Project:    first-state-bank-241b5
   Admin:      firststatebank@gmail.com
   ---------------------------------------------------------------------
   These keys are client-side identifiers, not secrets. To protect the
   project, restrict the API key in Google Cloud Console → APIs &
   Services → Credentials → HTTP referrers.
   ===================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage }    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { getAnalytics, isSupported as analyticsSupported }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

/* ---------------------------------------------------------------------
   REAL CONFIG — First State Bank
   --------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey:            "AIzaSyAcJjlIv8vUVuME2RzLn4qcZNR-UVmod5U",
  authDomain:        "first-state-bank-241b5.firebaseapp.com",
  projectId:         "first-state-bank-241b5",
  storageBucket:     "first-state-bank-241b5.firebasestorage.app",
  messagingSenderId: "1090005337887",
  appId:             "1:1090005337887:web:df8f2a2b00de853935d22a",
  measurementId:     "G-JEVQPGBB49"
};

/* ---------------------------------------------------------------------
   Initialise
   --------------------------------------------------------------------- */
const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

// Analytics is optional and can fail on http://localhost in some browsers
let analytics = null;
analyticsSupported().then(function(ok){ if(ok) analytics = getAnalytics(app); }).catch(function(){});

export { app, auth, db, storage, analytics, firebaseConfig };

/* =====================================================================
   ADMIN CONFIG
   ---------------------------------------------------------------------
   This email is the ONLY account treated as admin. Any other registered
   user is a normal user. Also change this in firestore.rules.
   ===================================================================== */
export const ADMIN_EMAIL = "firststatebank@gmail.com";

/* =====================================================================
   SITE CONSTANTS (defaults — admin can override via Site Settings)
   ===================================================================== */
export const SITE_DEFAULTS = {
  currency:           "USD",
  minWithdrawal:      100,
  minTransfer:        1,
  personalInterest:   2,
  corporateInterest:  3,
  supportEmail:       "firststatebank@gmail.com",
  supportPhone:       "+44 (0) 7344 658784",
  maintenanceMode:    false
};

/* =====================================================================
   FIRESTORE COLLECTION NAMES
   ===================================================================== */
export const COLLECTIONS = {
  users:         "users",
  transactions:  "transactions",
  beneficiaries: "beneficiaries",
  tickets:       "tickets",
  config:        "config",
  loginHistory:  "loginHistory"
};