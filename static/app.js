/* ═══════════════════════════════════════════════════
   MONEY MAGNET AI — Frontend App Logic
   Connects to Flask backend on http://localhost:5000
   ═══════════════════════════════════════════════════ */

const API = "http://localhost:5000/api";

// Use localStorage as fallback when backend is not running
const USE_LOCAL = true; // set false when backend is running

/* ─── State ──────────────────────────────────────────── */
let allExpenses = [];
let selectedCategory = "";
let selectedMood = "";
let selectedPredictMood = "";

const CATEGORY_ICONS = {
  Food: "🍜", Shopping: "🛍️", Transport: "🚌",
  Entertainment: "🎮", Health: "💊", Education: "📚",
  Bills: "🧾", Other: "📦",
};

/* ─── Init ───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dashboard-date").textContent =
    new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("f-date").value = today;

  loadAll();
});

/* ─── Tab Switching ──────────────────────────────────── */
function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`tab-${name}`).classList.add("active");
  document.getElementById(`nav-${name}`).classList.add("active");

  if (name === "insights") loadInsights();
  if (name === "history") renderHistory(allExpenses);
}

/* ─── Load All Data ──────────────────────────────────── */
async function loadAll() {
  try {
    const [expRes, statsRes] = await Promise.all([
      fetchData("/expenses"),
      fetchData("/stats"),
    ]);
    allExpenses = expRes || [];
    renderStats(statsRes || {});
    renderRecentExpenses(allExpenses.slice(-5).reverse());
    renderCategoryChart(statsRes?.by_category || {});
    renderMoodChart(statsRes?.by_mood || {});
  } catch (e) {
    console.warn("Backend not available, using local storage");
    allExpenses = getLocalExpenses();
    const stats = computeLocalStats(allExpenses);
    renderStats(stats);
    renderRecentExpenses(allExpenses.slice(-5).reverse());
    renderCategoryChart(stats.by_category);
    renderMoodChart(stats.by_mood);
  }
}

/* ─── Fetch Helper ───────────────────────────────────── */
async function fetchData(path, options = {}) {
  const res = await fetch(API + path, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ─── Local Storage Fallback ─────────────────────────── */
function getLocalExpenses() {
  try { return JSON.parse(localStorage.getItem("mm_expenses") || "[]"); }
  catch { return []; }
}

function saveLocalExpenses(expenses) {
  localStorage.setItem("mm_expenses", JSON.stringify(expenses));
}

function computeLocalStats(expenses) {
  if (!expenses.length) return { total: 0, count: 0, by_category: {}, by_mood: {}, avg_per_expense: 0, top_category: "—", top_mood: "—" };
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const by_category = {}, by_mood = {};
  expenses.forEach(e => {
    by_category[e.category] = (by_category[e.category] || 0) + e.amount;
    by_mood[e.mood] = (by_mood[e.mood] || 0) + e.amount;
  });
  const top_category = Object.keys(by_category).sort((a, b) => by_category[b] - by_category[a])[0] || "—";
  const top_mood = Object.keys(by_mood).sort((a, b) => by_mood[b] - by_mood[a])[0] || "—";
  return { total: +total.toFixed(2), count: expenses.length, by_category, by_mood, avg_per_expense: +(total / expenses.length).toFixed(2), top_category, top_mood };
}

/* ─── Render Stats ───────────────────────────────────── */
function renderStats(s) {
  document.getElementById("stat-total").textContent = `₹${fmt(s.total || 0)}`;
  document.getElementById("stat-count").textContent = `${s.count || 0} expense${s.count === 1 ? "" : "s"}`;
  document.getElementById("stat-avg").textContent = `₹${fmt(s.avg_per_expense || 0)}`;
  document.getElementById("stat-category").textContent = s.top_category || "—";
  document.getElementById("stat-mood").textContent = s.top_mood || "—";
}

function fmt(n) {
  return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/* ─── Render Charts ──────────────────────────────────── */
function renderCategoryChart(data) {
  const el = document.getElementById("category-chart");
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  if (!entries.length) { el.innerHTML = '<p class="empty-msg">No data yet</p>'; return; }
  const max = Math.max(...entries.map(e => e[1]));
  el.innerHTML = entries.map(([cat, amt]) => `
    <div class="bar-row">
      <span class="bar-label">${CATEGORY_ICONS[cat] || "📦"} ${cat}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(amt / max * 100).toFixed(1)}%"></div></div>
      <span class="bar-amount">₹${fmt(amt)}</span>
    </div>`).join("");
}

function renderMoodChart(data) {
  const el = document.getElementById("mood-chart");
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  if (!entries.length) { el.innerHTML = '<p class="empty-msg">No data yet</p>'; return; }
  const max = Math.max(...entries.map(e => e[1]));
  el.innerHTML = entries.map(([mood, amt]) => `
    <div class="bar-row">
      <span class="bar-label">${moodEmoji(mood)} ${mood}</span>
      <div class="bar-track"><div class="bar-fill mood" style="width:${(amt / max * 100).toFixed(1)}%"></div></div>
      <span class="bar-amount">₹${fmt(amt)}</span>
    </div>`).join("");
}

/* ─── Render Recent Expenses ─────────────────────────── */
function renderRecentExpenses(expenses) {
  const el = document.getElementById("recent-expenses");
  if (!expenses.length) { el.innerHTML = '<p class="empty-msg">No expenses logged yet. Start by adding one!</p>'; return; }
  el.innerHTML = expenses.map(e => expenseRow(e)).join("");
}

function renderHistory(expenses) {
  const el = document.getElementById("history-list");
  if (!expenses.length) { el.innerHTML = '<p class="empty-msg">No expenses found.</p>'; return; }
  const sorted = [...expenses].reverse();
  el.innerHTML = sorted.map(e => expenseRow(e, true)).join("");
}

function expenseRow(e, showDelete = false) {
  return `
  <div class="expense-item" id="expense-${e.id}">
    <div class="expense-icon">${CATEGORY_ICONS[e.category] || "📦"}</div>
    <div class="expense-info">
      <div class="expense-name">${e.category}${e.reason ? " — " + e.reason : ""}</div>
      <div class="expense-meta">${e.date} · ${e.day_of_week || ""}</div>
    </div>
    <div class="expense-right">
      <div class="expense-amount">₹${fmt(e.amount)}</div>
      <div class="mood-chip">${moodEmoji(e.mood)} ${e.mood}</div>
    </div>
    ${showDelete ? `<button class="delete-btn" onclick="deleteExpense(${e.id})">✕</button>` : ""}
  </div>`;
}

/* ─── Add Expense ────────────────────────────────────── */
function selectCategory(btn) {
  document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedCategory = btn.dataset.val;
}

function selectMood(btn) {
  document.querySelectorAll("#mood-picker .mood-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedMood = btn.dataset.val;
}

async function submitExpense() {
  const amount = parseFloat(document.getElementById("f-amount").value);
  const reason = document.getElementById("f-reason").value.trim();
  const date = document.getElementById("f-date").value;
  const msg = document.getElementById("form-msg");

  if (!amount || amount <= 0) { showMsg(msg, "Enter a valid amount", "error"); return; }
  if (!selectedCategory) { showMsg(msg, "Select a category", "error"); return; }
  if (!selectedMood) { showMsg(msg, "Select your current mood", "error"); return; }

  document.getElementById("submit-text").textContent = "Saving...";

  const payload = { amount, category: selectedCategory, mood: selectedMood, reason, date };

  try {
    await fetchData("/expenses", { method: "POST", body: JSON.stringify(payload) });
    showMsg(msg, "✓ Expense logged!", "success");
  } catch {
    // Fallback to local
    const expenses = getLocalExpenses();
    const entry = {
      id: Date.now(),
      ...payload,
      time: new Date().toTimeString().slice(0, 5),
      day_of_week: new Date().toLocaleDateString("en-IN", { weekday: "long" }),
      is_weekend: [0, 6].includes(new Date().getDay()),
    };
    expenses.push(entry);
    saveLocalExpenses(expenses);
    showMsg(msg, "✓ Saved locally (backend offline)", "success");
  }

  document.getElementById("submit-text").textContent = "+ Log Expense";
  document.getElementById("f-amount").value = "";
  document.getElementById("f-reason").value = "";
  document.querySelectorAll(".cat-btn, #mood-picker .mood-btn").forEach(b => b.classList.remove("selected"));
  selectedCategory = ""; selectedMood = "";

  showToast("Expense added! 🎉", "success");
  await loadAll();
}

/* ─── Delete Expense ─────────────────────────────────── */
async function deleteExpense(id) {
  try {
    await fetchData(`/expenses/${id}`, { method: "DELETE" });
  } catch {
    const expenses = getLocalExpenses().filter(e => e.id !== id);
    saveLocalExpenses(expenses);
  }
  document.getElementById(`expense-${id}`)?.remove();
  showToast("Expense deleted", "");
  await loadAll();
}

/* ─── Filter History ─────────────────────────────────── */
function filterHistory() {
  const q = document.getElementById("search-input").value.toLowerCase();
  const filtered = allExpenses.filter(e =>
    e.category.toLowerCase().includes(q) ||
    (e.reason || "").toLowerCase().includes(q) ||
    e.mood.toLowerCase().includes(q) ||
    String(e.amount).includes(q)
  );
  renderHistory(filtered);
}

/* ─── Insights ───────────────────────────────────────── */
async function loadInsights() {
  await loadPersonality();
  await loadPatternInsights();
}

async function loadPersonality() {
  const el = document.getElementById("personality-card");
  try {
    const data = await fetchData("/personality");
    if (data.personality === "Unknown") {
      el.innerHTML = `<div class="personality-loading">Add at least 3 expenses to discover your money personality 🧬</div>`;
      return;
    }
    el.innerHTML = `
      <div class="personality-emoji">${data.emoji}</div>
      <div>
        <div class="personality-type">${data.personality}</div>
        <div class="personality-desc">${data.description}</div>
        <div class="personality-tip">💡 ${data.tip}</div>
      </div>`;
  } catch {
    // Local personality fallback
    const expenses = getLocalExpenses();
    if (expenses.length < 3) {
      el.innerHTML = `<div class="personality-loading">Add at least 3 expenses to discover your money personality 🧬</div>`;
      return;
    }
    el.innerHTML = `<div class="personality-emoji">🧠</div><div><div class="personality-type">Analysis Pending</div><div class="personality-desc">Connect backend for full ML personality analysis.</div></div>`;
  }
}

async function loadPatternInsights() {
  const el = document.getElementById("pattern-insights");
  try {
    const data = await fetchData("/insights");
    el.innerHTML = data.insights.map(i => `<div class="insight-item">${i}</div>`).join("") || '<p class="empty-msg">No patterns yet</p>';
  } catch {
    // Compute basic insights locally
    const expenses = getLocalExpenses();
    const insights = computeLocalInsights(expenses);
    el.innerHTML = insights.map(i => `<div class="insight-item">${i}</div>`).join("") || '<p class="empty-msg">Add more expenses to see patterns!</p>';
  }
}

function computeLocalInsights(expenses) {
  const insights = [];
  if (expenses.length < 2) return ["Add more expenses to reveal spending patterns!"];
  const byMood = {};
  expenses.forEach(e => { byMood[e.mood] = byMood[e.mood] || []; byMood[e.mood].push(e.amount); });
  for (const [mood, amts] of Object.entries(byMood)) {
    const avg = amts.reduce((a, b) => a + b, 0) / amts.length;
    if (avg > 500 && ["stressed", "sad", "anxious"].includes(mood))
      insights.push(`⚠️ You spend ₹${avg.toFixed(0)} on average when ${mood}.`);
  }
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const topCat = {};
  expenses.forEach(e => topCat[e.category] = (topCat[e.category] || 0) + e.amount);
  const top = Object.entries(topCat).sort((a, b) => b[1] - a[1])[0];
  if (top) insights.push(`📌 ${top[0]} is your top category (₹${fmt(top[1])}, ${(top[1] / total * 100).toFixed(0)}% of total).`);
  if (expenses.length >= 5) insights.push(`📊 You have ${expenses.length} expenses totaling ₹${fmt(total)}.`);
  return insights;
}

/* ─── Ask Claude ─────────────────────────────────────── */
async function askClaude() {
  const q = document.getElementById("ai-question").value.trim();
  const box = document.getElementById("ai-response");
  if (!q) return;

  const expenses = allExpenses.length ? allExpenses : getLocalExpenses();
  if (!expenses.length) { box.textContent = "Add some expenses first, then ask me about your patterns!"; box.className = "ai-response-box visible"; return; }

  box.className = "ai-response-box visible ai-typing";
  box.textContent = "Analyzing your spending data";

  const stats = computeLocalStats(expenses);
  const summary = `
User has ${expenses.length} expenses totaling ₹${stats.total}.
Top category: ${stats.top_category}. Highest spending mood: ${stats.top_mood}.
Category breakdown: ${JSON.stringify(stats.by_category)}.
Mood breakdown: ${JSON.stringify(stats.by_mood)}.
Recent expenses (last 5): ${JSON.stringify(expenses.slice(-5).map(e => ({ amount: e.amount, category: e.category, mood: e.mood, reason: e.reason })))}`;

  try {
   const response = await fetch("/api/ask-ai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    question: q,
    summary: summary
  }),
});

const data = await response.json();
const text = data.response || "Could not get a response.";



    box.classList.remove("ai-typing");
    box.textContent = text;
  } catch (e) {
    box.classList.remove("ai-typing");
    box.textContent = "⚠️ Could not connect to Claude AI. Make sure you're running this from the Claude.ai platform or add your API key to the backend.";
  }
}

/* ─── Predict ────────────────────────────────────────── */
function selectPredictMood(btn) {
  document.querySelectorAll("#predict-mood-picker .mood-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedPredictMood = btn.dataset.val;
}

async function runPrediction() {
  if (!selectedPredictMood) { showToast("Select a mood first!", "error"); return; }
  const el = document.getElementById("prediction-result");

  el.className = "prediction-result";
  el.style.display = "block";
  el.innerHTML = "Running ML models...";

  try {
    const data = await fetchData("/predict", { method: "POST", body: JSON.stringify({ mood: selectedPredictMood }) });
    renderPrediction(el, data);
  } catch {
    // Local rule-based fallback
    const result = localPredict(selectedPredictMood, getLocalExpenses());
    renderPrediction(el, result);
  }
}

function renderPrediction(el, data) {
  const riskClass = `risk-${data.risk || "low"}`;
  el.className = `prediction-result visible ${riskClass}`;
  const score = Math.round((data.risk_score || 0) * 100);
  el.innerHTML = `
    <div class="risk-label">${riskLabel(data.risk)} Risk</div>
    <div class="risk-score">Score: ${score}/100 · Confidence: ${data.confidence || 70}%</div>
    <div class="risk-message">${data.message}</div>
    <div class="risk-bar-track"><div class="risk-bar-fill" style="width:${score}%"></div></div>`;
}

function localPredict(mood, expenses) {
  const highRisk = ["stressed", "sad", "anxious", "bored"];
  const medRisk = ["tired", "excited"];
  let score = highRisk.includes(mood) ? 0.7 : medRisk.includes(mood) ? 0.45 : 0.2;
  const today = new Date().getDay();
  if (today === 0 || today === 6) score = Math.min(score + 0.15, 1);
  const risk = score > 0.6 ? "high" : score > 0.4 ? "medium" : "low";
  const msgs = {
    high: `🚨 High risk! Feeling ${mood} increases your urge to spend impulsively. Avoid browsing shopping apps today.`,
    medium: `⚠️ Moderate risk. You're somewhat vulnerable to unplanned spending when feeling ${mood}.`,
    low: `✅ Low risk today. Great time to make mindful, planned purchases.`,
  };
  return { risk, risk_score: score, message: msgs[risk], confidence: 72 };
}

function riskLabel(risk) {
  return { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" }[risk] || "Unknown";
}

/* ─── Utilities ──────────────────────────────────────── */
function moodEmoji(mood) {
  const map = { happy: "😊", neutral: "😐", bored: "😑", stressed: "😤", sad: "😢", anxious: "😰", tired: "😴", excited: "🤩" };
  return map[mood] || "😐";
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `form-msg ${type}`;
  setTimeout(() => { el.textContent = ""; el.className = "form-msg"; }, 3000);
}

function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = "toast"; }, 3000);
}
