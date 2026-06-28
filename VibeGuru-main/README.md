# VibeGuru — AI Chief of Staff for the Last-Minute Life Saver

> Turn messy, stressful deadlines into hyper-actionable, customized, hour-by-hour plans using Google Gemini, Firebase Authentication, and Cloud Firestore.

---

## 🌟 The Core Problem

**The Last-Minute Life Saver** — Standard calendar and reminder apps are passive; they only tell you *when* a task is due, not *how* to get it done. VibeGuru proactively decomposes your messy goals, prioritizes them using the Eisenhower Matrix, maps out a precise schedule within your daily available time, and drafts a ready-to-use "headstart" document (e.g., initial outline, draft, or research skeleton).

---

## 🛠️ Key Product Features

### 1. Smart Date Picker & Validations
- **Friendly Date Selection**: Completely replaced plain-text inputs with a responsive calendar Date Picker.
- **Smart Prevention**: Built-in validation limits dates so users can never select a previous date, keeping schedules logically sound.

### 2. Available Time Slider & Progress Bar
- **Frictionless Input**: Swapped raw text input (e.g. typing "2 hours per day") with an elegant, visual Range Slider (1 to 24 hours).
- **Interactive Gauges**: Real-time visual progress indicator dynamically scales and updates as you adjust hours.

### 3. Speech Dictation & Inline Notifications
- **Hands-Free Task Entry**: Tap the voice microphone to dictate tasks or blocker details easily.
- **Smart Voice Alerts**: If mic permissions are blocked (such as inside sandboxed iframes), VibeGuru displays a non-intrusive, auto-expiring absolute toast alerting you how to open the app in a new window or adjust permissions.

### 4. Interactive Live Demo
- **Accurate Previews**: An updated animated interactive demo matching our exact production UI elements—including text fields, target deadlines, and the available hour slider—to give users a seamless onboarding journey.

### 5. Robust Cloud Persistence
- **Secured by Firebase**: Completely integrated Google Sign-In with Firebase Authentication for seamless access.
- **Durable Store**: Saves active plans, custom tasks, habit streaks, and reminders in real-time Firestore sync.

---

## 🚀 The VibeGuru Brain (4-Step Agent Workflow)

Whenever you submit a messy goal, our backend **Gemini 2.0 / 1.5** pipeline initiates an agentic 4-step sequence:

```
 ┌────────────────────────────────────────────────────────┐
 │ 1. DECOMPOSE   → Split into 3–5 bite-sized sub-tasks    │
 ├────────────────────────────────────────────────────────┤
 │ 2. PRIORITIZE  → Map to the Eisenhower Matrix          │
 ├────────────────────────────────────────────────────────┤
 │ 3. SCHEDULE    → Allocate tasks across available hours │
 ├────────────────────────────────────────────────────────┤
 │ 4. HEADSTART   → Generate ready-to-use draft or outline │
 └────────────────────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack & Google Technologies

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **AI Brain** | **Google Gemini** | Drives the intelligent 4-step decomposition & interactive chat coach |
| **Auth** | **Firebase Authentication** | Real-time secure Google Sign-In and session handling |
| **Database** | **Cloud Firestore** | NoSQL persistent document storage for plans, habits, and tasks |
| **Frontend** | **Next.js 15+ & React** | Server-side API routing, App Router layout, & fast client-side rendering |
| **Styling** | **Tailwind CSS & Motion** | Clean typography, smooth page transitions, and responsive mobile-first views |

---

## 📂 Project Directory Structure

```text
VibeGuru/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page with hero CTA
│   │   ├── login/page.tsx         # Google sign-in (Powered by Firebase Auth)
│   │   ├── dashboard/page.tsx     # Application control room (Plan / Replan / Chat)
│   │   └── api/
│   │       ├── plan/route.ts      # Core Gemini planning endpoint
│   │       ├── replan/route.ts    # Remaining schedule recalibration
│   │       └── chat/route.ts      # Active task chat helper
│   ├── components/
│   │   ├── PlanForm.tsx           # Interactive form with Date Picker & range slider
│   │   ├── PlanViewer.tsx         # Plan presentation & interactive checklist
│   │   ├── VoiceInputButton.tsx   # Speech recognition dictation with smart alerts
│   │   ├── HabitTracker.tsx       # Habit persistence and streak counter
│   │   └── RemindersWidget.tsx    # Synthesized speech reminders
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Firebase session wrapper
│   │   └── ThemeContext.tsx       # Dark & light canvas preferences
│   └── lib/
│       ├── prompts.ts             # VibeGuru Chief of Staff master instructions
│       ├── gemini.ts              # Server-side Google Gemini SDK client
│       └── firebase.ts            # Initialize client-side Firebase apps
```

---

## 💻 Local Quickstart

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Keys
Create a `.env.local` file in the root folder with:
```env
# Firebase configuration keys
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini API key (Server-only secret)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to experience VibeGuru!

---

## 🏆 Hackathon Submission Highlights

- **Agentic Value (20%)**: Multi-step decomposition, task weighting, and automatic day-by-day block planning.
- **Immediate Actionability (20%)**: Provides instant, copy-paste ready text, outline drafts, and reference resources to eliminate cold-start procrastination.
- **Dynamic Adaptability (20%)**: The "Replan" engine re-calibrates remaining tasks automatically when actual progress lags.
- **Google Cloud Synergy (15%)**: Perfect, unified integration of Gemini, Firebase Authentication, and Cloud Firestore.

---

### Developed By
**Padm Parmar** — Built for the **Vibe2Ship Hackathon**.
