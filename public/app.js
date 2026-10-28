/* ====== À PERSONNALISER ====== */
const CONTACT = {
  whatsapp: "590690533906",        // numéro international sans + ni espaces
  email: "bojadinla@gmail.com"
};
/* ============================== */
const ROOM = "1686923054634848912";
const EXT = "png"; // changez en "jpg" ou "webp" si vous convertissez vos photos
const PHOTOS = Array.from({length:10}, (_, i) => i + 1).map(n => `images/${n}.${EXT}`);
// Description affichée sous la photo (optionnel, "" = rien). Une entrée par photo, dans l'ordre.
const CAPTIONS = ["", "", "", "", "", "", "", "", "", ""];

/* Nav, reveal */
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("solid", scrollY > 60);
addEventListener("scroll", onScroll, {passive:true}); onScroll();
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("in")), {threshold:.1});
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* Galerie + lightbox */
const lb = document.getElementById("lb"), lbImg = lb.querySelector("img"), lbCap = document.getElementById("lb-cap");
let cur = 0;
const show = i => {
  cur = (i + PHOTOS.length) % PHOTOS.length;
  lbImg.src = PHOTOS[cur];
  lbImg.alt = `Bò Jadin La, photo ${cur + 1}`;
  lbCap.textContent = CAPTIONS[cur] || "";
  lb.hidden = false;
};
const closeLb = () => lb.hidden = true;
document.getElementById("gallery").innerHTML = PHOTOS.map((p,i) =>
  `<img loading="lazy" src="${p}" data-full="${p}" alt="Bò Jadin La, photo ${i+1}">`).join("");
document.getElementById("gallery").addEventListener("click", e => {
  if (e.target.dataset.full) show(PHOTOS.indexOf(e.target.dataset.full));
});
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
document.getElementById("lb-x").onclick = closeLb;
document.getElementById("lb-prev").onclick = () => show(cur - 1);
document.getElementById("lb-next").onclick = () => show(cur + 1);
addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  else if (e.key === "ArrowLeft") show(cur - 1);
  else if (e.key === "ArrowRight") show(cur + 1);
});
let x0 = null;
lb.addEventListener("touchstart", e => x0 = e.touches[0].clientX, {passive:true});
lb.addEventListener("touchend", e => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  x0 = null;
});

/* Avis (données dans data/reviews.json) */
const esc = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fr = v => String(v).replace(".", ",");
fetch("data/reviews.json", {cache:"no-cache"}).then(r => r.json()).then(r => {
  if (!r.rating && !(r.testimonials || []).length) return;
  document.getElementById("avis").hidden = false;
  if (r.rating) document.getElementById("rating-h").innerHTML = `<span><span class="gs">★</span> ${fr(r.rating)}</span><small>${r.count} commentaire${r.count>1?"s":""} sur Airbnb</small>`;
  document.getElementById("tags").innerHTML = (r.tags || []).map(t => `<span>${esc(t)}</span>`).join("");
  const list = (r.testimonials || []).slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const monthFr = d => /^\d{4}-\d{2}/.test(d) ? new Date(+d.slice(0,4), +d.slice(5,7) - 1, 1).toLocaleDateString("fr-FR", {month:"long", year:"numeric"}) : d;
  const card = t => `<blockquote>${t.stars ? `<div class="gs stars">${"★".repeat(Math.min(5, +t.stars || 0))}</div>` : ""}“${esc(t.text)}”<cite>${esc(t.author)}${t.date ? " · " + esc(monthFr(t.date)) : ""}</cite></blockquote>`;
  const quotes = document.getElementById("quotes"), moreBtn = document.getElementById("more-rev");
  let shown = 0;
  const showMore = () => {
    quotes.insertAdjacentHTML("beforeend", list.slice(shown, shown + 3).map(card).join(""));
    shown = Math.min(shown + 3, list.length);
    moreBtn.hidden = shown >= list.length;
  };
  moreBtn.onclick = showMore;
  showMore();
  document.getElementById("scores").innerHTML = (r.scores || []).map(([n,v]) =>
    `<div class="score"><span>${esc(n)}</span><div class="bar"><i style="width:${v/5*100}%"></i></div><b>${fr(v)}</b></div>`).join("");
  if (r.updated) document.getElementById("rev-updated").textContent = "Notes Airbnb relevées le " + new Date(r.updated).toLocaleDateString("fr-FR",{dateStyle:"long"});
}).catch(() => {});

/* Calendrier */
/* Tarifs (données dans data/tarifs.json) */
let T = {nightly:56, taxPerPersonNight:2, cleaning:0, minNights:1};
const eur = v => v.toLocaleString("fr-FR",{maximumFractionDigits:2}) + " €";
const quoteText = (n, g, html = true) => {
  const s = k => k > 1 ? "s" : "";
  const lines = [
    `Logement : ${eur(T.nightly)} × ${n} nuit${s(n)} = ${eur(n*T.nightly)}`,
    `Taxe de séjour : ${eur(T.taxPerPersonNight)} × ${g} personne${s(g)} × ${n} nuit${s(n)} = ${eur(n*g*T.taxPerPersonNight)}`
  ];
  if (T.cleaning) lines.push(`Ménage : ${eur(T.cleaning)}`);
  lines.push("Frais de plateforme : 0 €");
  const total = `Total : ${eur(n*T.nightly + n*g*T.taxPerPersonNight + (T.cleaning || 0))}`;
  return html ? lines.join("<br>") + `<br><b>${total}</b>` : lines.join("\n") + "\n" + total;
};
const nightsCount = () => Math.round((parse(b)-parse(a))/864e5);
const updateQuote = () => { const q = document.getElementById("quote"); if (q) q.innerHTML = quoteText(nightsCount(), parseInt(document.getElementById("f-guests").value)); };
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
    h += `<button class="${c.join(" ")}" data-k="${k}">${i}${c.includes("past")||c.includes("booked")?"":`<small>${T.nightly} €</small>`}</button>`;
  }
  return h + "</div></div>";
}

function render() {
  const m2 = new Date(view.getFullYear(), view.getMonth()+1, 1);
  document.getElementById("months").innerHTML = renderMonth(view) + renderMonth(m2);
  const r = document.getElementById("result");
  if (a && b) {
    const n = Math.round((parse(b)-parse(a))/864e5);
    if (n < T.minNights) { r.className = "result bad"; r.hidden = false; r.innerHTML = `<span>Séjour minimum : ${T.minNights} nuits.</span>`; return; }
    r.className = "result col"; r.hidden = false;
    r.innerHTML = `<div class="ok">✅ <b>${fmt(a)} → ${fmt(b)}</b> · ${n} nuit${n>1?"s":""} disponible${n>1?"s":""}</div>
      <div class="fields"><input id="f-name" placeholder="Votre prénom" autocomplete="given-name">
      <select id="f-guests"><option>1 voyageur</option><option>2 voyageurs</option></select></div>
      <div class="quote" id="quote"></div>
      <div class="actions"><button class="btn" data-send="wa">Demander via WhatsApp</button>
      <button class="btn alt" data-send="mail">Demander par e-mail</button></div>
      <a class="airbnb-link" href="https://www.airbnb.fr/rooms/${ROOM}?check_in=${a}&check_out=${b}&adults=1" target="_blank" rel="noopener">ou réserver via Airbnb</a>`;
    updateQuote();
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

document.getElementById("result").addEventListener("change", e => e.target.id === "f-guests" && updateQuote());
document.getElementById("result").addEventListener("click", e => {
  const t = e.target.dataset.send; if (!t) return;
  const name = document.getElementById("f-name").value.trim();
  const guests = document.getElementById("f-guests").value;
  const n = Math.round((parse(b)-parse(a))/864e5);
  const msg = `Bonjour${name ? ", je suis " + name : ""}. Je souhaite réserver Bò Jadin La du ${fmt(a,{day:"numeric",month:"long",year:"numeric"})} au ${fmt(b,{day:"numeric",month:"long",year:"numeric"})} (${n} nuit${n>1?"s":""}) pour ${guests}. \n\nEstimation :\n${quoteText(n, parseInt(guests), false)}\n\nEst-ce possible ? Merci !`;
  location.href = t === "wa"
    ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`
    : `mailto:${CONTACT.email}?subject=${encodeURIComponent("Demande de réservation Bò Jadin La")}&body=${encodeURIComponent(msg)}`;
});
document.getElementById("mail").href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Réservation Bò Jadin La")}`;
document.getElementById("wa").href = `https://wa.me/${CONTACT.whatsapp}`;

const load = u => fetch(u, {cache:"no-cache"}).then(r => r.json()).catch(() => ({bookings:[]}));
Promise.all([load("data/bookings.json"), load("data/manual.json"), load("data/tarifs.json")]).then(([data, man, tar]) => {
  if (tar.nightly) T = {...T, ...tar};

  [...(data.bookings || []), ...(man.bookings || [])].forEach(({start, end}) => {
    for (let d = parse(start); key(d) < end; d = addDays(d,1)) busy.add(key(d));
  });
  if (data.updated) document.getElementById("updated").textContent = "Dernière modification du calendrier le " + new Date(data.updated).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"});
  render();
}).catch(() => { render(); });

/* Météo du moment à Grand-Bourg (Open-Meteo, sans clé) */
const WMO = c => c === 0 ? ["☀️","Grand soleil"] : c <= 2 ? ["🌤️","Peu nuageux"] : c === 3 ? ["☁️","Couvert"] :
  c <= 48 ? ["🌫️","Brumeux"] : c <= 57 ? ["🌦️","Bruine"] : c <= 67 ? ["🌧️","Pluie"] : c <= 82 ? ["🌦️","Averses"] : c >= 95 ? ["⛈️","Orage"] : ["🌴","Variable"];
fetch("https://api.open-meteo.com/v1/forecast?latitude=15.88&longitude=-61.31&current=temperature_2m,weather_code,wind_speed_10m&timezone=America%2FGuadeloupe")
  .then(r => r.json()).then(d => {
    const c = d.current, [icon, label] = WMO(c.weather_code), el = document.getElementById("meteo");
    el.textContent = `${icon} ${Math.round(c.temperature_2m)} °C à Grand-Bourg · ${label} · vent ${Math.round(c.wind_speed_10m)} km/h`;
    el.hidden = false;
  }).catch(() => {});

/* Carrousel de la section « Le logement » */
const track = document.getElementById("track"), count = document.getElementById("count");
track.innerHTML = PHOTOS.map((p, i) => `<img loading="lazy" src="${p}" data-full="${p}" alt="Bò Jadin La, photo ${i+1}">`).join("");
const updCount = () => count.textContent = `${Math.round(track.scrollLeft / track.clientWidth) + 1} / ${PHOTOS.length}`;
track.addEventListener("scroll", updCount, {passive:true}); updCount();
const slide = dir => {
  const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
  if (dir > 0 && end) track.scrollTo({left:0, behavior:"smooth"});
  else if (dir < 0 && track.scrollLeft < 5) track.scrollTo({left:track.scrollWidth, behavior:"smooth"});
  else track.scrollBy({left:dir * track.clientWidth, behavior:"smooth"});
};
document.getElementById("c-prev").onclick = () => slide(-1);
document.getElementById("c-next").onclick = () => slide(1);
track.addEventListener("click", e => { if (e.target.dataset.full) show(PHOTOS.indexOf(e.target.dataset.full)); });
