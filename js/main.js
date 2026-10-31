const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('.rv').forEach(el=>{el.style.transitionDelay=(el.dataset.d||0)+'ms';io.observe(el)});
const sp=document.querySelector('.sp'),line=document.querySelector('.line');
function onScroll(){
  const h=document.documentElement;
  sp.style.width=scrollY/(h.scrollHeight-innerHeight)*100+'%';
  h.style.setProperty('--sy',scrollY);
  if(line){const r=line.parentElement.getBoundingClientRect();
    line.style.height=Math.max(0,Math.min(r.height,innerHeight*.6-r.top))+'px'}
}
addEventListener('scroll',onScroll,{passive:true});onScroll();
document.querySelectorAll('nav a.l').forEach(a=>{if(a.getAttribute('href')===location.pathname.split('/').pop()||(!location.pathname.split('/').pop()&&a.getAttribute('href')==='index.html'))a.classList.add('on')});
// animated counters
const co=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;co.unobserve(e.target);
  const n=+e.target.dataset.n,t0=performance.now();
  (function f(t){const p=Math.min(1,(t-t0)/1400);e.target.textContent=Math.round(n*(1-Math.pow(1-p,3)));p<1&&requestAnimationFrame(f)})(t0)}));
document.querySelectorAll('[data-n]').forEach(el=>co.observe(el));
// demo cards cycle calm -> warn -> late
const S=['calm','warn','late'],T=['08:45','00:48','LATE +01:10'];
document.querySelectorAll('.demo').forEach((c,i)=>{let k=i%3;
  const set=()=>{c.className='card demo '+S[k];c.querySelector('.tm').textContent=T[k];c.querySelector('.bar i').style.width=[85,22,0][k]+'%'};
  set();setInterval(()=>{k=(k+1)%3;set()},2600+i*400)});

// pen tick sound: two scratchy strokes (the check mark) + a tiny pen tap. on=false plays a softer "rub out".
let AC;
function penSound(on=true){try{
  AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume();
  const t=AC.currentTime,n=AC.sampleRate*.4,buf=AC.createBuffer(1,n,AC.sampleRate),d=buf.getChannelData(0),k=on?1:.5;
  for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const src=AC.createBufferSource(),bp=AC.createBiquadFilter(),g=AC.createGain();
  src.buffer=buf;bp.type='bandpass';bp.Q.value=1.2;
  bp.frequency.setValueAtTime(on?2600:3800,t);bp.frequency.linearRampToValueAtTime(on?4400:2400,t+.3);
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(.22*k,t+.02);g.gain.linearRampToValueAtTime(0,t+.09);   // short down-stroke
  g.gain.linearRampToValueAtTime(.32*k,t+.15);g.gain.linearRampToValueAtTime(0,t+.3);    // long up-stroke
  src.connect(bp);bp.connect(g);g.connect(AC.destination);src.start(t);src.stop(t+.35);
  if(on){const o=AC.createOscillator(),og=AC.createGain();o.frequency.value=1700;
    og.gain.setValueAtTime(.1,t+.31);og.gain.exponentialRampToValueAtTime(.001,t+.36);
    o.connect(og);og.connect(AC.destination);o.start(t+.31);o.stop(t+.38)}
}catch(e){}}

// light / dark switch (saved in the browser, default dark)
const sw=document.getElementById('sw');
function setTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('expo.theme',t)}catch(e){}
  sw.setAttribute('aria-checked',t==='light');sw.firstElementChild.textContent=t==='light'?'☀':'☾'}
sw.setAttribute('role','switch');setTheme(document.documentElement.dataset.theme||'dark');
sw.onclick=()=>setTheme(document.documentElement.dataset.theme==='light'?'dark':'light');
