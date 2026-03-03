# Integrity

AI-powered food ingredient scanner that analyzes packaged food labels and provides health risk assessments.

## Features

- 📸 **Scan Ingredients** — Upload or capture images of food ingredient labels
- 🧠 **AI Analysis** — Gemini 2.5 Flash extracts and classifies every ingredient
- 🎯 **Risk Scoring** — 0–100 health risk score with green/yellow/red badges
- 🔍 **Ingredient Breakdown** — Categorizes additives, allergens, sweeteners, preservatives
- 📂 **History** — All past scans saved and accessible
- 🔐 **Authentication** — Email/password and Google OAuth
- 🌙 **Dark Mode** — Light and dark theme support

## Tech Stack

- **Frontend:** React 19, Vite 6, React Router 7
- **AI:** Google Gemini 2.5 Flash (`@google/genai`)
- **Backend:** Firebase Auth + Cloud Firestore
- **Icons:** Lucide React
- **PWA:** vite-plugin-pwa

## Setup

1. Clone the repo
   ```bash
   git clone https://github.com/fevnax/integrity.git
   cd integrity
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create `.env` from the template
   ```bash
   cp .env.example .env
   ```

4. Fill in your API keys in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_GEMINI_API_KEY=your_gemini_key
   ```

5. Start the dev server
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

Output is in `dist/`. Deploy to Vercel, Render, or Netlify — set the environment variables in the service dashboard.

## Creators

- **Vedant P.** — [GitHub](https://github.com/Vp9191) · [LinkedIn](https://www.linkedin.com/in/vedant-link)
- **Harshvardhan P.** — [GitHub](https://github.com/fevnax) · [LinkedIn](https://www.linkedin.com/in/fevnax)
- **Ritik J.** — [GitHub](https://github.com/Ritikjagtap11) · [LinkedIn](https://linkedin.com/in/ritik-jagtap-link)
