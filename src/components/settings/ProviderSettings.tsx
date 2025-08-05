// import { useTranslation } from "react-i18next";
// import { useAuth } from "../../context/AuthContext";
// import Button from "../ui/Button";
// import { FaGoogle, FaGithub } from "react-icons/fa";
// import React from "react";

// interface ProviderConfig {
//   icon: React.ReactNode;
//   color: string;
// }

// const PROVIDERS: Record<string, ProviderConfig> = {
//   google: { icon: <FaGoogle className="text-red-500" />,  color: "!bg-red-600 hover:!bg-red-700"  },
//   github: { icon: <FaGithub className="text-white" />,    color: "!bg-gray-800 hover:!bg-gray-900" },
// };

// interface Identity {
//   id: string;
//   provider: string;
//   [key: string]: any;
// }

// const ProviderSettings: React.FC = () => {
//   const { t } = useTranslation("settings", { keyPrefix: "providers" });
//   const { user, linkProvider, unlinkProvider, loading } = useAuth();
//   const linked: Identity[] = user?.identities ?? [];

//   const isLinked = (provider: string) =>
//     linked.some((ident) => ident.provider === provider);

//   return (
//     <section className="flex flex-col gap-10 bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
//       <h2 className="text-2xl text-yellow-600 font-semibold mb-4 text-center">
//         {t("title")}
//       </h2>

//       {Object.entries(PROVIDERS).map(([provider, cfg]) => {
//         const linkedIdentity = linked.find((i) => i.provider === provider);
//         return (
//           <div
//             key={provider}
//             className="flex items-center justify-between border-b border-gray-700 pb-4"
//           >
//             {/* Provider name & icon */}
//             <div className="flex items-center gap-3">
//               {cfg.icon}
//               <span className="font-medium capitalize">{provider}</span>
//             </div>
//             {/* Action button */}
//             {isLinked(provider) ? (
//               <Button
//                 className="!bg-red-700 hover:!bg-red-800"
//                 disabled={loading}
//                 onClick={() => linkedIdentity && unlinkProvider(linkedIdentity.id)}
//               >
//                 {t("buttons.disconnect")}
//               </Button>
//             ) : (
//               <Button
//                 className={cfg.color}
//                 disabled={loading}
//                 onClick={() => linkProvider(provider)}
//               >
//                 {t("buttons.connect")}
//               </Button>
//             )}
//           </div>
//         );
//       })}
//     </section>
//   );
// };

// export default ProviderSettings;
