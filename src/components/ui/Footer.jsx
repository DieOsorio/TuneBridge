import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import i18n from "../../i18n";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
  const { t } = useTranslation("ui");
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const currentLang = i18n.language?.startsWith("es") ? "es" : "en";
  const changeLang = (lng) => lng !== currentLang && i18n.changeLanguage(lng);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const LangBtn = ({ lng, label }) => (
    <button
      onClick={() => changeLang(lng)}
      className={`mx-1 cursor-pointer text-sm transition ${
        currentLang === lng
          ? "text-white font-semibold underline"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  /* ---------- dynamic site-map ---------- */
  const siteMap = [
    {
      header: t("footer.map.general"),
      links: [
        { to: "/", label: t("footer.map.home") },
        { to: "/explore", label: t("footer.map.explore") },
      ],
    },
    {
      header: t("footer.map.social"),
      links: [
        { to: "/ads", label: t("footer.map.ads") },
        ...(user ? [{ to: "/create-post", label: t("footer.map.createPost") }] : []),
        ...(user ? [{ to: "/chat", label: t("footer.map.chat") }] : []),
      ],
    },
    {
      header: t("footer.map.music"),
      links: user
        ? [
            { to: `/media/${user.id}`, label: t("footer.map.myMedia") },
            { to: "/matches", label: t("footer.map.matches") },
          ]
        : [],
    },
    {
      header: t("footer.map.account"),
      links: user
        ? [
            { to: `/profile/${user.id}`, label: t("footer.map.profile") },
            { to: "/create-profile-group", label: t("footer.map.createGroup") },
          ]
        : [
            { to: "/login", label: t("footer.map.login") },
            { to: "/signup", label: t("footer.map.signup") },
          ],
    },
  ].filter((col) => col.links.length);
  /* ------------------------------------- */

  return (
    <footer className="bg-gradient-to-b from-gray-950 to-gray-900 text-gray-300 pt-8 pb-6 mt-12">
      <div className="container mx-auto px-4">
        {/* ---------- Site map ---------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
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
          {/* Three equal columns on ≥ md – stack vertically on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">

            {/* Col 1 – copyright + terms */}
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-gray-400">© {year} TuneBridge</span>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white underline"
              >
                {t("footer.terms")}
              </Link>                                          
            </div>

            {/* Col 2 – socials */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex items-center justify-center gap-4">
                <a href="#" className="hover:text-white">
                {t("footer.social.facebook")}
                </a>
                <a href="#" className="hover:text-white">
                  {t("footer.social.twitter")}
                </a>
                <a href="#" className="hover:text-white">
                  {t("footer.social.instagram")}
                </a>
              </div>
              {/* Illustrations credit (unchanged) */}
              <div className="text-center text-xs text-gray-500">
                <Trans
                  i18nKey="ui:footer.illustrationCredit"
                  components={[
                    <a
                      key="link"
                      href="https://storyset.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white underline"
                    />,
                  ]}
                />
              </div>
            </div>

            {/* Col 3 – language selector */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div>
                <LangBtn lng="en" label="English" />|
                <LangBtn lng="es" label="Español" />
              </div>
              <div>
                <span className="text-gray-500">
                  {t("footer.timeZone")}: {timeZone}
                </span> 
              </div>
            </div>            
          </div>
        </div>                                
      </div>
    </footer>
  );
};

export default Footer;
