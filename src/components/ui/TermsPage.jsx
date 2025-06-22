import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import "github-markdown-css/github-markdown-dark.css";

const TermsPage = () => {
  const { i18n } = useTranslation();
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    const lang = i18n.language;
    const filePath =
      lang === "es"
        ? "/legal/terminos-y-condiciones.md"
        : "/legal/terms-and-conditions.md";

    fetch(filePath)
      .then((res) => res.text())
      .then(setMarkdown)
      .catch(() => setMarkdown("Unable to load terms at this time."));
  }, [i18n.language]);

  return (
    <section className="markdown-body max-w-3xl !mx-auto py-8 px-4">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </section>
  );
};

export default TermsPage;
