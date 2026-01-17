# 🚀 AdVantage AI: Intelligent Marketing Studio (PS007)

**Problem Statement ID:** PS007  
**Theme:** Business, Finance & Digital Economy  
**Goal:** A unified, AI-powered platform to streamline campaign planning, content creation, and social media scheduling.

---

## 🏗️ 1. High-Level Architecture

The application is built as a **Single Page Application (SPA)** with a focus on real-time collaboration and role-based workflows.

**Core Workflow:**
`Plan (Marketer)` → `Draft (Creator)` → `Review (Editor)` → `Schedule (Marketer)` → `Publish (System)`

---

## 🧩 2. Functional Modules

### A. Authentication & User Roles (RBAC)
* **System:** Firebase Authentication (Email/Password).
* **Roles:**
    1.  **Creator:** Can create drafts, upload assets, and submit for review.
    2.  **Editor:** Can edit text, add comments, and approve/reject content.
    3.  **Marketer (Admin):** Can create campaigns, manage users, and schedule/publish posts.
* *MVP Feature:* A "Dev Mode" toggle in the UI to instantly switch roles for the demo video.

### B. Campaign Management Engine
* **Dashboard:** Centralized view of all active campaigns.
* **Kanban Board:** Drag-and-drop interface tracking content status:
    * `To Do` ➔ `In Progress` ➔ `In Review` ➔ `Approved` ➔ `Scheduled`

### C. The "Smart" Editor (Core Feature)
* **Rich Text Interface:** A clean writing environment for captions, blogs, and ad copy.
* **AI Copilot:** Sidebar integration for generating content, headlines, and hashtags.
* **Collaboration:** Comment threads linked to specific content pieces.

### D. Asset Management (DAM)
* **Central Library:** Grid view of uploaded images/videos.
* **Filtering:** Filter assets by file type or Campaign tag.
* **Usage:** "Insert from Library" button directly within the Editor.

### E. Social Scheduler
* **Calendar View:** Full monthly view showing scheduled posts.
* **Platform Preview:** Live mockup of how the post will look on Twitter/LinkedIn/Instagram.
* **Mock Publisher:** Simulates the API call to social networks and returns a "Success" toast notification.

---

## 🤖 3. AI & Machine Learning Integration
[cite_start]*Designed to score maximum points on "Innovativeness" and "AI & ML Integration"[cite: 94, 114].*

1.  **Generative Copywriting Agent (Gemini API):**
    * **Input:** Topic + Tone (e.g., "Summer Sale", "Excited").
    * **Output:** Generates 3 variations of ad copy tailored for specific platforms (Short for Twitter, Professional for LinkedIn).
2.  **Smart Hashtag Recommender:**
    * Analyzes the final drafted text and suggests 5 relevant, high-traffic hashtags.
3.  **Sentiment Analyzer (Optional):**
    * Scans the draft text and predicts audience reaction (Positive/Neutral/Negative).

---

## 💾 4. Data Entities (Database Schema)

**Database:** Firebase Firestore (NoSQL)

### `users` collection
```json
{
  "uid": "user_123",
  "name": "Alex Creator",
  "email": "alex@advantage.ai",
  "role": "CREATOR", // "EDITOR", "MARKETER"
  "avatarUrl": "..."
}