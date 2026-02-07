import{a}from"./framer-motion-DjJR-6Ks.js";const r=["#4facfe","#00f2fe","#a855f7","#f59e0b","#22d3a7","#ff2d87"],u=50,M=a.memo(function(){return a.useEffect(()=>{const t=document.createElement("div");t.className="confetti-container",t.setAttribute("aria-hidden","true"),document.body.appendChild(t);for(let o=0;o<u;o++){const e=document.createElement("div");e.className="confetti-particle";const d=r[Math.floor(Math.random()*r.length)],i=50+(Math.random()-.5)*40,s=Math.random()*.5,m=1.5+Math.random()*1.5,f=(Math.random()-.5)*200,l=Math.random()*720-360,n=4+Math.random()*6;e.style.cssText=`
        left:${i}vw;
        width:${n}px;height:${n*.6}px;
        background:${d};
        animation-delay:${s}s;
        animation-duration:${m}s;
        --drift:${f}px;
        --rot:${l}deg;
      `,t.appendChild(e)}const c=setTimeout(()=>t.remove(),4e3);return()=>{clearTimeout(c),t.remove()}},[]),null});export{M as default};
