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

### 👥 Group Chat Management

- All group management (avatar/title edit, participant actions) is handled in a dedicated Group Overview modal for clarity and ease of use.
- Robust participant management: add, promote to admin, remove, and leave group, all with real-time UI updates and optimistic cache handling.
- Direct chat actions (visit profile, convert to group, delete/leave) are available in a right-aligned three-dots menu for a clean interface.
- Participant search and add is available in group chats, with instant feedback and confirmation dialogs for sensitive actions.

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

### #️⃣ Hashtag System

- Users can add hashtags to their posts (up to 3 per post).
- Hashtags are clickable throughout the app (in posts, Explore page, etc.).
- Clicking a hashtag navigates to a dedicated hashtag page (`/hashtag/:tag`).
- The hashtag page displays all posts and profiles related to that hashtag.
- Users can toggle between posts and profiles using a navigation bar on the hashtag page.
- Hashtag links are formatted for user-friendly navigation (no # in the URL, but # in the label).

---

### 🔍 Advanced Search & Filters

- Easily search for posts and profiles using a single search bar.
- Filter musician profiles by country, city, role, and instrument to find exactly who you need.
- Instantly switch between basic and advanced search with a simple filter toggle.
- All filter options and search results are available in both English and Spanish.
- Enjoy a modern, user-friendly interface with clear feedback and fast results.

---

## 🔧 Future Improvements

- **Music Section:**
  - Support for more platforms beyond YouTube and Spotify (e.g., automatic embed and display logic based on the link, for both audio and video content).

- **Profile Groups (Band-Oriented):**
  - A new section called "Groups" is in development, where users can create and manage band-oriented profile groups.
  - Each group will have a distinct profile layout to differentiate it from individual user profiles.
  - The creator of the group will be the default admin and can assign roles to other associated members.
  - Each group can include multiple standard profiles and will have its own unique data and structure tailored to bands or collectives.
