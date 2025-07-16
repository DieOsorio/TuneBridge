import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import i18n from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import React from "react";

interface LangBtnProps {
  lng: string;
  label: string;
}

const LangBtn: React.FC<LangBtnProps> = ({ lng, label }) => {
  const currentLang = i18n.language?.startsWith("es") ? "es" : "en";
  const changeLang = (lng: string) => lng !== currentLang && i18n.changeLanguage(lng);
  return (
    <button
      onClick={() => changeLang(lng)}
      className={`mx-1 text-sm transition cursor-pointer ${
        currentLang === lng
          ? "text-gray-300 font-semibold underline"
          : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {label}
    </button>
  );
};

const Footer: React.FC = () => {
  const { t } = useTranslation("ui");
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const currentLang = i18n.language?.startsWith("es") ? "es" : "en";

  const siteMap = [
    {
      header: t("footer.map.general"),
      links: [
        { to: "/",        label: t("footer.map.home") },
        { to: "/explore", label: t("footer.map.explore") },
      ],
    },
    {
      header: t("footer.map.social"),
      links: [
        { to: "/ads",          label: t("footer.map.ads") },
        ...(user ? [{ to: "/create-post", label: t("footer.map.createPost") }] : []),
        ...(user ? [{ to: "/chat",        label: t("footer.map.chat")       }] : []),
      ],
    },
    {
      header: t("footer.map.music"),
      links: user
        ? [
            { to: `/media/${user.id}`, label: t("footer.map.myMedia") },
            { to: "/matches",          label: t("footer.map.matches") },
          ]
        : [],
    },
    {
      header: t("footer.map.account"),
      links: user
        ? [
            { to: `/profile/${user.id}`, label: t("footer.map.profile") },
            // { to: "/create-profile-group", label: t("footer.map.createGroup") },
          ]
        : [
            { to: "/login",  label: t("footer.map.login")  },
            { to: "/signup", label: t("footer.map.signup") },
          ],
    },
  ].filter((col) => col.links.length);

  const cols = siteMap.length;
  const gridColsMd =
    {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
    }[cols] || "md:grid-cols-4";

  return (
    <footer className="bg-gradient-to-b from-gray-950 to-gray-900 text-gray-300 pt-8 pb-6 mt-4">
      <div className="container mx-auto px-4">
        {/* ---------- Site map ---------- */}
        <div
          className={`mx-auto grid grid-cols-2 sm:grid-cols-2 ${gridColsMd}
                      gap-6 mb-8 justify-items-center
                      text-center sm:text-left`}
        >
          {siteMap.map(({ header, links }) => (
            <div key={header}>
              <h4 className="font-semibold text-white mb-2">{header}</h4>
              <ul className="space-y-1">
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-gray-400 hover:text-white transition"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* ---------- Lower bar ---------- */}
        <div className="border-t border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* Col 1 – copyright + terms */}
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-gray-300">© {year} TuneBridge</span>
              <Link to="/terms" className="text-gray-500 hover:text-gray-300 underline">
                {t("footer.terms")}
              </Link>
            </div>
            {/* Col 2 – socials + credit */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex gap-4">
                <a href="#" className="hover:text-white">{t("footer.social.facebook")}</a>
                <a href="#" className="hover:text-white">{t("footer.social.twitter")}</a>
                <a href="#" className="hover:text-white">{t("footer.social.instagram")}</a>
              </div>
              <div className="text-sm text-gray-500 text-center">
                <Trans
                  i18nKey="ui:footer.illustrationCredit"
                  components={[
                    <a
                      key="link"
                      href="https://storyset.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-300 underline"
                    />,
                  ]}
                />
              </div>
            </div>
            {/* Col 3 – language + timezone */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div>
                <LangBtn lng="en" label="English" />|
                <LangBtn lng="es" label="Español" />
              </div>
              <span className="text-gray-500">
                {t("footer.timeZone")}: <span className="text-gray-300">{timeZone}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
