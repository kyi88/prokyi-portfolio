import{a as m}from"./framer-motion-DjJR-6Ks.js";function h(){return m.useEffect(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const n=new Set,c=e=>{const a=6+Math.floor(Math.random()*4);for(let o=0;o<a;o++){const t=document.createElement("div");t.className="click-spark";const r=Math.PI*2*o/a+(Math.random()-.5)*.6,d=30+Math.random()*50,p=Math.cos(r)*d,u=Math.sin(r)*d,s=2+Math.random()*3;t.style.cssText=`
          left:${e.clientX}px;top:${e.clientY}px;
          width:${s}px;height:${s}px;
          --dx:${p}px;--dy:${u}px;
        `,document.body.appendChild(t);const i=()=>{t.remove(),n.delete(l)};t.addEventListener("animationend",i,{once:!0});const l=setTimeout(i,700);n.add(l)}};return window.addEventListener("click",c),()=>{window.removeEventListener("click",c),n.forEach(e=>clearTimeout(e)),document.querySelectorAll(".click-spark").forEach(e=>e.remove())}},[]),null}const k=m.memo(h);export{k as default};
