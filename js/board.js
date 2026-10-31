const K='expo.v1',$=s=>document.querySelector(s);
let orders=JSON.parse(localStorage.getItem(K)||'[]'),hist=[],tt;
const save=()=>localStorage.setItem(K,JSON.stringify(orders));
const parseItem=s=>{const[n,...a]=s.split('!').map(x=>x.trim());return{n,d:0,a:a.filter(Boolean)}}; // 'Pad Thai !peanut !soy'
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m,plain){const t=$('#toast');t.innerHTML=`<span>${esc(m)}</span>`+(plain?'':'<button class="ub">UNDO</button>');t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),6000)}
function commit(fn,m){hist.push(JSON.stringify(orders));hist.length>40&&hist.shift();fn();save();render();toast(m)}
function undo(){if(!hist.length)return toast('Nothing to undo',1);orders=JSON.parse(hist.pop());save();render();toast('Undone ✔',1)}
const state=(o,n)=>{const l=o.due-n,t=o.due-o.start;return l<=0?'late':l<=Math.max(6e4,t*.3)?'warn':'calm'};
const fmt=ms=>{const s=Math.abs(Math.round(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function render(){
  const when=ms=>new Date(ms).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',day:'2-digit',month:'short',hour:'numeric',minute:'2-digit',hour12:true}).toUpperCase();
  $('#board').innerHTML=orders.map(o=>{const d=o.items.filter(i=>i.d).length,n=o.items.length,al=[...new Set(o.items.flatMap(i=>i.a||[]))];
    return `<article class="card calm" data-id="${o.id}"><div class="rh">★ EXPO KITCHEN ★<small>${when(o.start)} · NO.${String(o.start).slice(-4)}</small></div><header><span class="tn">${esc(o.t)}</span><span class="tm"></span></header><div class="bar"><i></i></div>${al.length?`<div class="alb">⚠ ALLERGY · ${esc(al.join(', ').toUpperCase())}</div>`:''}<ul class="items">${o.items.map((i,x)=>{const a=i.a||[];return `<li class="${a.length?'ai':''}"><button class="it${i.d?' d':''}" data-x="${x}"><b>${i.d?'✔':''}</b><span><span class="nm">${esc(i.n)}</span>${a.length?`<em class="at">⚠ ALLERGY: ${esc(a.join(', ').toUpperCase())}</em>`:''}</span></button></li>`}).join('')}</ul><div class="prog"><i style="width:${d/n*100}%"></i><span>${d} / ${n} DONE</span></div><div class="bc"></div><footer><button class="go${d==n&&!o.done?' rdy':''}" data-a="done">${o.done?'↩ REOPEN':'✔ SEND IT'}</button><button class="rm" data-a="rm">✖</button></footer></article>`}).join('')
    ||'<div class="empty">KITCHEN\'S CLEAR 🔥<br><button class="btn" data-seed>Load demo rush</button></div>';
  tick();
}
function tick(){
  const n=Date.now(),c={calm:0,warn:0,late:0};let nx=null,nl=1e15;
  orders.forEach(o=>{const el=document.querySelector(`[data-id="${o.id}"]`);if(!el)return;const l=o.due-n;
    if(o.done){el.className='card served';el.style.order=1e6;el.querySelector('.tm').textContent='SERVED';el.querySelector('.bar i').style.width=0;return}
    const s=state(o,n);c[s]++;el.className='card '+s;el.style.order=Math.round(l/1000); // most overdue = smallest = first
    el.querySelector('.tm').textContent=(l<0?'+':'')+fmt(l);
    el.querySelector('.bar i').style.width=Math.max(0,Math.min(100,l/(o.due-o.start)*100))+'%';
    if(l<nl){nl=l;nx=o}});
  $('#next').innerHTML=nx?`NEXT UP: <b>${esc(nx.t)}</b> ${nl<0?'LATE +':'IN '}${fmt(nl)}`:'ALL CLEAR';
  ['calm','warn','late'].forEach(k=>$('#c-'+k).textContent=c[k]);
  document.body.classList.toggle('alarm',c.late>0);
}
$('#board').onclick=e=>{
  if(e.target.dataset.seed!==undefined)return seed();
  const b=e.target.closest('button');if(!b)return;
  const o=orders.find(o=>o.id===b.closest('.card').dataset.id);
  if(b.dataset.x!==undefined){const was=o.items[b.dataset.x].d;commit(()=>o.items[b.dataset.x].d^=1,o.t+' item updated');penSound(!was)}
  else if(b.dataset.a=='done'){const was=o.done,r=b.closest('.card').getBoundingClientRect();commit(()=>o.done^=1,o.t+(o.done?' reopened':' served'));if(!was)celebrate(r,o.t)}
  else if(b.dataset.a=='rm')commit(()=>orders=orders.filter(x=>x!==o),o.t+' removed');
};
$('#f').onsubmit=e=>{e.preventDefault();
  const t=$('#t').value.trim(),its=$('#i').value.split(/\n|,/).map(s=>s.trim()).filter(Boolean).map(parseItem).filter(i=>i.n),m=+$('#m').value;
  if(!t||!its.length||!(m>0))return toast('Need ticket, items and minutes',1);
  const now=Date.now();
  commit(()=>orders.push({id:now+Math.random().toString(36).slice(2,6),t,start:now,due:now+m*6e4,items:its,done:0}),'Order '+t+' added');
  e.target.reset();$('#m').value=10;$('#t').focus();
};
document.querySelectorAll('.pre button').forEach(b=>b.onclick=()=>$('#m').value=b.dataset.m);
function seed(){const now=Date.now(),mk=(t,m,items)=>({id:t+now,t,start:now-6e4*10,due:now+m*6e4,items:items.map((n,i)=>({...parseItem(n),d:i==0?1:0})),done:0});
  commit(()=>orders.push(mk('T4',-2,['2x Burger','Fries !gluten','Shake !dairy']),mk('T12',1,['Pasta !gluten !egg','Caesar !dairy']),mk('#31',4,['Pad Thai !peanut','Wings','Slaw']),mk('T7',12,['Steak','Mash'])),'Demo rush loaded')}
$('#seed').onclick=seed;
$('#clear').onclick=()=>orders.length&&commit(()=>orders=[],'Board cleared');
$('#undo').onclick=undo;
document.addEventListener('click',e=>e.target.classList.contains('ub')&&undo());
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();undo()}});
render();setInterval(tick,500);

function celebrate(r,t){
  const f=document.createElement('div');f.className='fx';f.style.left=r.left+r.width/2+'px';f.style.top=r.top+r.height/2+'px';
  f.innerHTML='<div class="stamp"><i>✔</i><span>'+esc(t)+' SERVED</span></div>'+Array.from({length:32},(_,i)=>{const a=Math.random()*6.28,d=80+Math.random()*170;
    return `<s style="--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d-70}px;--r:${Math.random()*720}deg;--c:${['#d4a85a','#3fae6a','#f3e9d6','#e0a526'][i%4]};animation-delay:${Math.random()*.12}s"></s>`}).join('');
  document.body.appendChild(f);setTimeout(()=>f.remove(),1800);chime();
}
function chime(){try{const a=new(window.AudioContext||window.webkitAudioContext)();[660,880].forEach((fr,i)=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+i*.12;o.frequency.value=fr;o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.start(t);o.stop(t+.4)})}catch(e){}}

document.querySelectorAll('.alc button').forEach(b=>b.onclick=()=>{const t=$('#i');t.value=t.value.replace(/[\s,]+$/,'')+' !'+b.dataset.a;t.focus()});
