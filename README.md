# 🎵 TuneBridge

TuneBridge is a music-centered social network designed to connect musicians, artists, producers, and music lovers. Built entirely solo, this beta version offers a wide range of features to encourage artistic collaboration and community.

---

## 🧠 Technologies Used

TuneBridge is built with modern, efficient technologies:

- **Frontend:** React, Vite, React Router, React Context API  
- **Styling:** Tailwind CSS  
- **State Management:** React Context (`useContext`, `createContext`)  
- **Backend-as-a-Service:** [Supabase](https://supabase.com) (auth, database, storage, real-time)  
- **Internationalization:** i18next with `react-i18next`  
- **Deployment:** GitHub Pages with custom domain (`www.tunebridge.net`)  
- **CI/CD:** GitHub Actions  

---

## 📁 Project Structure

The codebase is modular and organized by feature domain:

```
src/
├── components/        // Feature-specific components
│   ├── auth/          // Login, SignUp, Account confirmation
│   ├── profiles/      // Profile creation, edition, group profiles
│   ├── music/         // Music roles and artist data
│   ├── social/        // Posts, chat, comments, notifications
│   ├── ui/            // Buttons, Navbar, Input, etc.
│
├── context/           // Global state management (auth, music, profile, social)
├── locales/           // i18n translations (en, es)
├── utils/             // Helper functions, constants, env handler
├── supabase.js        // Supabase client instance
└── i18n.js            // i18next config
```

---

## 🚀 Deployment

The project is deployed on GitHub Pages (`www.tunebridge.net`).  
The `deploy.yml` GitHub Action builds the project on every push to `main` and automatically updates the `deploy` branch (production).  
Secrets and environment variables (Supabase keys) are handled securely via GitHub Secrets.

---

## ✅ Key Features

### 🔐 Authentication & Profile Setup

- Users create accounts via username, email, and password.
- A confirmation email is sent. After clicking the link, users are prompted to complete their profile with:
  - First & Last Name
  - Country, City, Gender, Date of Birth
  - Editable Username
  - Short Bio (max 100 characters)
  - Profile Picture

---

### 📣 Posts System

- Users can create posts with:
  - Title and text content
  - Up to 3 hashtags
  - Up to 3 images
- Posts support likes and comments.
- Users can update or delete their own posts.

---

### 💬 Real-time Chat

- One-on-one and group chats
- Group chats:
  - Created by upgrading 1:1 conversations
  - Initial creator becomes admin
  - Admins can:
    - Rename the group
    - Change group avatar
    - Add users via a search bar
- Real-time messaging powered by Supabase

---

### 🔗 Connection System

- Users can **send connection requests** to others
- Upon approval, both users appear in each other’s **Connections** list
- Users can also **disconnect** via profile options

---

### 🔔 Notifications

- Notifications are generated via **Supabase triggers** (SQL)
- Bell icon shows unread count
- Notifications are marked as **read** when clicked

---

### 🌍 Internationalization

- Fully bilingual: **English** and **Spanish**
- All UI text is managed via `react-i18next`
- Translation files organized by feature (`auth.json`, `chat.json`, `profile.json`, etc.)

---

## 🔧 Future Improvements

- **Music Section:**
  - Support for more platforms beyond YouTube and Spotify (e.g., automatic embed and display logic based on the link, for both audio and video content).

- **Profile Groups (Band-Oriented):**
  - A new section called "Groups" is in development, where users can create and manage band-oriented profile groups.
  - Each group will have a distinct profile layout to differentiate it from individual user profiles.
  - The creator of the group will be the default admin and can assign roles to other associated members.
  - Each group can include multiple standard profiles and will have its own unique data and structure tailored to bands or collectives.
