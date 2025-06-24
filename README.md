
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
│   ├── profiles/      // Profile creation, edition, serach and group profiles retated components
│   ├── music/         // Music section (roles, details, media summary) and Media Section
│   ├── social/        // Posts, chat, comments, notifications, connections, ads
│   ├── ui/            // Buttons, Navbar, Input, etc.
│
├── context/           // Global state management (auth, music, profile, social, etc)
├── locales/           // i18n translations (en, es)
├── utils/             // Helper functions, constants, env handler
├── routes/            // App routes
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
- Profiles include a section with all posts made by the user, with infinite scrolling.

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

### 💡 Match Score System

- Automatically suggests musicians who may be a **good match** for collaboration based on:
  - Shared roles (e.g. both are guitarists or singers)  
  - Genre preferences  
  - Location proximity  
- Each match displays a **score percentage** indicating estimated compatibility  
- Scores are visualized with a **color-coded badge** and label:
  - High compatibility (70%+)
  - Medium (40–69%)
  - Low (10-39%)  
  - Very Low (<10%)  
- A dedicated **Discover Matches** page showcases the top matches for each user  
- Includes quick access to:
  - Profile overview  
  - Chat initiation  
  - Connection request

---

### 🔔 Notifications

- Notifications are generated via **Supabase triggers** (SQL)  
- Bell icon shows unread count  
- Notifications are marked as **read** when clicked  
- Group-related actions (joins, removals, role updates) trigger automatic notifications

---

### 🎸 Music Profile & Roles

- Users can define their musical identity by selecting roles:  
  **Instrumentalist, Singer, DJ, Producer, Composer**  
- Each role includes custom details (e.g. instruments played, vocal range, genres, influences, etc.)  
- Users can have multiple roles at once, all shown on their profile  
- Roles are managed from the profile’s music settings section

---

### 📂 Media Section

- Musicians can showcase embedded music and videos from:  
  **YouTube, Spotify, SoundCloud, Vimeo, direct audio/video links**  
- Each media entry includes:
  - A title (optional)  
  - The platform it's from  
  - An automatically embedded preview  
- Users can manage (add/edit/delete) their media from a dedicated `/media/:id` page  
- A preview of the first two items is shown in the profile’s "About" section  
- Media links are only editable by the profile owner

---

### 🧑‍🤝‍🧑 Musical Groups (Profile Groups)

- Musicians can create and manage collaborative **Group Profiles**  
- Each group has its own separate profile layout and identity  
- Group admins and managers can:
  - Invite or remove members  
  - Assign roles (admin, member, manager, musician)  
  - Define custom musical roles for each member (e.g. Guitarist, Vocalist, Composer)  
- Groups support automatic notifications for key actions (new member joins, role changes, etc.)  
- Groups can publish posts under their group identity (feature in progress)

---

### 📢 Musician Ads

- A dedicated **Ads** section allows musicians to:
  - Offer their skills to projects ("offering")  
  - Search for collaborators ("looking")  
- Ads include:
  - Type (Looking for / Offering)  
  - What is being searched or offered (e.g. Bassist)  
  - Genres involved (e.g. Rock, Funk)  
  - Location (e.g. Montevideo)  
  - Short description (max 100 characters)
- Each user’s profile displays their ads, and a global ads page lets you explore all posted ads  
- Ads have a preview card and a detail view  
- Only the creator of the ad can edit or delete it  

---

### 🌐 Internationalization

- Fully bilingual: **English** and **Spanish**  
- All UI text is managed via `react-i18next`  
- Translation files organized by feature for easy scaling and maintenance

---

### #️⃣ Hashtag System

- Users can add hashtags to their posts (up to 3 per post)  
- Hashtags are clickable throughout the app (in posts, Explore page, etc.)  
- Clicking a hashtag navigates to a dedicated hashtag page (`/hashtag/:tag`)  
- Users can toggle between posts and profiles related to that hashtag  

---

### 🔍 Advanced Search & Filters

- Easily search for posts and profiles using a single search bar  
- Filter musician profiles by country, city, role, and instrument  
- Switch between basic and advanced filters seamlessly  
- Interface is designed to work across both desktop and mobile devices

---

## 🔧 Future Improvements

- **Profile Groups (Band-Oriented):**
  - A new section called "Groups" is in development, where users can create and manage band-oriented profile groups.
  - Each group will have a distinct profile layout to differentiate it from individual user profiles.
  - The creator of the group will be the default admin and can assign roles to other associated members.
  - Each group can include multiple standard profiles and will have its own unique data and structure tailored to bands or collectives.

  ---

- **Internal Group Calendar:**
  - Events like rehearsals, gigs, or meetings.
  - Integration with `FullCalendar` or `react-big-calendar`.
  - Members can RSVP: "I'll attend" / "Can't make it".

  ---

- **Group Playlist and References:**
  - Link to external songs (Spotify, YouTube, etc.).
  - Optional in-app audio player for demos or references using `<audio>` or WaveSurfer.js.

  ---

- **Extended Group Bio and Portfolio:**
  - Group description, history, genre tags.
  - Media section: featured songs, images, social links.
  - Ideal for building a “press kit” feel on the profile.
  
  ---
  
- **Public Announcements from Groups:**
  - Groups can create public posts under their identity.
  - Useful for promoting shows, recruiting members, etc.
