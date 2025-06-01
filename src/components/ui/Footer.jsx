import { useTranslation } from 'react-i18next'

function Footer() {
  const { t } = useTranslation("ui");
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gradient-to-t from-gray-950 to-gray-900 text-white py-4 mt-8 z-20">
      <div className="container mx-auto text-center">
        <p>
          {t("footer.copyright", { year })}
        </p>
        <p>
          {t("footer.followUs")}
        </p>
        <div className="flex justify-center space-x-4 mt-2">
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
      </div>
    </footer>
  )
}

export default Footer