/* ====== À PERSONNALISER ====== */
const FORM = { endpoint: "https://api.web3forms.com/submit", key: "56a3f346-5639-4143-92d8-807b3aa492c2" };

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
const sendForm = async ({website, ...data}) => {
  if (website) return true;                         // champ piège rempli : robot, on ignore
  const res = await fetch(FORM.endpoint, {
    method: "POST",
    headers: {"Content-Type":"application/json", Accept:"application/json"},
    body: JSON.stringify({access_key: FORM.key, from_name: "Site Bò Jadin La", replyto: data.email, ...data})
  });
  const j = await res.json().catch(() => ({}));
  return res.ok && j.success !== false;
};
const cf = document.getElementById("contact-form"), cs = document.getElementById("contact-status");
cf.addEventListener("submit", async e => {
  e.preventDefault();
  const btn = cf.querySelector("button"), d = Object.fromEntries(new FormData(cf));
  btn.disabled = true; cs.textContent = "Envoi en cours…";
  const ok = await sendForm({...d, subject: `Question de ${d.name} (site Bò Jadin La)`}).catch(() => false);
  cs.textContent = ok ? "Merci, votre message est bien envoyé. Nous vous répondons rapidement par e-mail." : "L'envoi a échoué. Merci de réessayer dans un instant.";
  btn.disabled = false; if (ok) cf.reset();
});
const LOGO = {
  google: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
  airbnb: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#FF5A5F" fill-rule="evenodd" d="M12 2.2C11 2.2 10.2 2.9 9.6 4.2L3.4 17.4C2.3 19.8 3.8 22 6 22C7.8 22 9.8 20.6 12 18.2C14.2 20.6 16.2 22 18 22C20.2 22 21.7 19.8 20.6 17.4L14.4 4.2C13.8 2.9 13 2.2 12 2.2ZM12 18.2C10 15.9 8.4 13.6 8.4 11.8C8.4 9.5 10 7.9 12 7.9C14 7.9 15.6 9.5 15.6 11.8C15.6 13.6 14 15.9 12 18.2ZM12 16.3C10.6 14.7 9.8 13.2 9.8 12C9.8 10.8 10.7 9.8 12 9.8C13.3 9.8 14.2 10.8 14.2 12C14.2 13.2 13.4 14.7 12 16.3Z"/></svg>`
};
const logo = s => { const k = String(s || "").toLowerCase() === "google" ? "google" : "airbnb", n = k === "google" ? "Google" : "Airbnb"; return `<span class="src" role="img" aria-label="${n}" title="${n}">${LOGO[k]}</span>`; };
fetch("data/reviews.json", {cache:"no-cache"}).then(r => r.json()).then(r => {
  if (!r.rating && !(r.testimonials || []).length) return;
  document.getElementById("avis").hidden = false;
  const rate = (v, label) => `<span class="rate"><span><span class="gs">★</span> ${fr(v)}</span><small>${label}</small></span>`;
  const g = r.google || {};
  document.getElementById("rating-h").innerHTML =
      (r.rating ? rate(r.rating, `${r.count} commentaire${r.count>1?"s":""} sur ${logo("airbnb")}`) : "") +
      (g.rating && g.count ? rate(g.rating, `${g.count} avis sur ${logo("google")}`) : "");
  if (g.url) { const gl = document.getElementById("g-review"); gl.href = g.url; gl.hidden = false; }
  document.getElementById("tags").innerHTML = (r.tags || []).map(t => `<span>${esc(t)}</span>`).join("");
  const list = (r.testimonials || []).slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const monthFr = d => /^\d{4}-\d{2}/.test(d) ? new Date(+d.slice(0,4), +d.slice(5,7) - 1, 1).toLocaleDateString("fr-FR", {month:"long", year:"numeric"}) : d;
  const card = t => `<blockquote>${t.stars ? `<div class="gs stars">${"★".repeat(Math.min(5, +t.stars || 0))}</div>` : ""}“${esc(t.text)}”<cite>${esc(t.author)}${t.date ? " · " + esc(monthFr(t.date)) : ""} · ${logo(t.source)}</cite></blockquote>`;
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
let T = {nightly:56, periods:[], taxPerPersonNight:2, cleaning:0, minNights:1};
const priceOf = k => (T.periods || []).find(p => k >= p.from && k <= p.to)?.nightly ?? T.nightly;
const eur = v => v.toLocaleString("fr-FR",{maximumFractionDigits:2}) + " €";
const quoteText = (n, g, html = true) => {
  const s = k => k > 1 ? "s" : "";
  const prices = [];
  for (let d = parse(a); key(d) < b; d = addDays(d,1)) prices.push(priceOf(key(d)));
  const byPrice = new Map();
  prices.forEach(p => byPrice.set(p, (byPrice.get(p) || 0) + 1));
  const lines = [...byPrice].map(([p, k]) => `Logement : ${eur(p)} × ${k} nuit${s(k)} = ${eur(p*k)}`);
  lines.push(`Taxe de séjour : ${eur(T.taxPerPersonNight)} × ${g} personne${s(g)} × ${n} nuit${s(n)} = ${eur(n*g*T.taxPerPersonNight)}`);
  if (T.cleaning) lines.push(`Ménage : ${eur(T.cleaning)}`);
  lines.push("Frais de plateforme : 0 €");
  const total = `Total : ${eur(prices.reduce((x, p) => x + p, 0) + n*g*T.taxPerPersonNight + (T.cleaning || 0))}`;
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
const notes = new Map();           // commentaires par nuit (manual.json)
let view = new Date(); view.setDate(1);
let a = null, b = null;

const nightsFree = (from, to) => { for (let d = parse(from); key(d) < to; d = addDays(d,1)) if (busy.has(key(d))) return false; return true; };
const stayNotes = () => { const s = new Set(); for (let d = parse(a); key(d) < b; d = addDays(d,1)) if (notes.has(key(d))) s.add(notes.get(key(d))); return [...s]; };

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
    const note = k >= todayKey && notes.get(k); if (note) c.push("has-note");
    h += `<button class="${c.join(" ")}" data-k="${k}"${note ? ` title="${esc(note)}"` : ""}>${i}${c.includes("past")||c.includes("booked")?"":`<small>${priceOf(k)} €</small>`}</button>`;
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
      ${stayNotes().map(t => `<div class="stay-note">ℹ️ ${esc(t)}</div>`).join("")}
            <div class="fields"><input id="f-name" placeholder="Votre nom et prénom" autocomplete="given-name" required>
      <input id="f-email" type="email" placeholder="Votre e-mail" autocomplete="email" required>
      <select id="f-guests"><option>1 voyageur</option><option>2 voyageurs</option></select></div>
      <textarea id="f-msg" class="msg" rows="3" placeholder="Un message pour vos hôtes (facultatif)"></textarea>
      <input class="hp" id="f-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="quote" id="quote"></div>
      <div class="actions"><button class="btn" data-send="req">Envoyer ma demande</button></div>
      <p class="form-status" id="req-status" role="status"></p>
      <a class="airbnb-link" href="https://www.airbnb.fr/rooms/${ROOM}?check_in=${a}&check_out=${b}&adults=1" target="_blank" rel="noopener">ou réserver via Airbnb</a>`;
    updateQuote();
  } else if (a) {
    r.className = "result"; r.hidden = false;
    r.innerHTML = `<span>Arrivée le <b>${fmt(a)}</b>. Choisissez maintenant votre date de départ.${notes.has(a) ? `<br>ℹ️ ${esc(notes.get(a))}` : ""}</span>`;
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
document.getElementById("result").addEventListener("click", async e => {
  if (e.target.dataset.send !== "req") return;
  const f = id => document.getElementById(id);
  if (![f("f-name"), f("f-email")].every(i => i.reportValidity())) return;
  const btn = e.target, st = f("req-status"), guests = f("f-guests").value, n = nightsCount();
  btn.disabled = true; st.textContent = "Envoi en cours…";
  const message = `Demande de réservation du ${fmt(a,{day:"numeric",month:"long",year:"numeric"})} au ${fmt(b,{day:"numeric",month:"long",year:"numeric"})} (${n} nuit${n>1?"s":""}) pour ${guests}.\n\n${f("f-msg").value.trim()}\n\nEstimation :\n${quoteText(n, parseInt(guests), false)}`;
  const ok = await sendForm({name: f("f-name").value.trim(), email: f("f-email").value.trim(), message, website: f("f-hp").value, subject: "Demande de réservation Bò Jadin La"}).catch(() => false);
  if (ok) { st.textContent = "Demande envoyée ! Vos hôtes vous répondent rapidement par e-mail."; btn.hidden = true; }
  else { st.textContent = "L'envoi a échoué. Merci de réessayer."; btn.disabled = false; }
});

const load = u => fetch(u, {cache:"no-cache"}).then(r => r.json()).catch(() => ({bookings:[]}));
Promise.all([load("data/bookings.json"), load("data/manual.json"), load("data/tarifs.json")]).then(([data, man, tar]) => {
  if (tar.nightly) T = {...T, ...tar};

  const block = list => list.forEach(({start, end, note}) => {
    for (let d = parse(start); key(d) < end; d = addDays(d,1)) { busy.add(key(d)); if (note) notes.set(key(d), note); }
  });
  block(data.bookings || []);                       // Airbnb
  (man.open || []).forEach(({from, to, note}) => {  // rouvert sur le site uniquement
    for (let d = parse(from); key(d) <= to; d = addDays(d,1)) { busy.delete(key(d)); if (note) notes.set(key(d), note); }
  });
  block(man.bookings || []);                        // blocages manuels (prioritaires)
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