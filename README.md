# Studio AI - B2B Marketing Platform

**Studio AI** is a modern, AI-powered B2B marketing platform designed to streamline content creation, team collaboration, and campaign management. Built with React and Firebase, it offers a comprehensive suite of tools for marketing teams to plan, create, approve, and track their content.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.8-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)

## 🚀 Key Features

### 🤖 AI-Powered Content Creation

- **Smart Editor**: Rich text editor integrated with Google Gemini AI.
- **Content Generation**: Generate blog posts, social media captions, and marketing copy in seconds.
- **Multi-Platform Adaptation**: Automatically adapt content for LinkedIn, Twitter/X, and Instagram.

### 👥 Team Collaboration & Management

- **Role-Based Access**: Granular permissions for Admins, Marketers, Editors, and Viewers.
- **Team Invitations**: Invite members via email with specific roles.
- **Approval Workflows**: Streamlined review process for content before publishing.

### 📊 Campaign & Asset Management

- **Campaign Hub**: Organize content into strategic campaigns.
- **Asset Library**: Centralized storage for images and marketing assets.
- **Visual Calendar**: Drag-and-drop calendar for content scheduling.
- **Analytics Dashboard**: Track performance metrics and insights.

## 🛠️ Tech Stack

- **Frontend**: React, Vite
- **Styling**: Tailwind CSS, PostCSS
- **Backend & Auth**: Firebase (Authentication, Firestore, Storage)
- **AI Engine**: Google Generative AI (Gemini)
- **Animations**: GSAP
- **Charts**: Chart.js
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/studio-ai.git
   cd studio-ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Firebase and Gemini API keys:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

## 🔒 Security Rules

The application uses Firestore Security Rules to ensure data privacy and role-based access control. Ensure you deploy the rules provided in `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

## 🎨 Design System

The platform features a modern, "Human-Centric" design system:

- **Primary Color**: Vibrant Blue (`#3B82F6`)
- **Secondary Color**: Sky Blue (`#0EA5E9`)
- **Theme**: Dark mode optimized for professional workflows.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
