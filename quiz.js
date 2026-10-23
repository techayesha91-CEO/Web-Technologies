// quiz.js - Assignment 2: interactive quiz (vanilla JS)
const BANK = [
  { q: "Which HTML tag is used for the largest heading?", o: ["<h1>", "<h6>", "<head>", "<heading>"], a: 0, e: "<h1> is the top-level heading." },
  { q: "Which CSS property changes the text colour?", o: ["font-color", "color", "text-style", "foreground"], a: 1, e: "The color property sets text colour." },
  { q: "In the CSS box model, which layer is outside the border?", o: ["Padding", "Content", "Margin", "Outline-box"], a: 2, e: "Order: content, padding, border, margin." },
  { q: "Which position value places an element relative to its nearest positioned parent?", o: ["static", "relative", "absolute", "sticky"], a: 2, e: "absolute uses the containing (positioned) block." },
  { q: "Which CSS feature is used to make a page responsive to screen width?", o: ["@keyframes", "@font-face", "@media", "@import"], a: 2, e: "@media queries apply styles by screen size." },
  { q: "Which Bootstrap class creates a primary coloured button?", o: ["btn-main", "button-primary", "btn btn-primary", "bs-primary"], a: 2, e: "Use btn together with btn-primary." },
  { q: "Which JavaScript method selects an element by its id?", o: ["getElementById()", "querySelectorAll()", "getElementsByTag()", "findId()"], a: 0, e: "document.getElementById('id') returns one element." },
  { q: "Which HTML5 attribute makes a form field mandatory?", o: ["validate", "mandatory", "required", "must"], a: 2, e: "required blocks submit if the field is empty." },
  { q: "What does DNS do?", o: ["Encrypts web pages", "Converts domain names to IP addresses", "Styles web pages", "Stores cookies"], a: 1, e: "DNS maps names like example.com to IP addresses." },
  { q: "Which CSS property is used to create smooth change on hover?", o: ["transition", "position", "display", "overflow"], a: 0, e: "transition animates property changes." },
  { q: "Which HTTP status code means 'Not Found'?", o: ["200", "301", "500", "404"], a: 3, e: "404 means the resource was not found." },
  { q: "Which tag is a semantic HTML5 element?", o: ["<div>", "<span>", "<article>", "<b>"], a: 2, e: "<article> describes its meaning; div/span do not." }
];
const TIME = 20, LETTERS = ["A", "B", "C", "D"];
const $ = id => document.getElementById(id);
let list = [], idx = 0, res = [], picks = [], left = TIME, tick = null, locked = false, student = "", when = "";

const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const show = id => ["startScreen", "quizScreen", "resultScreen"].forEach(s => $(s).hidden = s !== id);

/* ---- dark / light mode ---- */
function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  $("themeBtn").textContent = t === "dark" ? "\u2600 Light" : "\u263E Dark";
  try { localStorage.setItem("quiz-theme", t); } catch (e) {}
}
let saved = null; try { saved = localStorage.getItem("quiz-theme"); } catch (e) {}
setTheme(saved || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
$("themeBtn").onclick = () => setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");

/* ---- segmented progress bar ---- */
function drawBar(el) {
  el.innerHTML = "";
  list.forEach((_, i) => {
    const s = document.createElement("div");
    s.className = "seg " + (res[i] || (i === idx && el.id === "segBar" ? "now" : ""));
    el.appendChild(s);
  });
}

/* ---- start / question flow ---- */
function start() {
  student = $("nameInput").value.trim() || "Student";
  const n = parseInt($("countSelect").value, 10);
  list = shuffle(BANK).slice(0, n).map(q => {
    const opts = shuffle(q.o.map((t, i) => ({ t, ok: i === q.a })));
    return { q: q.q, e: q.e, opts };
  });
  idx = 0; res = new Array(n).fill(null); picks = new Array(n).fill(null);
  when = new Date().toLocaleString();
  show("quizScreen"); load();
}

function load() {
  locked = false; left = TIME;
  const cur = list[idx];
  $("qCount").textContent = "Question " + (idx + 1) + " of " + list.length;
  $("qText").textContent = cur.q;
  $("feedback").textContent = ""; $("feedback").style.color = "";
  $("nextBtn").disabled = true;
  $("nextBtn").textContent = idx === list.length - 1 ? "Finish" : "Next";
  const box = $("options"); box.innerHTML = "";
  cur.opts.forEach((o, i) => {
    const col = document.createElement("div"); col.className = "col-12 col-md-6";
    const b = document.createElement("button");
    b.type = "button"; b.className = "opt";
    b.innerHTML = "<b>" + LETTERS[i] + "</b><span></span>";
    b.lastChild.textContent = o.t;
    b.onclick = () => answer(i);
    col.appendChild(b); box.appendChild(col);
  });
  drawBar($("segBar"));
  paintTimer();
  clearInterval(tick);
  tick = setInterval(() => { left--; paintTimer(); if (left <= 0) timeout(); }, 1000);
}

function paintTimer() {
  $("timerBadge").textContent = left + "s";
  $("timerBadge").classList.toggle("low", left <= 5);
  const f = $("timeFill");
  f.style.width = (left / TIME * 100) + "%";
  f.style.background = left > 10 ? "var(--ok)" : left > 5 ? "var(--late)" : "var(--bad)";
}

function reveal(chosen) {
  const btns = document.querySelectorAll(".opt");
  list[idx].opts.forEach((o, i) => {
    btns[i].disabled = true;
    if (o.ok) btns[i].classList.add("right");
    else if (i === chosen) btns[i].classList.add("wrong");
  });
  clearInterval(tick); locked = true;
  $("nextBtn").disabled = false;
  drawBar($("segBar"));
}

function answer(i) {
  if (locked) return;
  picks[idx] = i;
  const ok = list[idx].opts[i].ok;
  res[idx] = ok ? "ok" : "bad";
  $("feedback").textContent = (ok ? "Correct! " : "Wrong. ") + list[idx].e;
  $("feedback").style.color = ok ? "var(--ok)" : "var(--bad)";
  reveal(i);
}

function timeout() {
  if (locked) return;
  res[idx] = "late";
  $("feedback").textContent = "Time is up! " + list[idx].e;
  $("feedback").style.color = "var(--late)";
  reveal(-1);
}

function next() {
  if (!locked) return;
  if (idx < list.length - 1) { idx++; load(); } else finish();
}

/* ---- result screen ---- */
const count = k => res.filter(r => r === k).length;
const okText = q => q.opts.find(o => o.ok).t;

function finish() {
  clearInterval(tick); show("resultScreen");
  const n = list.length, c = count("ok"), pct = Math.round(c / n * 100);
  $("scoreText").textContent = c + "/" + n;
  $("scoreRing").style.setProperty("--pct", pct + "%");
  $("resultMsg").textContent = pct === 100 ? "Perfect score!" : pct >= 80 ? "Excellent work!" : pct >= 60 ? "Good job, keep practising." : pct >= 40 ? "Not bad, revise the lectures." : "Needs more practice.";
  $("resultStats").textContent = pct + "%  |  Correct: " + c + "  |  Wrong: " + count("bad") + "  |  Time out: " + count("late");
  drawBar($("segBarFinal"));
  const rv = $("review"); rv.innerHTML = "";
  list.forEach((q, i) => {
    const d = document.createElement("div"); d.className = "rev " + res[i];
    const yours = picks[i] === null ? "No answer (time out)" : q.opts[picks[i]].t;
    const t = document.createElement("strong"); t.textContent = (i + 1) + ". " + q.q;
    const s = document.createElement("small");
    s.textContent = "Your answer: " + yours + (res[i] === "ok" ? "" : "  |  Correct: " + okText(q));
    d.append(t, s); rv.appendChild(d);
  });
}

/* ---- PDF download (jsPDF) ---- */
function makePDF() {
  if (!window.jspdf) { alert("PDF library could not load. Check your internet connection."); return; }
  const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
  const n = list.length, c = count("ok"), pct = Math.round(c / n * 100);
  let y = 20;
  const need = h => { if (y + h > 280) { doc.addPage(); y = 20; } };
  doc.setFillColor(15, 118, 110); doc.rect(0, 0, 210, 34, "F");
  doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  doc.text("Web Technologies Quiz - Result", 14, 15);
  doc.setFontSize(11); doc.setFont("helvetica", "normal");
  doc.text("CSC336 | COMSATS University Islamabad, Vehari Campus", 14, 24);
  y = 46; doc.setTextColor(31, 41, 55); doc.setFontSize(12);
  doc.text("Name: " + student + "      Date: " + when, 14, y); y += 9;
  doc.setFont("helvetica", "bold"); doc.setFontSize(15);
  doc.text("Score: " + c + " / " + n + "  (" + pct + "%)", 14, y); y += 7;
  doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  doc.text("Correct: " + c + "   Wrong: " + count("bad") + "   Time out: " + count("late"), 14, y); y += 8;
  const col = { ok: [22, 163, 74], bad: [220, 38, 38], late: [245, 158, 11] }, w = (182 - (n - 1) * 2) / n;
  res.forEach((r, i) => { doc.setFillColor(...col[r]); doc.roundedRect(14 + i * (w + 2), y, w, 5, 2, 2, "F"); });
  y += 14;
  list.forEach((q, i) => {
    const lines = doc.splitTextToSize((i + 1) + ". " + q.q, 176);
    need(lines.length * 6 + 20);
    doc.setTextColor(31, 41, 55); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text(lines, 14, y); y += lines.length * 5.5;
    doc.setFont("helvetica", "normal");
    const yours = picks[i] === null ? "No answer (time out)" : q.opts[picks[i]].t;
    doc.setTextColor(...col[res[i]]);
    doc.text(doc.splitTextToSize("Your answer: " + yours, 170), 18, y); y += 5.5;
    if (res[i] !== "ok") { doc.setTextColor(22, 163, 74); doc.text(doc.splitTextToSize("Correct answer: " + okText(q), 170), 18, y); y += 5.5; }
    y += 4;
  });
  doc.save("Quiz_Result_" + student.replace(/\s+/g, "_") + ".pdf");
}

$("startBtn").onclick = start;
$("nextBtn").onclick = next;
$("againBtn").onclick = () => show("startScreen");
$("pdfBtn").onclick = makePDF;
document.addEventListener("keydown", e => {
  if ($("quizScreen").hidden) return;
  if (e.key >= "1" && e.key <= "4") { const i = +e.key - 1; if (i < list[idx].opts.length) answer(i); }
  else if (e.key === "Enter") next();
});
