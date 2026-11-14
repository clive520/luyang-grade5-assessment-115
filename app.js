'use strict';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = { subject: 'chinese', average: 'reportedAverage', group: 'all', dimensionSort: 'original', questionSort: 'original', question: 1, distribution: 'all' };
const subjectEnglish = { chinese: 'CHINESE', english: 'ENGLISH', math: 'MATH' };
const symbols = { chinese: '文', english: 'Aa', math: 'π' };
let dataset;
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rateText = (value) => value == null ? '—' : `${value}%`;
const subject = () => dataset.subjects.find(s => s.id === state.subject);
const subjectStyle = (s) => `--subject:${s.color}`;

function renderCards() {
  $('#subject-cards').innerHTML = dataset.subjects.map(s => `<a href="#class-analysis" class="subject-card" data-subject="${s.id}" style="${subjectStyle(s)}" aria-label="${s.label}，原報表班平均 ${s.reportedAverage}%，查看班級分析">
    <div class="subject-card-top"><div class="subject-card-title"><span class="subject-symbol" aria-hidden="true">${symbols[s.id]}</span>${s.label}</div><span class="card-arrow" aria-hidden="true">↗</span></div>
    <div class="score-line"><strong class="big-number">${s.reportedAverage}</strong><span class="percent">%</span></div><p class="metric-label"><span class="metric-prefix">整體答對率 · </span>報表班平均</p>
    <div class="card-levels" aria-hidden="true">${s.levels.map((l, i) => `<span class="${['mastery', 'basic', 'support'][i]}" style="width:${l.share}%"></span>`).join('')}</div>
    <div class="card-bottom"><span class="card-counts"><span>精熟 <strong>${s.levels[0].count} 人</strong></span><span>待加強 ${s.levels[2].count} 人</span></span><span>23 人</span></div></a>`).join('');
  $$('#subject-cards [data-subject]').forEach(card => card.addEventListener('click', () => setSubject(card.dataset.subject)));
}

function renderAverage() {
  const isReport = state.average === 'reportedAverage';
  $('#average-chart').innerHTML = dataset.subjects.map(s => {
    const value = isReport ? s.reportedAverage : s.recordMean.toFixed(1);
    return `<div class="average-row" style="${subjectStyle(s)}"><span>${s.label}</span><div class="average-track"><div class="average-bar" style="--value:${value}" role="img" aria-label="${s.label}，${isReport ? '原報表班平均' : '23 筆紀錄平均'} ${value}%"><strong>${value}%</strong></div></div></div>`;
  }).join('');
  $$('#average-mode button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === state.average)));
  $('#average-note').textContent = isReport ? '直接採用原始「班平均」檔，與 23 筆紀錄重算平均不同。三科題型與難度不同，答對率不代表跨科能力高低。' : '依三科各 23 筆整體答對率重算，含原報表所列特殊生。因來源百分比已取整數，結果為近似值。';
}

function renderLevels() {
  $('#level-chart').innerHTML = dataset.subjects.map(s => `<div class="level-row"><span class="level-name">${s.label}</span><div class="level-stack" role="img" aria-label="${s.label}：${s.levels.map(l => `${l.label} ${l.count} 人，占 ${l.share}%`).join('；')}">${s.levels.map((l, i) => `<div class="level-segment ${['mastery', 'basic', 'support'][i]}" style="flex:${l.count}" title="${l.label} ${l.count} 人，${l.share}%"><strong>${l.count} 人</strong><small>${l.share}%</small></div>`).join('')}</div></div>`).join('');
}

function renderTabs() {
  $('#subject-tabs').innerHTML = dataset.subjects.map(s => `<button class="subject-tab" type="button" data-subject="${s.id}" style="${subjectStyle(s)}" aria-pressed="${s.id === state.subject}"><i aria-hidden="true"></i>${s.label}<span class="tab-en">${subjectEnglish[s.id]}</span></button>`).join('');
  $$('#subject-tabs button').forEach(button => button.addEventListener('click', () => setSubject(button.dataset.subject)));
}

function setSubject(id) {
  state.subject = id;
  state.group = 'all';
  state.question = 1;
  $$('#subject-tabs button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.subject === id)));
  renderGroupFilter();
  renderDimensions();
  renderObservation();
  renderQuestions();
}

function renderGroupFilter() {
  const groups = [...new Set(subject().dimensions.map(d => d.group))];
  $('#dimension-group').innerHTML = `<option value="all">全部向度</option>${groups.map(g => `<option value="${escapeHTML(g)}">${escapeHTML(g)}</option>`).join('')}`;
}

function renderDimensions() {
  const s = subject();
  $('#dimension-subject').textContent = s.label;
  let dimensions = s.dimensions.filter(d => state.group === 'all' || d.group === state.group);
  if (state.dimensionSort !== 'original') dimensions = [...dimensions].sort((a, b) => state.dimensionSort === 'ascending' ? a.rate - b.rate : b.rate - a.rate);
  $('#dimension-chart').innerHTML = dimensions.map(d => `<div class="dimension-row" style="${subjectStyle(s)}"><span class="dimension-label">${escapeHTML(d.label)}<small>${escapeHTML(d.group)}</small></span><div class="dimension-track"><div class="dimension-bar" style="--value:${d.rate}" role="img" aria-label="${escapeHTML(d.group)}，${escapeHTML(d.label)}，報表班平均 ${d.rate}%"></div></div><span class="dimension-value">${d.rate}%</span></div>`).join('');
}

function renderObservation() {
  const s = subject();
  const sorted = [...s.dimensions].sort((a, b) => a.rate - b.rate);
  const low = sorted[0];
  const high = sorted.at(-1);
  $('#learning-title').textContent = `${s.label}的學習線索`;
  $('#learning-content').innerHTML = `<div class="observation"><span class="observation-label">相對強項</span><strong>${escapeHTML(high.label)}<span>${high.rate}%</span></strong><p>${escapeHTML(high.group)}向度中，本次表現較突出的一項。</p></div><div class="observation"><span class="observation-label">優先關注</span><strong>${escapeHTML(low.label)}<span>${low.rate}%</span></strong><p>可搭配原試卷觀察錯誤原因，安排練習與複習。</p></div>`;
}

function renderDistribution() {
  const shown = dataset.subjects.filter(s => state.distribution === 'all' || s.id === state.distribution);
  const max = Math.max(...shown.flatMap(s => s.distribution.map(b => b.count)));
  const top = Math.max(4, Math.ceil((max + 1) / 4) * 4);
  $('#distribution-legend').innerHTML = shown.map(s => `<span><i style="background:${s.color}"></i>${s.label}</span>`).join('');
  $('#distribution-chart').innerHTML = `<div class="y-axis" aria-hidden="true">${[top, top * .75, top * .5, top * .25, 0].map(n => `<span>${n}</span>`).join('')}</div><div class="histogram" role="img" aria-label="答對率區間人數分布，可在下方數據表查看完整數值。">${dataset.subjects[0].distribution.map((bin, i) => `<div class="bin-group">${shown.map(s => `<div class="hist-bar" style="${subjectStyle(s)};--height:${s.distribution[i].count / top * 100}" title="${s.label} ${bin.label}：${s.distribution[i].count} 人"><span>${s.distribution[i].count}</span></div>`).join('')}<span class="bin-label">${bin.label}</span></div>`).join('')}</div>`;
  $('#distribution-table').innerHTML = `<table><caption class="sr-only">各科答對率區間人數</caption><thead><tr><th scope="col">答對率區間</th>${shown.map(s => `<th scope="col">${s.label}</th>`).join('')}</tr></thead><tbody>${dataset.subjects[0].distribution.map((bin, i) => `<tr><th scope="row">${bin.label}</th>${shown.map(s => `<td>${s.distribution[i].count} 人</td>`).join('')}</tr>`).join('')}<tr><th scope="row">合計</th>${shown.map(s => `<td>${s.count} 人</td>`).join('')}</tr></tbody></table>`;
}

function mixColor(hex, whiteShare) {
  const channels = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16));
  return `rgb(${channels.map(c => Math.round(c + (255 - c) * whiteShare)).join(',')})`;
}

function renderQuestions() {
  const s = subject();
  $('#question-subject').textContent = s.label;
  const missing = s.items.reduce((sum, item) => sum + item.missing, 0);
  $('#question-summary').textContent = `${s.items.length} 題 · ${s.count} 筆作答紀錄${missing ? ` · 合計 ${missing} 筆題目反應空白` : ' · 無空白反應'}`;
  let items = [...s.items];
  if (state.questionSort === 'ascending') items.sort((a, b) => (a.rate ?? Infinity) - (b.rate ?? Infinity) || a.number - b.number);
  $('#question-grid').style.setProperty('--subject', s.color);
  $('.heat-legend').style.setProperty('--subject', s.color);
  $('#question-grid').innerHTML = items.map(item => {
    const ratio = (item.rate ?? 0) / 100;
    return `<button type="button" class="question-cell" data-question="${item.number}" aria-pressed="${item.number === state.question}" style="--subject:${s.color};--cell:${mixColor(s.color, 1 - ratio * .85)};--cell-ink:${ratio > .65 ? '#ffffff' : '#2e4b3d'}" aria-label="第 ${item.number} 題，答對率 ${rateText(item.rate)}，${item.correct} 人答對，有效紀錄 ${item.valid} 人，空白 ${item.missing} 筆"><span>第 ${String(item.number).padStart(2, '0')} 題</span><small>${rateText(item.rate)}</small></button>`;
  }).join('');
  $$('#question-grid button').forEach(button => button.addEventListener('click', () => {
    state.question = Number(button.dataset.question);
    $$('#question-grid button').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.question) === state.question)));
    renderQuestionDetail();
  }));
  renderQuestionDetail();
}

function renderQuestionDetail() {
  const s = subject();
  const item = s.items.find(i => i.number === state.question);
  $('#question-detail').style.setProperty('--subject', s.color);
  $('#question-detail').innerHTML = `<p class="detail-eyebrow">${s.label} / 全班彙總</p><h4>第 ${String(item.number).padStart(2, '0')} 題</h4><div class="detail-rate">${item.rate ?? '—'}<small>%</small></div><p>有效紀錄中的答對比例</p><dl class="detail-counts"><div><dt>答對</dt><dd>${item.correct} 人</dd></div><div><dt>答錯</dt><dd>${item.valid - item.correct} 人</dd></div><div><dt>有效紀錄</dt><dd>${item.valid} 人</dd></div><div><dt>空白反應</dt><dd>${item.missing} 筆</dd></div></dl>`;
}

function initNavigation() {
  const navLinks = $$('.nav-link');
  const sections = $$('main section');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      }
    }
  }, { rootMargin: '-10% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}

function initEvents() {
  $$('#average-mode button').forEach(button => button.addEventListener('click', () => { state.average = button.dataset.mode; renderAverage(); }));
  $('#dimension-group').addEventListener('change', event => { state.group = event.target.value; renderDimensions(); });
  $('#dimension-sort').addEventListener('change', event => { state.dimensionSort = event.target.value; renderDimensions(); });
  $('#distribution-filter').addEventListener('change', event => { state.distribution = event.target.value; renderDistribution(); });
  $('#question-sort').addEventListener('change', event => { state.questionSort = event.target.value; renderQuestions(); });
  $('#print-button').addEventListener('click', () => window.print());
  initNavigation();
}

async function init() {
  try {
    const response = await fetch('./data/assessment.json');
    if (!response.ok) throw new Error(`資料讀取失敗 (${response.status})`);
    dataset = await response.json();
    if (!Array.isArray(dataset.subjects) || dataset.subjects.length !== 3) throw new Error('資料格式有誤');
    renderCards(); renderAverage(); renderLevels(); renderTabs(); renderGroupFilter();
    renderDimensions(); renderObservation(); renderDistribution(); renderQuestions();
    $('#method-average').textContent = dataset.meta.averageNote;
    $('#loading').hidden = true;
    $('#dashboard').hidden = false;
    initEvents();
  } catch (error) {
    $('#loading').className = 'error-message';
    $('#loading').textContent = '暫時無法載入圖表資料，請重新整理頁面。如果持續發生，請稍後再試。';
    console.error(error);
  }
}
init();
