'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const keyOf = student => `${student.classCode}:${student.seatNumber}`;
  const state = {classCode:'',seatQuery:'',view:'all',selectedKey:null};
  let data;

  function resultFor(student, subjectId) {
    return student.results[subjectId] || null;
  }
  function badge(level) {
    const css = {'精熟':'mastery','基礎':'basic','待加強':'support'}[level];
    return css ? `<span class="level-tag level-${css}">${escapeHTML(level)}</span>` : '<span class="level-tag">未提供</span>';
  }
  function shownSubjects() {
    return data.subjects.filter(s => state.view === 'all' || s.id === state.view);
  }
  function filteredStudents() {
    const query = state.seatQuery.trim();
    const valid = /^\d{1,2}$/.test(query);
    const seat = valid ? query.padStart(2,'0') : null;
    return data.students.filter(s => (!state.classCode || s.classCode === state.classCode) && (!query || s.seatNumber === seat));
  }
  function tableScore(student, subject) {
    const result = resultFor(student,subject.id);
    if (!result || result.answerRate == null) return '<span class="missing-score">未提供</span>';
    return `<div class="table-score" style="--subject:${subject.color}"><strong>${result.answerRate}<small>%</small></strong>${badge(result.level)}</div>`;
  }
  function renderRoster(students) {
    const subjects = shownSubjects();
    $('#result-count').textContent = `${students.length} / ${data.students.filter(s=>!state.classCode || s.classCode===state.classCode).length} 位學生`;
    $('#results-head').innerHTML = `<tr><th scope="col">班級</th><th scope="col">座號</th>${subjects.map(s=>`<th scope="col">${escapeHTML(s.label)}<small>答對率 · 等級</small></th>`).join('')}<th scope="col"><span class="sr-only">查看個人成績</span></th></tr>`;
    $('#results-body').innerHTML = students.map(s => {
      const selected = state.selectedKey === keyOf(s);
      return `<tr class="${selected?'selected':''}"><td class="class-cell">${escapeHTML(s.classCode)} 班</td><td><span class="seat-number">${escapeHTML(s.seatNumber)}</span></td>${subjects.map(subject=>`<td>${tableScore(s,subject)}</td>`).join('')}<td><button type="button" class="view-student" data-student="${escapeHTML(keyOf(s))}" aria-pressed="${selected}" aria-label="查看 ${s.classCode} 班 ${s.seatNumber} 號三科成績">查看</button></td></tr>`;
    }).join('');
    $('#mobile-roster').innerHTML = students.map(s => {
      const selected = state.selectedKey === keyOf(s);
      return `<article class="mobile-student ${selected?'selected':''}" data-record="${escapeHTML(keyOf(s))}"><div class="mobile-student-heading"><div><span>${escapeHTML(s.classCode)} 班</span><span class="seat-number">${escapeHTML(s.seatNumber)} 號</span></div><button type="button" class="view-student" data-student="${escapeHTML(keyOf(s))}" aria-pressed="${selected}" aria-label="查看 ${s.classCode} 班 ${s.seatNumber} 號三科成績">查看圖表</button></div><div class="mobile-scores ${subjects.length===1?'single-subject':''}">${subjects.map(subject=>{
        const result = resultFor(s,subject.id);
        return `<div class="mobile-score" style="--subject:${subject.color}"><span>${escapeHTML(subject.label)}</span>${result&&result.answerRate!=null?`<strong>${result.answerRate}<small>%</small></strong>${badge(result.level)}`:'<span>未提供</span>'}</div>`;
      }).join('')}</div></article>`;
    }).join('');
    $('#empty-state').hidden = students.length !== 0;
    $$('.subject-view button').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.subject===state.view)));
    const className = state.classCode ? `${state.classCode} 班` : '全部班級';
    $('#roster-heading').textContent = `${className}成績一覽`;
  }
  function renderDetail(students) {
    const student = students.find(s=>keyOf(s)===state.selectedKey);
    if (!student) {
      $('#student-detail').innerHTML = '<div class="detail-empty">目前沒有符合篩選的學生紀錄。<br>請調整班級或座號後再查看。</div>';
      $('#student-navigation').hidden = true;
      return;
    }
    $('#student-navigation').hidden = false;
    $('#student-detail').innerHTML = `<div class="student-identity"><span>受測時班級・座號</span><h3>${escapeHTML(student.classCode)} 班<strong>${escapeHTML(student.seatNumber)}</strong>號</h3><p>115 年度 · 五年級學力測驗</p></div><div class="individual-scores">${data.subjects.map(subject=>{
      const result = resultFor(student,subject.id);
      const exists = result&&result.answerRate!=null;
      return `<div class="individual-score" style="--subject:${subject.color}"><div class="individual-score-top"><span>${escapeHTML(subject.label)}</span>${exists?badge(result.level):''}<strong>${exists?result.answerRate:'—'}${exists?'<small>%</small>':''}</strong></div><div class="individual-track" role="img" aria-label="${escapeHTML(subject.label)}${exists?`答對率 ${result.answerRate}%，等級${escapeHTML(result.level)}`:'成績未提供'}"><i style="width:${exists?result.answerRate:0}%"></i></div></div>`;
    }).join('')}</div><div class="chart-axis" aria-hidden="true"><span>0%</span><span>50%</span><span>100%</span></div><p class="detail-score-note">三科均顯示來源報表的整體答對率與等級；答對率以四捨五入後的原始百分比呈現。</p>`;
    const index = students.findIndex(s=>keyOf(s)===state.selectedKey);
    $('#student-position').textContent = `${index+1} / ${students.length}`;
    $('#previous-student').disabled = index===0;
    $('#next-student').disabled = index===students.length-1;
  }
  function render() {
    const students = filteredStudents();
    if (!students.some(s=>keyOf(s)===state.selectedKey)) state.selectedKey=students.length?keyOf(students[0]):null;
    renderRoster(students);
    renderDetail(students);
  }
  function selectStudent(key) {
    const students = filteredStudents();
    if (!students.some(s=>keyOf(s)===key)) return;
    state.selectedKey = key;
    // Update only selection styles so keyboard focus remains on the clicked button.
    $$('[data-student]').forEach(button=>{
      const selected = button.dataset.student===key;
      button.setAttribute('aria-pressed',String(selected));
      button.closest('tr,.mobile-student')?.classList.toggle('selected',selected);
    });
    renderDetail(students);
  }
  function moveStudent(direction) {
    const students = filteredStudents();
    const index = students.findIndex(s=>keyOf(s)===state.selectedKey);
    const target = students[index+direction];
    if (target) selectStudent(keyOf(target));
  }
  function initEvents() {
    $('#class-filter').addEventListener('change',event=>{state.classCode=event.target.value;render()});
    $('#seat-search').addEventListener('input',event=>{state.seatQuery=event.target.value;render()});
    $('#reset-filters').addEventListener('click',()=>{state.seatQuery='';state.view='all';$('#seat-search').value='';render()});
    $('#subject-view').addEventListener('click',event=>{
      const button = event.target.closest('[data-subject]');
      if (button) {state.view=button.dataset.subject;render()}
    });
    document.addEventListener('click',event=>{
      const button = event.target.closest('[data-student]');
      if (button) {
        selectStudent(button.dataset.student);
        if (matchMedia('(max-width:900px)').matches) $('.student-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
      }
    });
    $('#back-to-roster').addEventListener('click',()=>$('.filters-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'}));
    $('#previous-student').addEventListener('click',()=>moveStudent(-1));
    $('#next-student').addEventListener('click',()=>moveStudent(1));
    $('#print-button').addEventListener('click',()=>window.print());
  }
  async function init() {
    try {
      const response = await fetch('./data/class-results.json');
      if (!response.ok) throw new Error(`Unable to load class results (${response.status})`);
      data = await response.json();
      if (!Array.isArray(data.students)||!Array.isArray(data.subjects)||!data.meta.classCodes.length) throw new Error('Invalid class results');
      state.classCode = data.meta.classCodes[0];
      $('#class-filter').innerHTML = `${data.meta.classCodes.length>1?'<option value="">全部班級</option>':''}${data.meta.classCodes.map(c=>`<option value="${escapeHTML(c)}">${escapeHTML(c)} 班</option>`).join('')}`;
      $('#class-filter').value = state.classCode;
      $('#scope-count').innerHTML = `${data.students.length} <small>位學生</small>`;
      $('#scope-description').textContent = `${data.meta.classCodes.join('、')} 班 · ${data.subjects.map(s=>s.label).join('、')}`;
      render();
      initEvents();
      $('#loading').hidden = true;
      $('#results-app').hidden = false;
    } catch (error) {
      $('#loading').className = 'load-error';
      $('#loading').textContent = '成績暫時無法載入，請重新整理後再試。';
      console.error(error);
    }
  }
  init();
})();
