# CodeVault 💻

**CodeVault** is a personal DSA command center built around **Striver's A2Z DSA Sheet**.

## Features
- 📊 Dashboard with A2Z progress, goals and streaks
- 🗺️ 17-step Striver A2Z roadmap
- ✅ Problem status: Not started / Attempted / Review / Solved
- 🔎 Search and difficulty filters
- 🔥 Activity heatmap and streak tracking
- 📈 Difficulty analytics
- 🎨 Dark / light workspace settings
- 🔐 Firebase email/password + Google authentication
- ☁️ Firestore cloud sync per user
- 💾 Local progress mode before sign-in
- 📱 Responsive UI

## Stack
React + Vite + Lucide React + Firebase Auth + Firestore

## Firebase setup
1. Create/keep the Firebase project `codevault-dc8ac`.
2. Enable **Authentication → Email/Password** and optionally **Google**.
3. Create a **Firestore Database**.
4. Deploy the included `firestore.rules` so each user can only access their own progress.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deployment
The app is ready for Vercel or Firebase Hosting. `firebase.json` contains Hosting + Firestore rules configuration.
