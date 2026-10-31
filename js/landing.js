const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
// split hero letters
const h1=$('.split');h1.setAttribute('aria-label',h1.textContent);h1.innerHTML=[...h1.textContent].map((c,i)=>`<span style="--i:${i}" aria-hidden="true">${c}</span>`).join('');
// cursor glow
addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',e.clientY+'px')});
// 3D tilt scene
const sc=$('.scene'),tl=$('.tilt');
sc.onpointermove=e=>{const r=sc.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;tl.style.transform=`rotateY(${x*28}deg) rotateX(${-y*28}deg)`};
sc.onpointerleave=()=>tl.style.transform='';
// magnetic buttons + panel spotlight
$$('.mag').forEach(b=>{b.onpointermove=e=>{const r=b.getBoundingClientRect();b.style.translate=`${(e.clientX-r.left-r.width/2)*.3}px ${(e.clientY-r.top-r.height/2)*.4}px`};b.onpointerleave=()=>b.style.translate=''});
$$('.pn').forEach(p=>p.onpointermove=e=>{const r=p.getBoundingClientRect();p.style.setProperty('--mx',e.clientX-r.left+'px');p.style.setProperty('--my',e.clientY-r.top+'px')});
// marquee lanes: duplicate content for seamless loop
$$('.lane').forEach(l=>l.innerHTML+=l.innerHTML);
// word-by-word scroll reveal
const wrs=$$('.wr').map(w=>{w.innerHTML=w.textContent.trim().split(/\s+/).map(t=>`<span>${t}</span>`).join(' ');return[w,[...w.children]]});
// horizontal scroll section
const hs=$('.hs'),trk=$('.track'),hb=$('.hs-bar i');
function onS(){
  wrs.forEach(([w,s])=>{const r=w.getBoundingClientRect(),p=clamp((innerHeight*.8-r.top)/(r.height+innerHeight*.25));s.forEach((x,i)=>x.classList.toggle('on',i/s.length<p))});
  const r=hs.getBoundingClientRect(),p=clamp(-r.top/(r.height-innerHeight));
  trk.style.transform=`translateX(${-p*(trk.scrollWidth-innerWidth)}px)`;hb.style.width=p*100+'%';
}
addEventListener('scroll',onS,{passive:true});addEventListener('resize',onS);onS();
// urgency lab
const rg=$('#rg'),lab=$('#lab'),st=$('#st');
const fmt=s=>{s=Math.abs(Math.round(s));return String(s/60|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function lb(){const v=+rg.value,left=v/100*600,s=v<=0?'late':v<=30?'warn':'calm';
  lab.className='card labc '+s;lab.querySelector('.tm').textContent=(left<0?'+':'')+fmt(left);
  lab.querySelector('.bar i').style.width=clamp(v/100)*100+'%';
  st.textContent={calm:'CALM · green, steady, normal size',warn:'WARNING · amber, bigger, pulsing',late:'LATE · red, biggest, shaking, screen glows'}[s];
  document.body.classList.toggle('alarm',s=='late'&&lab.getBoundingClientRect().top<innerHeight&&lab.getBoundingClientRect().bottom>0)}
rg.oninput=lb;lb();addEventListener('scroll',()=>{if(+rg.value>0)document.body.classList.remove('alarm')},{passive:true});
lab.onclick=e=>{const b=e.target.closest('.it');if(!b)return;b.classList.toggle('d');penSound(b.classList.contains('d'));b.querySelector('b').textContent=b.classList.contains('d')?'✔':'';
  const it=lab.querySelectorAll('.it'),d=lab.querySelectorAll('.it.d').length;lab.querySelector('.prog i').style.width=d/it.length*100+'%';lab.querySelector('.prog span').textContent=d+' / '+it.length+' DONE'};
// ember particles
if(!RM){const cv=$('#fx'),x=cv.getContext('2d');let W,H;const rs=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};rs();addEventListener('resize',rs);
  const mk=()=>({x:Math.random()*W,y:H+Math.random()*H*.6,r:Math.random()*2.4+.6,v:Math.random()*1.1+.3,d:Math.random()*7}),P=Array.from({length:90},mk);
  (function f(){x.clearRect(0,0,W,H);P.forEach(p=>{p.y-=p.v;p.x+=Math.sin(p.d+=.02)*.6;if(p.y<-10)Object.assign(p,mk(),{y:H+10});
    x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fillStyle=`rgba(255,${110+p.r*40|0},40,${clamp(p.y/H)*.85})`;x.shadowBlur=14;x.shadowColor='#ff5a1f';x.fill()});requestAnimationFrame(f)})()}
// live Mumbai (IST) clock
const ist=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',hour:'numeric',minute:'2-digit',weekday:'long',hour12:true});
let lastT='';
function clk(){const p=Object.fromEntries(ist.formatToParts(new Date()).map(x=>[x.type,x.value])),
  t=`${p.hour}<span class="colon">:</span>${p.minute}`;
  if(t===lastT)return;lastT=t;
  $('#lt').innerHTML=t;$('#ld').textContent=`${p.dayPeriod.toUpperCase()} · ${p.weekday.toUpperCase()} · MUMBAI IST`}
clk();setInterval(clk,1000);
