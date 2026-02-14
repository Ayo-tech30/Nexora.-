# 🔥 FIREBASE SETUP - STEP BY STEP GUIDE

## ⚠️ IMPORTANT: You MUST replace the placeholder values in firebase-config.json

The `firebase-config.json` file I created has placeholder values. Follow these steps to get your REAL Firebase credentials:

---

## 📋 STEP 1: Create Firebase Project

1. Go to: **https://console.firebase.google.com/**
2. Click **"Add project"** (or "Create a project")
3. Enter a project name: `nexora-bot` (or whatever you want)
4. Click **Continue**
5. **Disable Google Analytics** (not needed)
6. Click **Create project**
7. Wait for setup to complete
8. Click **Continue**

---

## 📋 STEP 2: Enable Realtime Database

1. In the left sidebar, click **"Build"**
2. Click **"Realtime Database"**
3. Click **"Create Database"**
4. Choose your location (closest to you):
   - US: `us-central1`
   - Europe: `europe-west1`
   - Asia: `asia-southeast1`
5. Select **"Start in test mode"** (for now)
6. Click **Enable**
7. **COPY the database URL** shown (e.g., `https://nexora-bot-xxxxx.firebaseio.com`)
8. Save this URL - you'll need it later!

---

## 📋 STEP 3: Get Your Service Account Key

1. Click the **⚙️ Gear icon** (top left, next to "Project Overview")
2. Click **"Project settings"**
3. Go to **"Service accounts"** tab
4. You'll see: "Firebase Admin SDK" section
5. Make sure **Node.js** is selected
6. Click **"Generate new private key"** button
7. A warning popup appears - Click **"Generate key"**
8. A JSON file will download (e.g., `nexora-bot-firebase-adminsdk-abc123.json`)

---

## 📋 STEP 4: Replace the Config File

You have 2 options:

### OPTION A: Replace the Entire File (Easiest)

1. Find the downloaded JSON file on your computer
2. Rename it to: `firebase-config.json`
3. **REPLACE** the existing `firebase-config.json` in the nexora-bot folder with this new file
4. **Make sure it has the `databaseURL` field** - if not, add it:
   ```json
   {
     "type": "service_account",
     ...
     "databaseURL": "https://YOUR-PROJECT-ID.firebaseio.com"
   }
   ```

### OPTION B: Manually Fill in the Template

Open `firebase-config.json` and replace these values with your actual data from the downloaded file:

| Field | What to Replace | Example |
|-------|----------------|---------|
| `project_id` | YOUR_PROJECT_ID_HERE | `nexora-bot-12345` |
| `private_key_id` | YOUR_PRIVATE_KEY_ID_HERE | `abc123def456ghi789...` |
| `private_key` | YOUR_PRIVATE_KEY_HERE | The entire key between BEGIN and END (keep the `\n` characters!) |
| `client_email` | YOUR_PROJECT_ID and xxxxx | `firebase-adminsdk-abc12@nexora-bot-12345.iam.gserviceaccount.com` |
| `client_id` | YOUR_CLIENT_ID_HERE | `123456789012345678901` |
| `client_x509_cert_url` | YOUR_SERVICE_ACCOUNT_EMAIL | Full URL from downloaded file |
| `databaseURL` | YOUR_PROJECT_ID | `https://nexora-bot-12345-default-rtdb.firebaseio.com` |

---

## 📋 STEP 5: Verify Your Config

Your final `firebase-config.json` should look like this (with your actual values):

```json
{
  "type": "service_account",
  "project_id": "nexora-bot-12345",
  "private_key_id": "1a2b3c4d5e6f7g8h9i0j...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCB...(VERY LONG)...xyz\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc12@nexora-bot-12345.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-abc12%40nexora-bot-12345.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com",
  "databaseURL": "https://nexora-bot-12345-default-rtdb.firebaseio.com"
}
```

**CRITICAL CHECKS:**
- ✅ `private_key` contains `\n` characters (do NOT remove them!)
- ✅ `databaseURL` field exists and matches your database URL
- ✅ `project_id` matches throughout the file
- ✅ No placeholder text like "YOUR_PROJECT_ID_HERE" remains

---

## 📋 STEP 6: Test Your Setup

1. Open terminal in the nexora-bot folder
2. Run:
   ```bash
   npm install
   npm start
   ```

3. **Success indicators:**
   - ✅ No Firebase errors in console
   - ✅ Bot connects to WhatsApp
   - ✅ You can use commands like `.reg` and `.balance`

4. **Error indicators:**
   - ❌ "Firebase Database URL not found" → Add `databaseURL` field
   - ❌ "Invalid service account" → Re-download key from Firebase
   - ❌ "ENOENT: no such file" → File is in wrong location

---

## 🔒 STEP 7: Secure Your Database (Important!)

1. Go back to Firebase Console
2. Click **Realtime Database** → **Rules** tab
3. Replace with these rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      "$uid": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "groups": {
      "$groupId": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "mods": {
      ".read": true,
      ".write": "auth != null"
    },
    "guardians": {
      ".read": true,
      ".write": "auth != null"
    },
    "cardSpawns": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

4. Click **Publish**

---

## 🎯 FOR REPLIT USERS:

Instead of using the file, add your config as a Secret:

1. In Replit, click **🔒 Secrets** (lock icon in sidebar)
2. Click **"New Secret"**
3. Key: `FIREBASE_CONFIG`
4. Value: **Paste the ENTIRE contents** of your downloaded JSON file
5. Click **Add Secret**
6. Delete the `firebase-config.json` file from your project

The bot will automatically use the secret instead!

---

## ❌ Common Errors & Solutions

### "Firebase Database URL not found"
**Solution:** Add this to your `firebase-config.json`:
```json
"databaseURL": "https://your-project-id.firebaseio.com"
```

### "Invalid service account"
**Solution:** Download a fresh key from Firebase and replace the file

### "Permission denied"
**Solution:** Check your database rules (Step 7)

### Private key format error
**Solution:** Make sure the private key has `\n` characters (newlines), not actual line breaks

---

## ✅ You're Done!

Once your `firebase-config.json` has the correct values:
- The bot will save all user data
- Cards, balance, profile persist across restarts
- Group settings are remembered
- Mods and guardians are stored

**Next step:** Run the bot and pair it with WhatsApp! 🚀

---

## 🆘 Need Help?

If you're stuck:
1. Make sure you followed every step
2. Double-check your `databaseURL` is correct
3. Verify the JSON file is valid (use jsonlint.com)
4. Contact: wa.me/2349049460676
