import { useTranslation } from "react-i18next";
import React from "react";

export interface LoadingBadgeProps {
  color?: "pink" | "sky" | "amber" | "green";
}

const LoadingBadge: React.FC<LoadingBadgeProps> = ({ color = "sky" }) => {
  const { t } = useTranslation("common");

  const bgLight = {
    pink: "bg-pink-100",
    sky: "bg-sky-100",
    amber: "bg-amber-100",
    green: "bg-green-100",
  }[color] || "bg-sky-100";

  const bgDark = {
    pink: "bg-pink-600",
    sky: "bg-sky-600",
    amber: "bg-amber-600",
    green: "bg-green-600",
  }[color] || "bg-sky-600";

  const textColor = {
    pink: "text-pink-700",
    sky: "text-sky-700",
    amber: "text-amber-700",
    green: "text-green-700",
  }[color] || "text-pink-700";

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <div className={`relative w-24 h-3 ${bgLight} rounded overflow-hidden`}>
        <div
          className={`${bgDark} absolute top-0 left-0 w-full h-full animate-[loading_1.5s_linear_infinite]`}
        ></div>
      </div>
      <span className={`text-xs font-semibold ${textColor}`}>{t("calculating")}</span>
      <style>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingBadge;
