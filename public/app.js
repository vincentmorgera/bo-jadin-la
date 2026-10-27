const ROOM = "1686923054634848912";
const EXT = "png"; // changez en "jpg" ou "webp" si vous convertissez vos photos
const PHOTOS = [1,2,3,4,5].map(n => `images/${n}.${EXT}`);
const SCORES = [["Propreté",4.9],["Précision",4.8],["Arrivée",4.8],["Communication",4.9],["Emplacement",4.8],["Qualité-prix",4.7]];

/* Nav, reveal */
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("solid", scrollY > 60);
addEventListener("scroll", onScroll, {passive:true}); onScroll();
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("in")), {threshold:.1});
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* Galerie + lightbox */
const lb = document.getElementById("lb"), lbImg = lb.querySelector("img");
document.getElementById("gallery").innerHTML = PHOTOS.map((p,i) =>
  `<img loading="lazy" src="${p}" data-full="${p}" alt="Bò Jadin La, photo ${i+1}">`).join("");
document.getElementById("gallery").addEventListener("click", e => {
  if (e.target.dataset.full) { lbImg.src = e.target.dataset.full; lb.hidden = false; }
});
lb.addEventListener("click", () => lb.hidden = true);
addEventListener("keydown", e => e.key === "Escape" && (lb.hidden = true));

/* Notes */
document.getElementById("scores").innerHTML = SCORES.map(([n,v]) =>
  `<div class="score"><span>${n}</span><div class="bar"><i style="width:${v/5*100}%"></i></div><b>${String(v).replace(".",",")}</b></div>`).join("");

/* Calendrier */
const pad = n => String(n).padStart(2,"0");
const key = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d); };
const addDays = (d,n) => new Date(d.getFullYear(), d.getMonth(), d.getDate()+n);
const fmt = (s,o={day:"numeric",month:"short"}) => parse(s).toLocaleDateString("fr-FR",o);
const todayKey = key(new Date());

const busy = new Set();            // nuits occupées (clé = jour de la nuit)
let view = new Date(); view.setDate(1);
let a = null, b = null;

const nightsFree = (from, to) => { for (let d = parse(from); key(d) < to; d = addDays(d,1)) if (busy.has(key(d))) return false; return true; };

function renderMonth(first) {
  const days = new Date(first.getFullYear(), first.getMonth()+1, 0).getDate();
  const off = (first.getDay()+6)%7;
  let h = `<div class="month"><h3>${first.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}</h3><div class="grid">`;
  h += ["L","M","M","J","V","S","D"].map(x => `<div class="wd">${x}</div>`).join("");
  h += '<div class="empty"></div>'.repeat(off);
  for (let i = 1; i <= days; i++) {
    const d = new Date(first.getFullYear(), first.getMonth(), i), k = key(d);
    const c = ["d"];
    if (k < todayKey) c.push("past");
    else if (busy.has(k)) { c.push("booked"); if (a && !b && k > a) c.push("end-ok"); }
    if (k === todayKey) c.push("today");
    if (k === a || k === b) c.push("sel");
    else if (a && b && k > a && k < b) c.push("range");
    h += `<button class="${c.join(" ")}" data-k="${k}">${i}</button>`;
  }
  return h + "</div></div>";
}

function render() {
  const m2 = new Date(view.getFullYear(), view.getMonth()+1, 1);
  document.getElementById("months").innerHTML = renderMonth(view) + renderMonth(m2);
  const r = document.getElementById("result");
  if (a && b) {
    const n = Math.round((parse(b)-parse(a))/864e5);
    const url = `https://www.airbnb.fr/rooms/${ROOM}?check_in=${a}&check_out=${b}&adults=1`;
    r.className = "result"; r.hidden = false;
    r.innerHTML = `<span>✅ <b>${fmt(a)} → ${fmt(b)}</b> · ${n} nuit${n>1?"s":""} disponible${n>1?"s":""}</span><a class="btn" href="${url}" target="_blank" rel="noopener">Réserver sur Airbnb</a>`;
  } else if (a) {
    r.className = "result"; r.hidden = false;
    r.innerHTML = `<span>Arrivée le <b>${fmt(a)}</b>. Choisissez maintenant votre date de départ.</span>`;
  } else r.hidden = true;
}

document.getElementById("months").addEventListener("click", e => {
  const k = e.target.dataset.k; if (!k) return;
  const isBusy = busy.has(k);
  if (!a || (a && b)) { if (isBusy) return; a = k; b = null; }
  else if (k <= a) { if (isBusy) return; a = k; }
  else if (nightsFree(a, k)) b = k;
  else { const r = document.getElementById("result"); r.hidden = false; r.className = "result bad";
         r.innerHTML = "<span>Cette période contient des nuits occupées. Essayez d'autres dates.</span>"; a = isBusy ? null : k; b = null; return; }
  render();
});
document.getElementById("prev").onclick = () => { view = new Date(view.getFullYear(), view.getMonth()-1, 1); render(); };
document.getElementById("next").onclick = () => { view = new Date(view.getFullYear(), view.getMonth()+1, 1); render(); };

fetch("data/bookings.json", {cache:"no-cache"}).then(r => r.json()).then(data => {
  (data.bookings || []).forEach(({start, end}) => {
    for (let d = parse(start); key(d) < end; d = addDays(d,1)) busy.add(key(d));
  });
  let d = parse(todayKey), n = 0;
  while (busy.has(key(d)) && n++ < 730) d = addDays(d,1);
  document.getElementById("next-free").textContent = key(d) === todayKey ? "✨ Disponible dès aujourd'hui" : `Prochaine nuit libre : ${fmt(key(d),{weekday:"long",day:"numeric",month:"long"})}`;
  if (data.updated) document.getElementById("updated").textContent = "Mis à jour le " + new Date(data.updated).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"});
  render();
}).catch(() => { document.getElementById("next-free").textContent = "Calendrier indisponible, consultez Airbnb"; render(); });
