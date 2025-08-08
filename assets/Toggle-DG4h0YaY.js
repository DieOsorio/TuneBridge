import{j as e}from"./mui-DntPDMdt.js";const p=({id:s,label:n,register:l,validation:r={},error:t,className:a="",classForLabel:o="",...c})=>{const m=l?l(s,r):c;return e.jsxs("div",{className:`mb-4 flex bg-gray-900 p-4 rounded-lg items-center justify-between ${a}`,children:[n&&e.jsx("label",{htmlFor:s,className:`text-sm font-bold text-gray-200 select-none ${o}`,children:n}),e.jsxs("label",{htmlFor:s,className:"relative inline-flex items-center cursor-pointer",children:[e.jsx("input",{id:s,type:"checkbox",className:"sr-only peer",...m}),e.jsx("span",{className:`w-10 h-6 rounded-full bg-gray-500
                     transition-colors duration-200
                     peer-checked:bg-emerald-600
                     peer-focus:ring-2 peer-focus:ring-emerald-400/50`}),e.jsx("span",{className:`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white
                     transition-transform duration-200
                     peer-checked:translate-x-4`})]}),t&&e.jsx("p",{className:"text-red-500 text-sm mt-1 w-full",children:t.message||t})]})};export{p as T};
