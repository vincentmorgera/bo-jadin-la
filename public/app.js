/* ====== À PERSONNALISER ====== */
const CONTACT = {
  whatsapp: "590XXXXXXXXX",        // numéro international sans + ni espaces (ex : 590690123456)
  email: "VOTRE@EMAIL.COM"
};
/* ============================== */
const ROOM = "1686923054634848912";
const EXT = "png"; // changez en "jpg" ou "webp" si vous convertissez vos photos
const PHOTOS = [1,2,3,4,5].map(n => `images/${n}.${EXT}`);

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

/* Avis (données dans data/reviews.json) */
const esc = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fr = v => String(v).replace(".", ",");
fetch("data/reviews.json", {cache:"no-cache"}).then(r => r.json()).then(r => {
  if (r.badge) document.getElementById("badge").textContent = r.badge;
  if (!r.rating && !(r.testimonials || []).length) return;
  document.getElementById("avis").hidden = false;
  if (r.rating) document.getElementById("rating-h").innerHTML = `★ ${fr(r.rating)} <small>· ${r.count} commentaire${r.count>1?"s":""} sur Airbnb</small>`;
  document.getElementById("tags").innerHTML = (r.tags || []).map(t => `<span>${esc(t)}</span>`).join("");
  document.getElementById("quotes").innerHTML = (r.testimonials || []).map(t =>
    `<blockquote>“${esc(t.text)}”<cite>${esc(t.author)}${t.date ? " · " + esc(t.date) : ""}</cite></blockquote>`).join("");
  document.getElementById("scores").innerHTML = (r.scores || []).map(([n,v]) =>
    `<div class="score"><span>${esc(n)}</span><div class="bar"><i style="width:${v/5*100}%"></i></div><b>${fr(v)}</b></div>`).join("");
  if (r.updated) document.getElementById("rev-updated").textContent = "Notes Airbnb relevées le " + new Date(r.updated).toLocaleDateString("fr-FR",{dateStyle:"long"});
}).catch(() => {});

/* Calendrier */
/* Tarifs (données dans data/tarifs.json) */
let T = {nightly:56, taxPerPersonNight:2, cleaning:0, minNights:1};
const eur = v => v.toLocaleString("fr-FR",{maximumFractionDigits:2}) + " €";
const quoteText = (n, g, html = true) => {
  const lodging = n*T.nightly, tax = n*g*T.taxPerPersonNight, clean = T.cleaning || 0, total = lodging+tax+clean;
  const t = `${n} nuit${n>1?"s":""} × ${eur(T.nightly)} = ${eur(lodging)} + taxe de séjour ${eur(tax)}${clean?` + ménage ${eur(clean)}`:""} → <b>${eur(total)}</b>`;
  return html ? t : t.replace(/<\/?b>/g,"");
};
const nightsCount = () => Math.round((parse(b)-parse(a))/864e5);
const updateQuote = () => { const q = document.getElementById("quote"); if (q) q.innerHTML = quoteText(nightsCount(), parseInt(document.getElementById("f-guests").value)); };
const showTarif = () => document.getElementById("tarif").textContent =
  `${eur(T.nightly)} la nuit + taxe de séjour ${eur(T.taxPerPersonNight)} par personne et par nuit, soit ${eur(T.nightly+2*T.taxPerPersonNight)} par nuit pour 2 personnes.`;
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
  const msg = `Bonjour${name ? ", je suis " + name : ""}. Je souhaite réserver Bò Jadin La du ${fmt(a,{day:"numeric",month:"long",year:"numeric"})} au ${fmt(b,{day:"numeric",month:"long",year:"numeric"})} (${n} nuit${n>1?"s":""}) pour ${guests}. Estimation : ${quoteText(n, parseInt(guests), false)}. Est-ce possible ? Merci !`;
  location.href = t === "wa"
    ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`
    : `mailto:${CONTACT.email}?subject=${encodeURIComponent("Demande de réservation Bò Jadin La")}&body=${encodeURIComponent(msg)}`;
});
document.getElementById("mail").href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Réservation Bò Jadin La")}`;
document.getElementById("wa").href = `https://wa.me/${CONTACT.whatsapp}`;

const load = u => fetch(u, {cache:"no-cache"}).then(r => r.json()).catch(() => ({bookings:[]}));
Promise.all([load("data/bookings.json"), load("data/manual.json"), load("data/tarifs.json")]).then(([data, man, tar]) => {
  if (tar.nightly) T = {...T, ...tar};
  showTarif();
  [...(data.bookings || []), ...(man.bookings || [])].forEach(({start, end}) => {
    for (let d = parse(start); key(d) < end; d = addDays(d,1)) busy.add(key(d));
  });
  let d = parse(todayKey), n = 0;
  while (busy.has(key(d)) && n++ < 730) d = addDays(d,1);
  document.getElementById("next-free").textContent = key(d) === todayKey ? "✨ Disponible dès aujourd'hui" : `Prochaine nuit libre : ${fmt(key(d),{weekday:"long",day:"numeric",month:"long"})}`;
  if (data.updated) document.getElementById("updated").textContent = "Dernière modification du calendrier le " + new Date(data.updated).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"});
  render();
}).catch(() => { document.getElementById("next-free").textContent = "Calendrier indisponible, consultez Airbnb"; render(); });
