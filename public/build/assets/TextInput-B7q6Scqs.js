import{j as u,r as s}from"./app-WkCQ_0mE.js";function a({message:r,className:t="",...e}){return r?u.jsx("p",{...e,className:"text-sm text-red-600 "+t,children:r}):null}const d=s.forwardRef(function({type:t="text",className:e="",isFocused:c=!1,...f},n){const o=n||s.useRef();return s.useEffect(()=>{c&&o.current.focus()},[]),u.jsx("input",{...f,type:t,className:"border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm "+e,ref:o})});export{a as I,d as T};
