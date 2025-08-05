import { Routes, Route, NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { FaCompass } from "react-icons/fa";

import PostsList from "../components/social/PostsList";
import ProfilesSearch from "../components/profiles/ProfilesSearch";
import ShinyText from "../components/ui/ShinyText";
import GroupList from "../components/profiles/group/GroupList";

export default function Explore() {
  const { t } = useTranslation("ui");
  const tags: string[] = t("explore.tags", { returnObjects: true }) as string[];

  /* ---------- nav helpers ---------- */
  const base = "px-4 py-2 text-lg font-medium rounded-lg border-b-2 transition";
  const active = `${base} border-sky-600 text-gray-200`;
  const inactive = `${base} text-gray-400 hover:text-gray-200`;

  return (
    <div className="min-h-screen text-white">
      {/* header */}
      <header className="text-center py-8 mb-3 bg-gradient-to-r from-sky-900 to-gray-950 rounded-b-lg shadow-lg flex flex-col items-center">
        <div className="flex items-center gap-3 mb-3">
          <FaCompass className="text-sky-500 text-4xl animate-custom-pulse" />
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            <ShinyText text={t("explore.title")} speed={3} />
          </h1>
        </div>

        <p className="text-lg max-w-xl mx-auto text-cyan-200/90 font-light tracking-wide">
          {t("explore.description")}
        </p>

        {/* hashtag quick‑links */}
        <div className="flex justify-center flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <Link
              key={tag}
              to={`/hashtag/${tag}`}
              className="text-xs rounded-full bg-sky-600 px-3 py-1 font-semibold text-cyan-100 hover:bg-sky-500 transition"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </header>

      {/* internal nav */}
      <nav className="flex justify-center mb-4">
        <div className="flex gap-8">
          <NavLink
            end
            to="/explore"
            className={({ isActive }) => (isActive ? active : inactive)}
          >
            {t("explore.tabs.posts")}
          </NavLink>

          <NavLink
            to="/explore/profiles"
            className={({ isActive }) => (isActive ? active : inactive)}
          >
            {t("explore.tabs.profiles")}
          </NavLink>

          <NavLink    to="/explore/groups"   className={({ isActive }) => (isActive ? active : inactive)}>
            {t("explore.tabs.groups")}
          </NavLink>
        </div>
      </nav>

      {/* internal routes */}
      <Routes>
        {/* default -> posts */}
        <Route index element={<PostsList disableSearch={false} isOwnProfile={false} />} />

        {/* profiles search */}
        <Route path="profiles" element={<ProfilesSearch />} />
        <Route path="groups" element={<GroupList />} />
      </Routes>
    </div>
  );
}
