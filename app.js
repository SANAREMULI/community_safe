'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const VILLAGES=['Talek','Sekenani','Aitong','Olkinyei','Mara Rianta','Ololaimutiek','Narok'];
const CATS={FIRE:'Fire',FLOOD:'Flood',WILDLIFE:'Human-wildlife conflict',SECURITY:'Security'};
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
// Sanitised element builder: never uses innerHTML, so user text cannot inject markup.
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
const clean=s=>String(s).replace(/[<>`]/g,'').replace(/[\u0000-\u001f]/g,' ').trim();
// Tabs
function show(t){$$('.tab').forEach(x=>x.classList.toggle('on',x.id===t));$$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));if(t==='alerts')drawAlerts();if(t==='track')drawMine();if(location.hash!=='#'+t)history.replaceState(null,'','#'+t)}
$('#nav').addEventListener('click',e=>{const t=e.target.dataset.tab;if(t)show(t)});
['#village','#jvillage'].forEach(s=>VILLAGES.forEach(v=>$(s).append(new Option(v,v))));
// Report
let cat='';const cats=$('#cats');
Object.entries(CATS).forEach(([k,v])=>{const b=el('button','chip',v);b.type='button';b.onclick=()=>{cat=k;$$('#cats .chip').forEach(c=>c.classList.toggle('on',c===b));prev()};cats.append(b)});
const prev=()=>{$('#smsprev').textContent=cat?[cat,$('#village').value,clean($('#landmark').value),clean($('#desc').value)].join('#'):'—'};
['#village','#landmark','#desc'].forEach(s=>$(s).addEventListener('input',prev));
const phoneOk=p=>/^(?:\+?254|0)(?:7|1)\d{8}$/.test(p.replace(/[\s-]/g,''));
let last=0;
$('#rform').addEventListener('submit',async e=>{e.preventDefault();const err=$('#rerr');err.textContent='';
  if(!cat)return err.textContent='Choose the type of emergency.';
  if(clean($('#desc').value).length<5)return err.textContent='Please describe what is happening.';
  if(!phoneOk($('#phone').value))return err.textContent='Enter a valid Kenyan phone number.';
  if(Date.now()-last<15000)return err.textContent='Please wait a few seconds before sending another report.';
  last=Date.now();
  let gps=null;
  if($('#gps').checked&&navigator.geolocation){gps=await new Promise(r=>navigator.geolocation.getCurrentPosition(p=>r([+p.coords.latitude.toFixed(4),+p.coords.longitude.toFixed(4)]),()=>r(null),{timeout:6000}))}
  const list=store.get('reports',[]);const id='MS-'+String(list.length+12).padStart(3,'0');
  list.unshift({id,cat,village:$('#village').value,landmark:clean($('#landmark').value),desc:clean($('#desc').value),gps,t:Date.now(),status:'Received'});
  store.set('reports',list.slice(0,50));$('#rform').reset();cat='';$$('#cats .chip').forEach(c=>c.classList.remove('on'));prev();
  err.textContent='';alert('Report sent. Your ID is '+id+'. If anyone is in danger call 999 or 112.');show('track');
});
// Alerts
const SAMPLE=[{lvl:'high',title:'Flood watch: Talek river',body:'Heavy rain upstream. Move livestock and children away from the riverbank.',who:'Talek'}];
function drawAlerts(){const box=$('#alist');box.replaceChildren();const items=store.get('alerts',SAMPLE);
  if(!items.length)box.append(el('p','muted','No warnings right now.'));
  items.forEach(a=>{const d=el('div','item '+a.lvl);d.append(el('h3','',a.title+' · '+a.who),el('div','',a.body));box.append(d)})}
$('#jform').addEventListener('submit',e=>{e.preventDefault();const s=store.get('subs',[]);const v=$('#jvillage').value;if(!s.includes(v))s.push(v);store.set('subs',s);$('#jmsg').textContent='Subscribed to '+v+'. (Demo: connect an SMS gateway to send real texts.)'});
// Track
const when=t=>new Date(t).toLocaleString();
function row(r){const d=el('div','item '+(r.status==='Resolved'?'ok':''));d.append(el('h3','',r.id+' · '+(CATS[r.cat]||r.cat)+' · '+r.village),el('div','',r.desc),el('div','muted',r.status+' · '+when(r.t)));return d}
function drawMine(){const b=$('#mine');b.replaceChildren();const l=store.get('reports',[]);if(!l.length)b.append(el('p','muted','No reports yet.'));l.forEach(r=>b.append(row(r)))}
$('#tform').addEventListener('submit',e=>{e.preventDefault();const id=clean($('#tid').value).toUpperCase();const r=store.get('reports',[]).find(x=>x.id===id);const b=$('#tres');b.replaceChildren(r?row(r):el('p','err','No report found with that ID.'))});
// Chat (offline rules, EN / SW / Maa basics)
const KB=[
 {k:/elephant|tembo|ndovu|olng'?ojine|enkop/i,a:"Stay calm and keep your distance (100 m+). Do not shout, flash torches or throw things. Stay indoors or on high ground, then report with the Report tab: WILDLIFE#village#landmark#details."},
 {k:/fire|moto|kuna moto|enkuri/i,a:"Move everyone away from the fire and wind direction. Call 999 / 112. Report with FIRE#village#landmark#details so scouts can respond."},
 {k:/flood|river|mafuriko|mto|ewaso|enkare/i,a:"Move to high ground now. Never cross moving water. Keep ID, phone and medicine with you. Report with FLOOD#village#landmark#details."},
 {k:/lion|simba|leopard|chui|hyena|fisi/i,a:"Keep livestock in a strong boma at night, do not walk alone after dark and report any attack immediately via the Report tab."},
 {k:/thief|raid|wizi|attack|security|usalama/i,a:"Get to a safe place and call 999 / 112. Report with SECURITY#village#landmark#details. Do not confront armed people."},
 {k:/scam|fake|pin|otp|mpesa|m-pesa|link|tapeli/i,a:"Never share your M-PESA PIN or OTP. Open the Cyber safety tab to check a suspicious message, and report it with SCAM#village#details."},
 {k:/sopa|habari|hello|hi\b|supa/i,a:"Sopa! Habari! Hello! Tell me what is happening or ask how to stay safe."}];
const log=$('#log');const say=(t,c)=>log.append(el('div','msg '+c,t));log.scrollTop=log.scrollHeight;
say("Sopa! Habari! Hello! Tell me what is happening, or ask how to stay safe.",'b');
function ask(q){q=clean(q);if(!q)return;say(q,'u');const m=KB.find(x=>x.k.test(q));say(m?m.a:"I am not sure. If this is urgent call 999 or 112, or use the Report tab so a person can follow up.",'b');log.scrollTop=log.scrollHeight}
$('#cform').addEventListener('submit',e=>{e.preventDefault();ask($('#cin').value);$('#cin').value=''});
['Elephants in my maize farm in Talek','Kuna moto mkubwa karibu na soko','What should I do if a river floods?'].forEach(t=>{const b=el('button','chip',t);b.type='button';b.onclick=()=>ask(t);$('#sugg').append(b)});
// Cyber security
const FEED=[
 {lvl:'high',title:'Fake "emergency fund" SMS',body:'Messages asking you to send money or a PIN to receive relief are scams. Community Safe never asks for money.'},
 {lvl:'',title:'Fake warning forwards',body:'Verify flood or fire warnings with your village elder or scout before forwarding on WhatsApp.'},
 {lvl:'',title:'Staff account safety',body:'Use a strong unique password and sign out on shared phones.'}];
FEED.forEach(a=>{const d=el('div','item '+a.lvl);d.append(el('h3','',a.title),el('div','',a.body));$('#cfeed').append(d)});
const SIGNS=[[/\b(pin|otp|password|id number|nambari ya siri)\b/i,'asks for a PIN, OTP or password',3],[/(bit\.ly|tinyurl|t\.co|goo\.gl|cutt\.ly|wa\.me\/)/i,'uses a shortened or chat link',2],[/https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/i,'link points to a raw IP address',3],[/\b(urgent|immediately|last chance|haraka|within \d+ ?(?:min|hour))/i,'creates false urgency',1],[/\b(won|winner|prize|zawadi|reward|ksh ?\d|free money|relief fund)\b/i,'promises money or prizes',2],[/\b(send|tuma|deposit|pay)\b.*\b(fee|ksh|money|pesa)\b/i,'asks you to send money first',3],[/\b(account|akaunti).*(suspend|locked|blocked|imefungwa)/i,'threatens to lock your account',2],[/https?:\/\/\S*(?:login|verify|secure|update)\S*\.(?:xyz|top|click|info|site)/i,'look-alike login link',3]];
$('#scan').addEventListener('submit',e=>{e.preventDefault();const t=$('#stext').value;const hits=SIGNS.filter(s=>s[0].test(t));const score=hits.reduce((a,s)=>a+s[2],0);const v=$('#sres');v.className='verdict '+(score>=3?'bad':'good');
 v.textContent=!t.trim()?'Paste a message first.':score>=3?'Likely scam. This message '+hits.map(h=>h[1]).join(', ')+'. Do not reply or click. Report with SCAM#village#details.':score>0?'Be careful: this message '+hits.map(h=>h[1]).join(', ')+'. Verify with the sender through a known number.':'No common scam signs found, but this check is not a guarantee. Never share your PIN or OTP.'});
const h=location.hash.slice(1);show(['report','chat','alerts','track','cyber'].includes(h)?h:'report');prev();
