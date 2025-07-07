import{j as e}from"./mui-B-xP7mtj.js";import{u as i}from"./index-CRsfiaS_.js";function o({color:n="sky"}){const{t:s}=i("common"),t={pink:"bg-pink-100",sky:"bg-sky-100",amber:"bg-amber-100",green:"bg-green-100"}[n]||"bg-sky-100",a={pink:"bg-pink-600",sky:"bg-sky-600",amber:"bg-amber-600",green:"bg-green-600"}[n]||"bg-sky-600",r={pink:"text-pink-700",sky:"text-sky-700",amber:"text-amber-700",green:"text-green-700"}[n]||"text-pink-700";return e.jsxs("div",{className:"inline-flex items-center gap-3 select-none",children:[e.jsx("div",{className:`relative w-24 h-3 ${t} rounded overflow-hidden`,children:e.jsx("div",{className:`${a} absolute top-0 left-0 w-full h-full animate-[loading_1.5s_linear_infinite]`})}),e.jsx("span",{className:`text-xs font-semibold ${r}`,children:s("calculating")}),e.jsx("style",{jsx:!0,children:`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `})]})}export{o as L};
