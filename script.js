const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S={plan:'Free',sub:null,pay:[],dl:[],logins:[],trusted:[],theme:null,cm:[],vpos:{}};
try{Object.assign(S,JSON.parse(localStorage.getItem('sh')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('sh',JSON.stringify(S))}catch(e){}};
const toast=m=>{const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',2800)};
const me='you',fmt=t=>isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'0:00';
const TABS=[['home','Home'],['call','Calls'],['dl','Downloads'],['plan','Plans'],['pl','Player'],['sec','Security'],['cm','Comments']];
$('nav').innerHTML=TABS.map(t=>`<button data-t="${t[0]}">${t[1]}</button>`).join('');
function tab(t){
  document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id=='s-'+t));
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==t));
  document.body.dataset.tab=t;
}
$('nav').onclick=e=>{if(e.target.dataset.t)tab(e.target.dataset.t)};tab('home');
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){tab(g.dataset.go);scrollTo({top:0,behavior:'smooth'})}});

const istH=()=>{const d=new Date();return Math.floor(((d.getUTCHours()*60+d.getUTCMinutes()+330)%1440)/60)};
const applyTheme=t=>{document.documentElement.dataset.theme=t};
const autoTheme=()=>istH()>=5&&istH()<12?'light':'dark';
applyTheme(S.theme||autoTheme());
$('thm').onclick=()=>{S.theme=document.documentElement.dataset.theme=='dark'?'light':'dark';applyTheme(S.theme);save()};

const PLANS={Free:{p:0,dl:1,q:'480p',f:'Limited premium videos, ads'},Bronze:{p:99,dl:3,q:'720p',f:'Ad-free, offline downloads'},Silver:{p:249,dl:10,q:'1080p',f:'Priority streaming, courses'},Gold:{p:499,dl:50,q:'4K',f:'Everything, exclusive content'}};
const ORD=Object.keys(PLANS);let pend=null;
function checkExp(){if(S.sub&&Date.now()>S.sub.exp){S.plan='Free';S.sub=null;save();toast('Subscription expired. Moved to Free; your history is kept.')}}
function rPlans(){checkExp();
$('cur').innerHTML=`<b>Current plan: ${S.plan}</b>`+(S.sub?`<div class="mu">Valid until ${new Date(S.sub.exp).toLocaleDateString()} (${S.sub.cycle}). Renews on the same date. <button class="g" id="cancel">Cancel subscription</button></div>`:'<div class="mu">Free plan has no expiry.</div>');
$('plans').innerHTML=ORD.map(n=>{const p=PLANS[n];return`<div class="card plan ${n==S.plan?'cur':''}"><b>${n}</b><div class="price">${p.p?'₹'+p.p:'₹0'}<span class="mu">/mo</span></div><div class="mu">${p.dl} download(s)/day<br>${p.q} streaming<br>${p.f}</div>${n==S.plan||n=='Free'?'':`<p><select data-c="${n}"><option value="1">Monthly</option><option value="3">Quarterly (3x)</option><option value="12">Yearly (12x)</option></select> <button class="b" data-p="${n}">${ORD.indexOf(n)>ORD.indexOf(S.plan)?'Upgrade':'Downgrade'}</button></p>`}</div>`}).join('');
$('pay').innerHTML=S.pay.length?`<table><tr><th>Payment ID</th><th>Order ID</th><th>Invoice</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th></tr>${S.pay.slice().reverse().map(p=>`<tr><td>${p.id}</td><td>${p.o}</td><td>${p.inv}</td><td>${p.plan}</td><td>₹${p.amt}</td><td class="${p.st=='paid'?'ok':'er'}">${p.st}</td><td>${new Date(p.t).toLocaleString()}</td></tr>`).join('')}</table>`:'<span class="mu">No payments yet.</span>'}
$('plans').onclick=e=>{const n=e.target.dataset.p;if(!n)return;const m=+e.target.parentNode.querySelector('select').value;pend={n,m,amt:PLANS[n].p*m};$('rz').style.display='block';$('rz').scrollIntoView()};
$('cur').onclick=e=>{if(e.target.id=='cancel'&&confirm('Cancel and move to Free?')){S.plan='Free';S.sub=null;save();rPlans();rDl()}};
const rid=p=>p+Math.random().toString(36).slice(2,10);
function settle(ok){if(!pend)return;const r={id:rid('pay_'),o:rid('order_'),inv:'INV-'+Date.now().toString().slice(-6),plan:pend.n,amt:pend.amt,t:Date.now(),st:ok?'paid':'failed'};
if(S.pay.some(p=>p.plan==pend.n&&p.st=='paid'&&Date.now()-p.t<30000)&&ok){toast('Duplicate payment blocked.');return}
S.pay.push(r);if(ok){S.plan=pend.n;S.sub={exp:Date.now()+pend.m*30*864e5,cycle:pend.m==1?'monthly':pend.m==3?'quarterly':'yearly'};toast('Payment verified. Receipt sent to '+$('em').value+' (simulated).')}else toast('Payment failed. Your plan is unchanged.');
pend=null;$('rz').style.display='none';save();rPlans();rDl()}
$('pnow').onclick=()=>settle(true);$('pfail').onclick=()=>settle(false);$('pcan').onclick=()=>{pend=null;$('rz').style.display='none';toast('Payment cancelled.')};

const VID=[['Intro to Photography',48],['Cooking Basics',120],['Guitar Lesson 1',75],['Travel Vlog: Goa',210]];
const today=()=>new Date().toDateString();
function rDl(){checkExp();const lim=PLANS[S.plan].dl,used=new Set(S.dl.filter(d=>new Date(d.t).toDateString()==today()&&d.st=='completed'&&d.counted).map(d=>d.id+d.t)).size;
$('dlq').innerHTML=`Plan <b>${S.plan}</b>: ${Math.max(0,lim-used)} of ${lim} downloads left today. Quota resets at midnight.`;
$('dlv').innerHTML=VID.map((v,i)=>`<div class="card"><b>${v[0]}</b><div class="mu">${v[1]} MB</div><button class="b" data-d="${i}">Download</button></div>`).join('');
$('dlh').innerHTML=S.dl.length?`<table><tr><th>Video</th><th>Date</th><th>Status</th><th>Size</th><th>Plan</th><th>Quota left</th><th>Device</th></tr>${S.dl.slice().reverse().map(d=>`<tr><td>${esc(d.title)}</td><td>${new Date(d.t).toLocaleString()}</td><td class="${d.st=='completed'?'ok':'er'}">${d.st}</td><td>${d.mb} MB</td><td>${d.plan}</td><td>${d.left}</td><td>${esc(d.dev)}</td></tr>`).join('')}</table>`:'<span class="mu">No downloads yet.</span>'}
$('dlv').onclick=e=>{const i=e.target.dataset.d;if(i==null)return;checkExp();const v=VID[i],lim=PLANS[S.plan].dl,now=Date.now();
const dup=S.dl.find(d=>d.id==i&&d.st=='completed'&&now-d.t<6e5);
const used=S.dl.filter(d=>new Date(d.t).toDateString()==today()&&d.st=='completed'&&d.counted).length;
if(!dup&&used>=lim){toast(`Limit reached for ${S.plan} plan. Upgrade for more downloads.`);return}
const ok=Math.random()>.1;const rec={id:i,title:v[0],t:now,mb:v[1],plan:S.plan,st:ok?'completed':'failed',counted:ok&&!dup,left:Math.max(0,lim-used-(ok&&!dup?1:0)),dev:navigator.userAgent.slice(0,40),ip:'server-side'};
S.dl.push(rec);save();rDl();toast(!ok?'Download interrupted. Quota not used; try again.':dup?'Already downloaded recently. No quota used.':'Download complete.')};

const dev=()=>{const u=navigator.userAgent;const br=/Edg\//.test(u)?'Edge':/Firefox\//.test(u)?'Firefox':/Chrome\//.test(u)?'Chrome':/Safari\//.test(u)?'Safari':'Other';const os=/Windows/.test(u)?'Windows':/Android/.test(u)?'Android':/iPhone|iPad/.test(u)?'iOS':/Mac/.test(u)?'macOS':/Linux/.test(u)?'Linux':'Unknown';const ty=/Mobi/.test(u)?'Mobile':/Tablet|iPad/.test(u)?'Tablet':'Desktop';return{br,os,ty,key:br+'|'+os+'|'+ty}};
let pendLogin=null;
async function geo(){try{const r=await fetch('https://ipapi.co/json/');const j=await r.json();return{ip:j.ip,city:j.city,state:j.region,country:j.country_name}}catch(e){return{ip:'unavailable (needs server)',city:'Indore',state:'Madhya Pradesh',country:'India'}}}
$('login').onclick=async()=>{const d=dev(),g=await geo();const r={...d,...g,t:Date.now(),res:'pending'};const tr=S.trusted.find(x=>x.key==d.key&&x.city==g.city&&x.until>Date.now());
const known=S.logins.some(l=>l.key==d.key&&l.city==g.city&&l.res=='success');
if(tr){r.res='success';S.logins.push(r);applyTheme(S.theme||autoTheme());save();rSec();toast('Logged in from a trusted device.');return}
pendLogin=r;pendLogin.otp=String(Math.floor(1e5+Math.random()*9e5));$('otpv').textContent=pendLogin.otp;$('otpbox').style.display='block'};
$('vo').onclick=()=>{if(!pendLogin)return;if($('otp').value.trim()==pendLogin.otp){pendLogin.res='success';if($('trust').checked)S.trusted.push({key:pendLogin.key,label:pendLogin.br+' on '+pendLogin.os,city:pendLogin.city,until:Date.now()+30*864e5});delete pendLogin.otp;S.logins.push(pendLogin);pendLogin=null;$('otpbox').style.display='none';if(!S.theme)applyTheme(autoTheme());toast('Verified. Logged in.')}else{pendLogin.res='failed OTP';S.logins.push({...pendLogin,otp:undefined});toast('Wrong OTP.')}save();rSec()};
function rSec(){$('lh').innerHTML=S.logins.length?`<table><tr><th>Time</th><th>Browser</th><th>OS</th><th>Device</th><th>IP</th><th>Location</th><th>Result</th></tr>${S.logins.slice().reverse().map(l=>`<tr><td>${new Date(l.t).toLocaleString()}</td><td>${l.br}</td><td>${l.os}</td><td>${l.ty}</td><td>${esc(l.ip)}</td><td>${esc(l.city)}, ${esc(l.state)}, ${esc(l.country)}</td><td class="${l.res=='success'?'ok':'er'}">${l.res}</td></tr>`).join('')}</table>`:'<span class="mu">No logins recorded.</span>';
$('td').innerHTML=S.trusted.length?S.trusted.map((t,i)=>`<div class="row">${esc(t.label)} (${esc(t.city)}) until ${new Date(t.until).toLocaleDateString()} <button class="g" data-r="${i}">Remove</button></div>`).join(''):'<span class="mu">None.</span>';
$('sinfo').textContent=`IST hour now: ${istH()} → default theme: ${autoTheme()}`}
$('td').onclick=e=>{if(e.target.dataset.r){S.trusted.splice(+e.target.dataset.r,1);save();rSec()}};

const BAD=/\b(idiot|stupid|hate you|damn|trash)\b/i,LINK=/(https?:\/\/|www\.)/i;let post=[],cap=null,locked=false;
const LANGS={en:'English',hi:'Hindi',bn:'Bengali',mr:'Marathi',gu:'Gujarati',ta:'Tamil',te:'Telugu',kn:'Kannada',pa:'Punjabi',ur:'Urdu',es:'Spanish',fr:'French',de:'German',ar:'Arabic',ja:'Japanese'};
$('lang').innerHTML=Object.keys(LANGS).map(k=>`<option value="${k}">Translate to ${LANGS[k]}</option>`).join('');
$('lang').value=S.lang&&LANGS[S.lang]?S.lang:'en';
const TR={};
async function getJSON(url){const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);try{const r=await fetch(url,{signal:c.signal});if(!r.ok)throw 0;return await r.json()}finally{clearTimeout(t)}}
async function translate(text,to){
 try{const j=await getJSON('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl='+to+'&dt=t&q='+encodeURIComponent(text));
  const out=(j[0]||[]).map(x=>x[0]).join('');if(out)return{text:out,from:j[2],same:j[2]==to}}catch(e){}
 try{const j=await getJSON('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text.slice(0,450))+'&langpair=Autodetect|'+to);
  const out=j.responseData&&j.responseData.translatedText;if(j.responseStatus==200&&out)return{text:out,same:out.trim().toLowerCase()==text.trim().toLowerCase()}}catch(e){}
 return null}
function trBox(c){const t=TR[c.id];if(!t)return'';
 if(t.load)return'<div class="tr mu">Translating…</div>';
 if(t.err)return'<div class="tr er">Translation failed. Check your internet connection and try again.</div>';
 if(t.same)return`<div class="tr mu">This comment is already in ${esc(LANGS[t.to])}.</div>`;
 return`<div class="tr"><span class="mu">${esc(LANGS[t.to])}${t.from&&LANGS[t.from]?' (from '+esc(LANGS[t.from])+')':''}:</span> ${esc(t.text)}</div>`}
$('lang').onchange=()=>{for(const k in TR)delete TR[k];S.lang=$('lang').value;save();rCm()};
function score(c){return c.up-c.dn+(c.re?c.re.length:0)}
function rCm(){const so=$('sort').value;const L=S.cm.filter(c=>!c.par&&!c.del||S.cm.some(r=>r.par==c.id&&!r.del));
L.sort((a,b)=>so=='new'?b.t-a.t:so=='old'?a.t-b.t:so=='likes'?b.up-a.up:score(b)-score(a));
const one=(c,rep)=>c.del?`<div class="cm ${rep?'rep':''} mu">[deleted comment]</div>`:`<div class="cm ${rep?'rep':''}"><span class="av">${esc(c.u[0]).toUpperCase()}</span><b>${esc(c.u)}</b> <span class="mu">${esc(c.loc)} · ${new Date(c.t).toLocaleString()}${c.ed?' · edited':''}${c.flag?' · under review':''}</span><div id="c${c.id}">${esc(c.tx).replace(/@(\w+)/g,'<span class="mn">@$1</span>')}</div>${trBox(c)}<div class="row"><button class="g" data-a="up" data-i="${c.id}">Like ${c.up}</button><button class="g" data-a="dn" data-i="${c.id}">Dislike ${c.dn}</button><button class="g" data-a="rp" data-i="${c.id}">Reply</button><button class="g" data-a="tl" data-i="${c.id}">${TR[c.id]&&!TR[c.id].load?'Show original':'Translate'}</button>${c.u==me?(Date.now()-c.t<3e5?`<button class="g" data-a="ed" data-i="${c.id}">Edit</button><button class="g" data-a="dl" data-i="${c.id}">Delete</button>`:'<span class="mu">edit window closed</span>'):`<select data-a="rpt" data-i="${c.id}"><option value="">Report…</option><option>Spam</option><option>Harassment</option><option>Offensive content</option></select>`}</div></div>`;
$('clist').innerHTML=L.length?L.map(c=>one(c,0)+S.cm.filter(r=>r.par==c.id).map(r=>one(r,1)).join('')).join(''):'<p class="mu">No comments yet. Start the conversation.</p>'}
function addC(tx,par){const now=Date.now();post=post.filter(t=>now-t<30000);
if(!tx.trim())return'Write something first.';if(BAD.test(tx))return'Abusive language is not allowed.';if(LINK.test(tx))return'Links are blocked to prevent spam.';if(/([^\w\s])\1{4,}/u.test(tx)||/(\p{Extended_Pictographic}\s*){6,}/u.test(tx))return'Too many repeated symbols or emojis.';
if(S.cm.some(c=>!c.del&&c.u==me&&c.tx==tx))return'Duplicate comment.';if(post.length>=4&&!cap){cap=[Math.ceil(Math.random()*9),Math.ceil(Math.random()*9)];$('cap').style.display='flex';$('capq').textContent=`Verify you're human: ${cap[0]} + ${cap[1]} =`;return'Posting too fast. Solve the check to continue.'}
if(cap){if(+$('capa').value!=cap[0]+cap[1])return'Wrong answer.';cap=null;$('cap').style.display='none';$('capa').value='';post=[]}
if(post.length>=8)return'Rate limit reached. Wait a moment.';
post.push(now);S.cm.push({id:now,u:me,loc:'Indore, IN',t:now,tx,up:0,dn:0,par:par||null,reps:[],reports:[]});save();return''}
$('cpost').onclick=()=>{const e=addC($('ct').value,0);$('cerr').textContent=e;if(!e){$('ct').value=''}rCm()};
$('sort').onchange=rCm;
$('clist').onclick=async e=>{const a=e.target.dataset.a,i=+e.target.dataset.i;if(!a||a=='rpt')return;const c=S.cm.find(x=>x.id==i);if(!c)return;
if(a=='up'||a=='dn'){c[a]++;if(c.dn>=10)c.flag=true}
if(a=='rp'){const t=prompt('Reply to '+c.u);if(t){const r=addC('@'+c.u+' '+t,c.id);if(r)toast(r)}}
if(a=='ed'){const t=prompt('Edit comment',c.tx);if(t&&!BAD.test(t)&&!LINK.test(t)&&Date.now()-c.t<3e5){c.tx=t;c.ed=true}else toast('Edit not allowed.')}
if(a=='dl'){c.del=true}
if(a=='tl'){if(TR[i]&&!TR[i].load){delete TR[i];rCm();return}
const to=$('lang').value;TR[i]={load:1};rCm();
const r=await translate(c.tx,to);
TR[i]=r?(r.same?{same:1,to}:{text:r.text,from:r.from,to}):{err:1};rCm();return}
save();rCm()};
$('clist').onchange=e=>{if(e.target.dataset.a!='rpt'||!e.target.value)return;const c=S.cm.find(x=>x.id==+e.target.dataset.i);if(c.reports.includes(me)){toast('You already reported this.');return}c.reports.push(me);c.flag=true;save();rCm();toast('Reported. A moderator will review it; it is not deleted automatically.')};

const V=$('v'),VW=$('vw');let key='',hideT;
$('vf').onchange=e=>{const f=e.target.files[0];if(!f)return;if(/\.vtt$/i.test(f.name)){const t=document.createElement('track');t.kind='subtitles';t.src=URL.createObjectURL(f);t.default=true;V.appendChild(t);return}key=f.name+f.size;V.src=URL.createObjectURL(f);$('pinfo').textContent=f.name+' · '+(f.size/1048576).toFixed(1)+' MB';$('ytitle').textContent=f.name;V.onloadedmetadata=()=>{const p=S.vpos[key];if(p&&p<V.duration-5){V.currentTime=p;toast('Resumed from '+fmt(p))}$('pinfo').textContent+=' · '+V.videoWidth+'x'+V.videoHeight}};
const tg=()=>V.paused?V.play():V.pause(),sk=s=>{V.currentTime=Math.max(0,Math.min(V.duration||0,V.currentTime+s))};
$('pp').onclick=tg;$('bk').onclick=()=>sk(-10);$('fw').onclick=()=>sk(10);V.onclick=tg;
$('mt').onclick=()=>V.muted=!V.muted;$('vol').oninput=e=>{V.volume=e.target.value;V.muted=false};
$('sp').onchange=e=>V.playbackRate=+e.target.value;
$('th').onclick=()=>VW.classList.toggle('th');
$('fs').onclick=()=>document.fullscreenElement?document.exitFullscreen():VW.requestFullscreen&&VW.requestFullscreen();
$('pip').onclick=()=>{try{document.pictureInPictureElement?document.exitPictureInPicture():V.requestPictureInPicture()}catch(e){toast('PiP not supported.')}};
$('cp').onclick=()=>{const t=V.textTracks;if(!t.length)return toast('No captions loaded. Choose a .vtt file.');t[0].mode=t[0].mode=='showing'?'hidden':'showing'};
V.onplay=()=>{$('pp').textContent='Pause';$('bigplay').classList.add('hide');document.querySelectorAll('video').forEach(o=>{if(o!==V&&o.id!='me')o.pause()})};V.onpause=()=>{$('pp').textContent='Play';$('bigplay').classList.remove('hide')};
let lastSave=0;V.ontimeupdate=()=>{$('pr').style.width=(V.currentTime/V.duration*100||0)+'%';$('tm').textContent=fmt(V.currentTime)+' / '+fmt(V.duration)+' (-'+fmt(V.duration-V.currentTime)+')';if(key&&Date.now()-lastSave>3000){lastSave=Date.now();S.vpos[key]=V.currentTime;save()}if(V.duration&&V.currentTime/V.duration>.9&&key&&!S.vpos['done'+key]){S.vpos['done'+key]=1;toast('Marked as completed');save()}};
V.onprogress=()=>{try{$('bf').style.width=(V.buffered.end(V.buffered.length-1)/V.duration*100)+'%'}catch(e){}};V.onwaiting=()=>$('pinfo').textContent='Buffering…';V.oncanplay=()=>{};
const tl=$('tl');tl.onclick=e=>{const r=tl.getBoundingClientRect();V.currentTime=(e.clientX-r.left)/r.width*V.duration};
tl.onmousemove=e=>{const r=tl.getBoundingClientRect(),t=$('tt');t.style.display='block';t.style.left=(e.clientX-VW.getBoundingClientRect().left-14)+'px';t.textContent=fmt((e.clientX-r.left)/r.width*V.duration)};tl.onmouseleave=()=>$('tt').style.display='none';
VW.onmousemove=()=>{VW.classList.remove('hide');clearTimeout(hideT);hideT=setTimeout(()=>{if(!V.paused)VW.classList.add('hide')},2500)};
document.onkeydown=e=>{if(!$('s-pl').classList.contains('on')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key,sh=e.shiftKey;let h=1;
if(k==' ')tg();else if(k=='ArrowLeft')sk(sh?-30:-10);else if(k=='ArrowRight')sk(sh?30:10);else if(k=='ArrowUp'){V.volume=Math.min(1,V.volume+.1);$('vol').value=V.volume}else if(k=='ArrowDown'){V.volume=Math.max(0,V.volume-.1);$('vol').value=V.volume}
else if(k=='m')V.muted=!V.muted;else if(k=='f')$('fs').click();else if(k=='t')$('th').click();else if(k=='p')$('pip').click();else if(k=='c')$('cp').click();
else if(k=='>'||k=='<'){const s=$('sp'),i=Math.max(0,Math.min(4,s.selectedIndex+(k=='>'?1:-1)));s.selectedIndex=i;V.playbackRate=+s.value}else h=0;if(h)e.preventDefault()};

$('bigplay').onclick=()=>{V.play()};
$('like').onclick=()=>toast('Liked this video.');
$('share').onclick=()=>toast('Share link copied (demo).');
$('save').onclick=()=>toast('Saved to your list (demo).');
const UPS=[['Deep Focus Music', '2:14:00'], ['Lo-fi Beats', '1:02:30'], ['Cooking Basics', '20:15'], ['Travel Vlog: Goa', '12:40']];
$('ups').innerHTML=UPS.map(u=>`<div class="up"><div class="thumb"></div><div><b>${u[0]}</b><div class="mu">${u[1]}</div></div></div>`).join('');
$('ups').onclick=e=>{const up=e.target.closest('.up');if(up)toast('Demo: '+up.querySelector('b').textContent)};

let stream=null,rec=null,dur=0,durT,hand=false,guests=[],cchat=[];
const cs=()=>$('cstat').textContent=`Duration ${fmt(dur)} · Connection: ${navigator.onLine?(navigator.connection&&navigator.connection.effectiveType||'good'):'offline, reconnecting…'} · Max 8 participants${locked?' · Meeting locked':''}`;
function rP(){$('plist').innerHTML=`<div>● You (Host)${hand?' (hand raised)':''} <span class="mu">mic ${stream&&stream.getAudioTracks()[0]&&stream.getAudioTracks()[0].enabled?'on':'off'}</span></div>`+guests.map((g,i)=>`<div class="row">${esc(g.n)} ${g.co?'(co-host)':''} <span class="mu">${g.m?'muted':'speaking'}</span><button class="g" data-g="m${i}">Mute</button><button class="g" data-g="c${i}">Co-host</button><button class="g" data-g="r${i}">Remove</button></div>`).join('')}
$('join').onclick=async()=>{const r=$('room').value.trim()||'room-'+Math.random().toString(36).slice(2,7);$('room').value=r;
try{stream=await navigator.mediaDevices.getUserMedia({video:true,audio:{noiseSuppression:true,echoCancellation:true}});$('me').srcObject=stream}catch(e){stream=null;toast('Camera or microphone permission denied. You can still join as a listener.')}
$('callui').style.display='block';$('cinfo').textContent='Joined '+r+' · share this ID to invite others';dur=0;clearInterval(durT);durT=setInterval(()=>{dur++;cs()},1000);cs();rP()};
$('cm').onclick=()=>{if(!stream)return;const t=stream.getAudioTracks()[0];t.enabled=!t.enabled;$('cm').querySelector('span').textContent=t.enabled?'Mute':'Unmute';rP()};
$('cc').onclick=()=>{if(!stream)return;const t=stream.getVideoTracks()[0];t.enabled=!t.enabled;$('cc').querySelector('span').textContent=t.enabled?'Camera off':'Camera on'};
$('cf').onclick=async()=>{try{const t=stream.getVideoTracks()[0],fm=t.getSettings().facingMode=='user'?'environment':'user';const n=await navigator.mediaDevices.getUserMedia({video:{facingMode:fm}});t.stop();stream.removeTrack(t);stream.addTrack(n.getVideoTracks()[0])}catch(e){toast('Cannot switch camera on this device.')}};
$('cs').onclick=async()=>{try{const d=await navigator.mediaDevices.getDisplayMedia({video:true});$('me').srcObject=d;d.getVideoTracks()[0].onended=()=>$('me').srcObject=stream}catch(e){toast('Screen sharing not allowed here.')}};
$('ch').onclick=()=>{hand=!hand;rP()};$('cl').onclick=()=>{locked=!locked;$('cl').querySelector('span').textContent=locked?'Unlock':'Lock';cs()};
$('cg').onclick=()=>{if(locked)return toast('Meeting is locked.');if(guests.length>=7)return toast('Participant limit reached.');guests.push({n:'Guest '+(guests.length+1),m:false});const v=document.createElement('video');v.muted=true;v.style.background='#223';v.dataset.g=1;$('vids').appendChild(v);rP()};
$('plist').onclick=e=>{const g=e.target.dataset.g;if(!g)return;const i=+g.slice(1);if(g[0]=='m')guests[i].m=!guests[i].m;if(g[0]=='c')guests[i].co=!guests[i].co;if(g[0]=='r'){guests.splice(i,1);$('vids').querySelectorAll('[data-g]')[i].remove()}rP()};
const EM=['\u{1F600}','\u{1F602}','\u{1F44D}','\u{2764}\u{FE0F}','\u{1F389}','\u{1F64F}','\u{1F525}','\u{1F622}'];
function emBar(id,inp){$(id).innerHTML=EM.map(e=>`<button type="button" class="g" aria-label="Insert emoji">${e}</button>`).join('');$(id).onclick=ev=>{if(ev.target.tagName=='BUTTON'){$(inp).value+=ev.target.textContent;$(inp).focus()}}}
emBar('cem','cin');emBar('cem2','ct');
function rChat(){$('cchat').innerHTML=cchat.map(m=>m.url?`<div><b>You:</b> File: <a href="${m.url}" download="${esc(m.n)}">${esc(m.n)}</a> <span class="mu">(${(m.sz/1024).toFixed(0)} KB)</span></div>`:`<div><b>You:</b> ${esc(m.t)}</div>`).join('');$('cchat').scrollTop=1e9}
$('csend').onclick=()=>{const t=$('cin').value.trim();if(!t)return;cchat.push({t});$('cin').value='';rChat()};
$('cin').onkeydown=e=>{if(e.key=='Enter')$('csend').click()};
$('cfile').onchange=e=>{const f=e.target.files[0];e.target.value='';if(!f)return;if(f.size>10*1048576)return toast('File is too large. Maximum 10 MB.');if(/\.(exe|bat|cmd|msi|js|vbs|scr)$/i.test(f.name))return toast('This file type is not allowed.');cchat.push({n:f.name,sz:f.size,url:URL.createObjectURL(f)});rChat();toast('File shared in chat.')};
$('cr').onclick=()=>{if(!stream)return;if(rec&&rec.state=='recording'){rec.stop();$('cr').querySelector('span').textContent='Record';return}const ch=[];rec=new MediaRecorder(stream);rec.ondataavailable=e=>ch.push(e.data);rec.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(ch,{type:'video/webm'}));a.download='meeting.webm';a.click()};rec.start();$('cr').querySelector('span').textContent='Stop'};
$('cx').onclick=()=>{if(stream)stream.getTracks().forEach(t=>t.stop());clearInterval(durT);$('callui').style.display='none';guests=[];$('vids').querySelectorAll('[data-g]').forEach(n=>n.remove())};
document.querySelectorAll('.zm-tabs button').forEach(b=>{b.onclick=()=>{document.querySelectorAll('.zm-tabs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');const p=b.dataset.zp;document.querySelectorAll('.zm-pane').forEach(x=>x.classList.remove('on'));$('pane-'+p).classList.add('on')}});
addEventListener('offline',cs);addEventListener('online',()=>toast('Back online. Reconnected.'));
$('who').textContent='';rPlans();rDl();rSec();rCm();
