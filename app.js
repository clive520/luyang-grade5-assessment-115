'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const state = {subject:'chinese',dimension:4,group:'all',expanded:false,question:14,questionFilter:'all',questionSort:'original',distribution:'all',role:'parent'};
let dataset;
const subject = () => dataset.subjects.find(s => s.id === state.subject);
const orderedSubjects = () => ['chinese','math','english'].map(id => dataset.subjects.find(s=>s.id===id));
const pp = n => `${n > 0 ? '+' : ''}${n}`;
const comparison = n => n === 0 ? '與市參考相同' : `比市參考${n > 0 ? '高' : '低'} ${Math.abs(n)} 個百分點`;
const colors = ['mastery','basic','support'];
const guides = {
 chinese:{title:'讀懂字詞是強項；文章怎麼接，值得再練。',fact:'字詞理解的報表平均為 92%；章法知識為 48%，比臺中市參考平均 52% 低 4 個百分點。',interpret:'整體國語表現高於市參考平均，仍可把文章組織列為複習方向。章法知識只有 1 題，宜用其他文章再確認，不急著替孩子下結論。',practice:'把一篇短文的段落打散，請孩子重新排序，再說明「為什麼這一段要接在後面」。這是練習例子，不是原試題。',short:'先從文章組織練起',first:4},
 math:{title:'量測要多操作，也要練說出計算步驟。',fact:'量與實測為 40%，是本次數學較低的向度；仍高於市參考平均 33%。程序執行為 52%，解題思考為 81%。',interpret:'「高於參考」和「已經熟練」是不同問題。可以先用實際量測確認概念，再請孩子說明單位、算式與步驟，避免只靠一個總平均決定練什麼。',practice:'用尺量物品，先估計再實測，寫下數字與單位。把做法說出來，再換一個物品試試看；依老師正在教的單元調整難度。',short:'把量測帶回生活情境',first:1},
 english:{title:'平均之外，孩子需要不同步調的練習。',fact:'23 筆英語成績中，18 人在 80–100%，5 人在 20–39%；等級則為 12 人精熟、6 人基礎、5 人待加強。',interpret:'區間與等級是不同分類，但都提醒我們關注學習差異。先確認每個孩子會哪些字、音和句子，再安排練習；資料無法直接告訴我們差異的原因。',practice:'先讓孩子聽一個熟悉的詞，指認圖片，再用短句回答。已熟悉的孩子可改讀一小段對話並說明理由，練習不必全班同一份。',short:'依目前掌握程度安排練習',first:0}
};
const skillGuides = {
 chinese:[
 ['字形和讀音','比較字形、讀音，再放回詞句中辨認。'],['字詞的意思與用法','找一句話中的關鍵詞，換一個詞看看意思怎麼變。'],['句子怎麼組成','把詞語組成完整句子，再說明這樣排的理由。'],['語句怎麼表達','找出一種表達方式，試著用自己的句子表達同樣意思。'],['文章段落怎麼接','為短文段落排序，說明前後連接的線索。'],['不同文章的形式','比較兩種短文，找出形式與用途的不同。'],['讀懂字詞','回到上下文，說出這個詞在這裡的意思。'],['讀懂句子','用自己的話重說一句話，再核對原意。'],['讀懂一個段落','讀一段話，圈出重點，再用一句話摘要。'],['讀懂整篇文章','整理文章的重點與順序，指出答案在文中的依據。']],
 math:[
 ['數字與計算','先說明算式的意思，再算並檢查答案是否合理。'],['量測與單位','先估計，再實際量測，把數字和單位一起記下來。'],['圖形與空間','畫圖或動手操作，說明圖形的特徵與關係。'],['讀取資料與不確定情況','看一張簡單圖表，回答問題時指出資料依據。'],['數量之間的關係','用圖或算式表達兩個數量怎麼互相影響。'],['理解數學概念','說明「為什麼這樣做」，並舉一個自己的例子。'],['完成計算與操作步驟','一步一步寫出做法，檢查單位與每一步的意義。'],['想出解題方法','先畫圖或整理條件，再比較兩種可能的解法。']],
 english:[
 ['聽出不同的語音','聽熟悉的音或詞，辨別差異，再試著跟讀。'],['聽懂單字','聽一個單字，從圖片中指出對應的意思。'],['聽懂日常教室用語','用一個教室情境練習聽指令、回應短句。'],['聽懂文化節慶內容','聽簡短的節慶描述，說出關鍵的人、事或物。'],['認得書面單字','看字配圖，再把單字放進簡短句子。'],['讀懂英文句子','讀一句短句，指認對應情境，再用自己的話說明。'],['讀懂短文與對話','讀一段短對話，圈出回答問題的線索。'],['讀懂文化節慶短文','讀一小段節慶介紹，找出關鍵資訊。']]
};
const rolePlans = {
 parent:{intro:'陪孩子選一個小目標，先理解他怎麼想。',cards:[['一起選一個目標','和孩子或老師討論，從文章組織、量測或英語基礎中，挑一項目前需要的練習。一次處理一項就好。'],['把練習放進生活','可以讀一小段文章、量一件物品，或聽說一組熟悉的英語詞句。練習內容依孩子程度調整。'],['問想法，再看變化','問「你怎麼找到答案？哪裡還不確定？」過幾天換一道相似但不同的題目，和老師一起看是否更熟悉。']]},
 student:{intro:'不用一次解決全部。先找一個自己還不熟的地方。',cards:[['選一題，找卡住的地方','看老師發回的試卷，選一題不懂的，說說是看不懂字句、不知道做法，還是不確定怎麼檢查。'],['把做法說一次','找老師、家人或同學，試著把思路說出來。可以畫圖、用實物，或把文章的線索圈起來。'],['換一題，自己再試','做一題內容不同、能力相近的練習。說明比上次多懂了什麼，還想問什麼。']]},
 teacher:{intro:'先用短題確認，再安排可調整的學習支持。',cards:[['先確認線索','國語可從文章組織、數學從量測著手。英語先確認孩子目前掌握的字、音、句；用多道短題交叉確認。'],['依各科需求安排練習','需要更多支持的孩子先建基礎；基礎組練穩應用；精熟組做延伸挑戰。依短題結果彈性調整，不固定貼標籤。'],['保留一份練後證據','換不同題目再確認，記錄解題思路與是否能獨立完成。單次報表只提供起點，後續表現才幫助調整教學。']]}
};
function renderQuick(){
 const e=dataset.subjects.find(s=>s.id==='english');
 $('#quick-cards').innerHTML=[
 ['01','整體位置','三科都高於市參考平均','國語高 6 個百分點；數學、英語各高 7 個百分點。這說明同科比較的位置，不能推論每位孩子都已掌握。','#school','看看怎麼比較'],
 ['02','學生差異','英語需要不同的練習步調',`精熟 ${e.levels[0].count} 人、待加強 ${e.levels[2].count} 人。整體平均高，仍要分別了解孩子的學習需求。`,'#learners','看看人數分布'],
 ['03','練習起點','從文章組織與量測開始','國語章法知識 48%、數學量與實測 40%。先用短文、實物和不同題目確認，再選練習。','#subjects','看看各科怎麼練']
 ].map(([n,k,t,p,href,label])=>`<article class="quick-card"><div class="quick-top"><span>${k}</span><span class="quick-number">${n}</span></div><h3>${t}</h3><p>${p}</p><a href="${href}">${label} <span aria-hidden="true">→</span></a></article>`).join('');
}
function renderBenchmark(){
 $('#benchmark-cards').innerHTML=orderedSubjects().map(s=>`<article class="benchmark-card" style="--subject:${s.color}"><div class="card-top"><span class="subject-name">${s.label}</span><span class="difference">${comparison(s.reportedAverage-s.benchmark.city)}</span></div><div class="benchmark-score"><strong>${s.reportedAverage}<small>%</small></strong><span>本次原報表平均</span></div><div class="benchmark-bars">${[['本次',s.reportedAverage,'own'],['臺中市',s.benchmark.city,'city'],['總參與縣市',s.benchmark.total,'total']].map(([label,value,cls])=>`<div class="benchmark-row"><span>${label}</span><div><i class="${cls}" style="width:${value}%"></i></div><strong>${value}%</strong></div>`).join('')}</div><p class="card-takeaway">${guides[s.id].short}</p><a class="text-link" href="#subjects" data-open-subject="${s.id}">看${s.label}解讀與練習 →</a></article>`).join('');
}
function renderLevels(){
 $('#level-chart').innerHTML=orderedSubjects().map(s=>`<div class="people-row"><div class="people-label"><h3>${s.label}</h3><span>${s.count} 人</span></div><div class="people-dots" role="img" aria-label="${s.label}，${s.levels.map(l=>`${l.label}${l.count}人`).join('、')}">${s.levels.map((l,i)=>Array.from({length:l.count},()=>`<i class="${colors[i]}" aria-hidden="true"></i>`).join('')).join('')}</div><div class="people-counts">${s.levels.map((l,i)=>`<span><i class="${colors[i]}"></i>${l.label} <strong>${l.count} 人</strong><small>${l.share}%</small></span>`).join('')}</div></div>`).join('');
}
function renderDistribution(){
 const shown=orderedSubjects().filter(s=>state.distribution==='all'||s.id===state.distribution);
 const top=Math.max(...shown.flatMap(s=>s.distribution.map(b=>b.count)),1);
 $('#distribution-chart').innerHTML=dataset.subjects[0].distribution.map((bin,i)=>`<div class="distribution-bin"><h4>${bin.label}</h4>${shown.map(s=>`<div class="distribution-row" style="--subject:${s.color}"><span>${s.label}</span><div><i style="width:${s.distribution[i].count/top*100}%"></i></div><strong>${s.distribution[i].count} 人</strong></div>`).join('')}</div>`).join('');
 $('#distribution-table').innerHTML=`<table><caption>答對率區間人數（每科 23 人）</caption><thead><tr><th scope="col">答對率</th>${shown.map(s=>`<th scope="col">${s.label}</th>`).join('')}</tr></thead><tbody>${dataset.subjects[0].distribution.map((b,i)=>`<tr><th scope="row">${b.label}</th>${shown.map(s=>`<td>${s.distribution[i].count} 人</td>`).join('')}</tr>`).join('')}<tr><th scope="row">合計</th>${shown.map(s=>`<td>${s.count} 人</td>`).join('')}</tr></tbody></table>`;
}
function renderTabs(){
 $('#subject-tabs').innerHTML=orderedSubjects().map(s=>`<button type="button" data-subject="${s.id}" aria-pressed="${s.id===state.subject}" style="--subject:${s.color}">${s.label}<small>${s.items.length} 題</small></button>`).join('');
}
function setSubject(id){
 if(!dataset.subjects.some(s=>s.id===id))return;
 state.subject=id;state.dimension=guides[id].first;state.group='all';state.expanded=false;state.questionFilter='all';
 state.question=[...subject().items].sort((a,b)=>(a.rate??Infinity)-(b.rate??Infinity)||a.number-b.number)[0].number;
 $$('#subject-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.subject===id)));
 $('#question-filter').value='all';
 const s=subject();
 $('#subjects').style.setProperty('--subject',s.color);
 $('#subject-story').innerHTML=`<div class="story-heading"><span class="subject-kicker">${s.label} · 一句話解讀</span><h3>${guides[id].title}</h3></div><div class="story-grid"><div><span class="content-tag">資料看見的結果</span><p>${guides[id].fact}</p></div><div><span class="content-tag interpretation">從結果想到的方向</span><p>${guides[id].interpret}</p></div><div><span class="content-tag practice">可以嘗試的練習</span><p>${guides[id].practice}</p></div></div>`;
 $('#dimension-group').innerHTML='<option value="all">全部類別</option>'+[...new Set(s.dimensions.map(d=>d.group))].map(g=>`<option value="${escapeHTML(g)}">${escapeHTML(g)}</option>`).join('');
 renderDimensions();renderDimensionDetail();renderHardItems();renderQuestionGrid();renderQuestionDetail();
}
function renderDimensions(){
 const s=subject();
 let indices=s.dimensions.map((d,i)=>i).filter(i=>state.group==='all'||s.dimensions[i].group===state.group).sort((a,b)=>s.dimensions[a].rate-s.dimensions[b].rate||a-b);
 const total=indices.length;if(!state.expanded)indices=indices.slice(0,3);
 $('#dimension-chart').innerHTML=indices.map(i=>{const d=s.dimensions[i];const delta=d.rate-d.city;return `<button type="button" class="skill-row" data-dimension="${i}" aria-pressed="${i===state.dimension}"><span class="skill-title">${escapeHTML(skillGuides[s.id][i][0])}<small>${escapeHTML(d.group)} · ${escapeHTML(d.label)} · ${d.questionCount} 題</small></span><span class="skill-meter"><span class="skill-track"><i style="width:${d.rate}%"></i><b style="left:${d.city}%" title="市參考 ${d.city}%"></b></span><strong>${d.rate}%</strong></span><span class="skill-difference ${delta<0?'lower':''}">${pp(delta)}<small>個百分點</small></span></button>`}).join('');
 $('#expand-dimensions').hidden=total<=3;$('#expand-dimensions').textContent=state.expanded?'收回重點 3 個向度':`展開全部 ${total} 個向度`;
 $('#expand-dimensions').setAttribute('aria-expanded',String(state.expanded));
}
function renderDimensionDetail(){
 const s=subject(),d=s.dimensions[state.dimension],g=skillGuides[s.id][state.dimension];
 $('#dimension-detail').innerHTML=`<span class="content-tag">選取的學習線索</span><h3>${escapeHTML(g[0])}</h3><p class="original-name">原名稱：${escapeHTML(d.group)}・${escapeHTML(d.label)}</p><div class="dimension-comparison"><div><strong>${d.rate}<small>%</small></strong><span>本班報表平均</span></div><div><strong>${d.city}<small>%</small></strong><span>臺中市參考</span></div></div><p class="dimension-gap">${comparison(d.rate-d.city)}</p><div class="practice-box"><h4>可以這樣試試看</h4><p>${escapeHTML(g[1])}</p></div><p class="dimension-evidence">本向度涵蓋 ${d.questionCount} 題：${d.items.map(q=>`第 ${q} 題`).join('、')}。${d.questionCount<=2?'題數較少，建議用其他題目再確認。':'可搭配各題作答概況，進一步選練習。'}</p><button type="button" class="text-button" id="show-dimension-questions">查看這個向度的逐題結果 ↓</button>`;
}
function renderHardItems(){
 const s=subject(),hard=[...s.items].filter(i=>i.rate!=null).sort((a,b)=>a.rate-b.rate||a.number-b.number).slice(0,3);
 $('#hard-heading').textContent=`${s.label}：可以先一起討論的 3 道題`;
 $('#hard-items').innerHTML=hard.map(item=>`<button type="button" class="hard-card" data-question="${item.number}" aria-pressed="${item.number===state.question}"><div><span>第 ${item.number} 題</span><span aria-hidden="true">↗</span></div><strong>${item.correct}<small> / ${item.valid} 人答對</small></strong><div class="hard-track"><i style="width:${item.rate}%"></i></div><p>答對率 ${item.rate}%${item.missing?` · ${item.missing} 筆空白`:''}</p></button>`).join('');
}
function renderQuestionGrid(){
 const s=subject();let items=[...s.items];
 if(state.questionFilter==='dimension')items=items.filter(i=>s.dimensions[state.dimension].items.includes(i.number));
 if(state.questionSort==='ascending')items.sort((a,b)=>(a.rate??Infinity)-(b.rate??Infinity)||a.number-b.number);
 if(state.questionFilter==='dimension'&&!items.some(q=>q.number===state.question))state.question=items[0].number;
 $('#question-grid').innerHTML=items.map(item=>`<button type="button" class="question-cell" data-question="${item.number}" aria-pressed="${item.number===state.question}" aria-label="第${item.number}題，${item.correct}人答對，有效紀錄${item.valid}人，空白${item.missing}筆"><span>第 ${item.number} 題</span><strong>${item.correct}<small>/${item.valid} 人</small></strong><span>${item.rate??'—'}%</span></button>`).join('');
 renderQuestionDetail();
}
function renderQuestionDetail(){
 const s=subject(),q=s.items.find(i=>i.number===state.question),dims=s.dimensions.filter(d=>d.items.includes(q.number));
 $('#question-detail').innerHTML=`<div><span class="content-tag">第 ${q.number} 題 · 全班彙總</span><h4>${q.correct} 人答對，${q.valid-q.correct} 人答錯</h4><p>答對率 ${q.rate??'—'}%（${q.correct} ÷ ${q.valid} 位有效紀錄）</p></div><div><p>${dims.map(d=>`${escapeHTML(d.group)}：${escapeHTML(d.label)}`).join('<br>')}</p><p>有效 ${q.valid} 人 · 空白 ${q.missing} 筆</p></div>`;
 $$('[data-question]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.question)===state.question)));
}
function renderAudience(){
 const plan=rolePlans[state.role];
 $('#audience-content').innerHTML=`<h3 class="role-intro">${plan.intro}</h3><div class="action-grid">${plan.cards.map(([title,text],i)=>`<article class="action-card"><span class="action-number">0${i+1}</span><h4>${title}</h4><p>${text}</p></article>`).join('')}</div>${state.role==='teacher'?`<div class="teacher-groups"><h4>各科可參考的支持人數</h4><p>依原報表等級觀察，分組仍需搭配短題與課堂表現確認。</p><div class="table-scroll"><table><thead><tr><th scope="col">科目</th><th scope="col">待加強</th><th scope="col">基礎</th><th scope="col">精熟</th></tr></thead><tbody>${orderedSubjects().map(s=>`<tr><th scope="row">${s.label}</th><td>${s.levels[2].count} 人</td><td>${s.levels[1].count} 人</td><td>${s.levels[0].count} 人</td></tr>`).join('')}</tbody></table></div><p class="footnote">同一人可能出現在不同科，請勿把各科人數加成學生總數。</p></div>`:''}`;
}
function renderMethods(){
 $('#context-note').textContent=dataset.meta.contextNote;
 $('#method-average').textContent=dataset.meta.averageNote;
 $('#average-table').innerHTML=`<table><thead><tr><th scope="col">科目</th><th scope="col">原報表平均</th><th scope="col">23 筆紀錄平均</th></tr></thead><tbody>${orderedSubjects().map(s=>`<tr><th scope="row">${s.label}</th><td>${s.reportedAverage}%</td><td>${s.recordMean.toFixed(1)}%</td></tr>`).join('')}</tbody></table>`;
}
function initEvents(){
 document.addEventListener('click',event=>{
  const open=event.target.closest('[data-open-subject]');if(open)setSubject(open.dataset.openSubject);
  const tab=event.target.closest('#subject-tabs [data-subject]');if(tab)setSubject(tab.dataset.subject);
  const dim=event.target.closest('[data-dimension]');if(dim){state.dimension=Number(dim.dataset.dimension);renderDimensions();renderDimensionDetail();renderQuestionGrid();$(`#dimension-chart [data-dimension="${state.dimension}"]`)?.focus({preventScroll:true});}
  const question=event.target.closest('[data-question]');if(question){state.question=Number(question.dataset.question);renderQuestionDetail();}
  const role=event.target.closest('[data-role]');if(role){state.role=role.dataset.role;$$('[data-role]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.role===state.role)));renderAudience();}
  if(event.target.closest('#show-dimension-questions')){state.questionFilter='dimension';state.question=subject().dimensions[state.dimension].items[0];$('#question-filter').value='dimension';$('#question-explorer').open=true;renderQuestionGrid();renderQuestionDetail();$('#question-explorer').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
 });
 $('#expand-dimensions').addEventListener('click',()=>{state.expanded=!state.expanded;renderDimensions()});
 $('#dimension-group').addEventListener('change',event=>{state.group=event.target.value;state.expanded=false;const indices=subject().dimensions.map((d,i)=>i).filter(i=>state.group==='all'||subject().dimensions[i].group===state.group).sort((a,b)=>subject().dimensions[a].rate-subject().dimensions[b].rate);state.dimension=indices[0];renderDimensions();renderDimensionDetail();renderQuestionGrid()});
 $('#question-filter').addEventListener('change',event=>{state.questionFilter=event.target.value;renderQuestionGrid()});
 $('#question-sort').addEventListener('change',event=>{state.questionSort=event.target.value;renderQuestionGrid()});
 $('#distribution-filter').addEventListener('change',event=>{state.distribution=event.target.value;renderDistribution()});
 $('#print-button').addEventListener('click',()=>window.print());
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)$$('.site-header nav a').forEach(a=>{const target={"quick-read":"overview",learners:"school"}[entry.target.id]||entry.target.id;const active=a.hash===`#${target}`;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})},{rootMargin:'-15% 0px -65% 0px'});$$('main section[id]').forEach(s=>observer.observe(s));}
}
async function init(){try{const response=await fetch('./data/assessment.json');if(!response.ok)throw new Error(`Data response ${response.status}`);dataset=await response.json();if(dataset.subjects.length!==3)throw new Error('Invalid subject data');renderQuick();renderBenchmark();renderLevels();renderDistribution();renderTabs();setSubject('chinese');renderAudience();renderMethods();$('#loading').hidden=true;$('#dashboard').hidden=false;initEvents()}catch(error){$('#loading').className='error-message';$('#loading').textContent='圖表暫時無法載入，請重新整理頁面後再試。';console.error(error)}}
init();
