# 🎵 TuneBridge

TuneBridge is a music-centered social network designed to connect musicians, artists, producers, and music lovers. Built entirely solo, this beta version offers a wide range of features to encourage artistic collaboration and community.

---

## 🧠 Technologies Used

TuneBridge is built with a modern tech stack that enables rich interactivity, real-time collaboration, and strong scalability:

- **Frontend:**  
  React 19, Vite, React Router v7  
  React Context API for global state  
  TanStack React Query for async state and caching  
  Framer Motion and GSAP for animations  
  MUI (Material UI) for date pickers and select UI components  
  Filepond for file uploads

- **Styling:**  
  Tailwind CSS 4  
  GitHub Markdown CSS for rendering rich content

- **Form & Validation:**  
  React Hook Form  
  PropTypes

- **Backend-as-a-Service:**  
  Supabase (Auth, Realtime DB, Storage, Edge Functions)

- **Internationalization (i18n):**  
  i18next with react-i18next  
  Language detection and ISO country helpers

- **Calendar & Events:**  
  FullCalendar (DayGrid, TimeGrid, Interaction plugins)

- **Media & Content:**  
  React Player (for embedded YouTube, Spotify, SoundCloud, etc.)  
  React Markdown

- **Utility Libraries:**  
  UUID for unique IDs  
  Date-fns for date handling  
  Country-State-City for location data  
  Lottie React for animations

- **Developer Experience:**  
  ESLint, React Refresh, Why Did You Render  
  GitHub Actions for CI/CD  
  Deployed via GitHub Pages (`www.tunebridge.net`)


---

## 📁 Project Structure

The codebase is modular and organized by feature domain:



```
.
├── public/                       # Static assets served as‑is
│   ├── favicon/                  # Multi–size icons & manifest
│   └── for-landing-page/         # Optimised images for the marketing page
│       ├── audience/
│       └── features/
│
├── src/                          # Application code
│   ├── assets/                   # Lottie JSON, SVG, misc. media used in‑app
│   ├── components/               # UI split by domain / feature
│   │   ├── auth/                 # Sign‑up, log‑in, password reset, …
│   │   ├── groups/               # Band/group specific components
│   │   ├── landing-page/         # Public marketing site
│   │   ├── music/                # Role editors, media sections, etc.
│   │   ├── profiles/             # Profile cards, headers, group sub‑folder
│   │   │   └── group/
│   │   ├── settings/             # Privacy / notification settings UIs
│   │   ├── social/               # Posts, chat, ads, comments, notifications
│   │   │   ├── ads/
│   │   │   ├── chat/             # Real‑time messaging widgets & helpers
│   │   │   ├── comments/
│   │   │   └── skeletons/        # Loading placeholders
│   │   └── ui/                   # Generic, reusable primitives
│   │       └── styles/           # CSS helpers for shiny text, stars, …
│   │
│   ├── context/                  # React Context / TanStack Query wrappers
│   │   ├── AuthContext.jsx
│   │   ├── groups/
│   │   ├── music/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── social/
│   │
│   ├── locales/                  # i18n resources (en ▸, es ▸)
│   ├── pages/                    # Top‑level routes (Feed, Explore, etc.)
│   ├── routes/                   # React‑Router configuration
│   ├── utils/                    # Helper hooks & utility functions
│   ├── i18n.js                   # i18next initialisation
│   ├── index.css                 # Tailwind base theme
│   └── main.jsx                  # React hydration entry‑point
│
├── supabase/                     # Local dev config & edge functions (.ts)
│   └── functions/
│
├── backend-triggers.md           # Auto‑generated DB trigger documentation
├── backend-functions.md          # Auto‑generated DB function documentation
├── tailwind.config.js            # Tailwind v4 design tokens & presets
├── vite.config.js                # Vite build & chunking rules
├── eslint.config.js              # Flat‑config ESLint setup
├── package.json
└── README.md                     # ← You are here

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
  - Country, State, Neighborhood/City, Gender, Date of Birth  
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
- Filter musician profiles by country, state, neighborhood/city, role, and instrument  
- Switch between basic and advanced filters seamlessly  
- Interface is designed to work across both desktop and mobile devices

---

## ⚙️ Settings Section

### 🧭 Settings Layout & Routing

- Central `Settings` component manages routes to all settings subsections.
- Responsive layout with sidebar navigation on desktop and full-width content on mobile.
- Sidebar shows user avatar and expands on hover (desktop only).

---

### 👤 Profile Settings

- Edit personal information including:  
  - First & Last Name  
  - Editable Username (validated)  
  - Gender, Birthdate  
  - Location: Country, State, Neighborhood/City (using country-state-city data)  
  - Short Bio (max 100 characters)  
  - Profile avatar upload with preview and cloud storage integration.
- Client-side validation powered by `react-hook-form`.
- Fully internationalized UI texts and validation messages.

---

### 🎵 Music Settings

- Manage musical roles (Composer, DJ, Instrumentalist, Producer, Singer).  
- Add up to 6 roles with duplicate prevention and input validation.  
- Expandable role list with inline editing.  
- Delete individual roles with confirmation.

---

### 🔐 Account Settings

- Interface preferences:  
  - Language selection (English, Español)  
  - Theme toggle (Dark, Light)
- Change password functionality with validation and confirmation.  
- Account deletion with confirmation dialog.  
- Displays logged-in user’s email.

---

### 🔒 Privacy Settings

- Toggle visibility of email and last seen status.  
- Control who can send messages: all, connections only, or none.  
- Settings persist with immediate user feedback.

---

### 🔔 Notification Settings

- Enable or disable notifications for:  
  - Likes  
  - Comments  
  - Connections  
  - Groups  
  - Matches  
- Preferences saved and synchronized live.

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


## 📚 Documentation

- [Backend Functions](./backend-functions.md)  
- [Backend Triggers](./backend-triggers.md)
