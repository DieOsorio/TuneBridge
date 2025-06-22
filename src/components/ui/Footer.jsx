import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function Footer() {
  const { t } = useTranslation("ui");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-t from-gray-950 to-gray-900 text-white py-4 mt-8 z-20">
      <div className="container mx-auto text-center space-y-2">
        <p>{t("footer.copyright", { year })}</p>
        <p>{t("footer.followUs")}</p>

        <div className="flex justify-center space-x-4">
          <a href="#" className="text-gray-300 hover:text-white">
            {t("footer.social.facebook")}
          </a>
          <a href="#" className="text-gray-300 hover:text-white">
            {t("footer.social.twitter")}
          </a>
          <a href="#" className="text-gray-300 hover:text-white">
            {t("footer.social.instagram")}
          </a>
        </div>

        <div className="mt-2">
          <Link
            to="/terms"
            className="text-sm text-gray-400 hover:text-white underline"
          >
            {t("footer.terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
