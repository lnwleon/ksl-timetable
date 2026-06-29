'use strict';

/* ══════ DATA ══════ */
var COLORS = [
  {cls:'c-civil',bg:'#daeaf8',tc:'#1a3a5c'},{cls:'c-crim',bg:'#fde8c0',tc:'#4a2800'},
  {cls:'c-comm',bg:'#d8edca',tc:'#1a3d0a'},{cls:'c-conv',bg:'#f9d6e4',tc:'#4a1530'},
  {cls:'c-trial',bg:'#e4e2f9',tc:'#2a2060'},{cls:'c-lpm',bg:'#c8f0e0',tc:'#064030'},
  {cls:'c-lwd',bg:'#fcddd0',tc:'#3c1408'},{cls:'c-pe',bg:'#e8e6df',tc:'#2a2a26'},
  {cls:'c-prob',bg:'#fde8b8',tc:'#3a2000'},{cls:'c-free',bg:'#d8edd0',tc:'#1a4a10'}
];
var COL_NAMES = ['Early (6:15–7am)','Block 1 (9–11am)','Block 2 (11am–1pm)','Block 3 (1–3pm)','Block 4 (3–5pm)','Evening (10pm–12am)','Night Draft (+1hr)'];
var COL_TIMES = ['6:15–7:00am','9:00–11:00am','11:00am–1:00pm','1:00–3:00pm','3:00–5:00pm','10:00pm–12:00am','+1hr drafting'];
var SESSION_NAMES = ['Early','Block 1','Block 2','Block 3','Block 4','Evening','Night'];
var DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var MOTIVATIONS = ['You got this!','Stay focused!','Keep pushing!','One day at a time.','Make it count!','Discipline = success.','Eyes on the prize!','Believe and achieve!'];
var QUOTES = [
  'The secret of getting ahead is getting started.',
  'Success is the sum of small efforts repeated day in and day out.',
  'Discipline is choosing what you want most over what you want now.',
  'Law is reason free from passion. — Aristotle',
  'Your future is created by what you do today, not tomorrow.',
  'Champions keep going when they have nothing left.',
  'Every expert was once a beginner. Keep going.',
  'Don\'t count the days — make the days count.',
  'The harder you work, the luckier you get.',
  'Kenya School of Law — you\'ve got this. Study hard, pass harder.'
];
var UNITS = [
  {name:'Civil Litigation',key:'civil',bg:'#daeaf8'},
  {name:'Criminal Lit.',key:'crim',bg:'#fde8c0'},
  {name:'Commercial Trans.',key:'comm',bg:'#d8edca'},
  {name:'Conveyancing',key:'conv',bg:'#f9d6e4'},
  {name:'Trial',key:'trial',bg:'#e4e2f9'},
  {name:'LPM',key:'lpm',bg:'#c8f0e0'},
  {name:'LWD',key:'lwd',bg:'#fcddd0',priority:true},
  {name:'PE',key:'pe',bg:'#e8e6df'},
  {name:'Probate & Admin',key:'prob',bg:'#fde8b8'}
];
var ORAL_TASKS = [
  {key:'notes',label:'Written summary notes'},
  {key:'procedure',label:'Memorised key procedure steps'},
  {key:'cases',label:'Reviewed cases / statutes'},
  {key:'pastq',label:'Reviewed past oral questions'},
  {key:'mockoral',label:'Done at least one mock oral'},
  {key:'confident',label:'Feel confident to speak on this'}
];
var YEARS = [];
(function(){for(var y=2015;y<=2024;y++)YEARS.push(y);})();
var PAPER_STATES = ['none','attempted','reviewed'];
var PAPER_BG = {none:'#f2f1ed',attempted:'#fde8b8',reviewed:'#d8edca'};
var PAPER_TC = {none:'#aaa',attempted:'#4a2800',reviewed:'#1a3d0a'};
var DEFAULT_TIMETABLE = [
  {day:'Mon',di:1,cols:['c-pe','c-civil','c-prob','c-lwd','c-civil','c-lwd','c-civil'],labels:['PE','Civil Lit.','Probate & Admin','LWD','Civil Lit.','LWD','Civil Lit.']},
  {day:'Tue',di:2,cols:['c-lwd','c-crim','c-trial','c-civil','c-civil','c-civil','c-civil'],labels:['LWD','Criminal Lit.','Trial','Civil Lit.','Civil Lit.','Civil Lit.','Civil Lit.']},
  {day:'Wed',di:3,cols:['c-lpm','c-comm','c-pe','c-conv','c-conv','c-conv','c-conv'],labels:['LPM','Commercial','PE','Conveyancing','Conveyancing','Conveyancing','Conveyancing']},
  {day:'Thu',di:4,cols:['c-lwd','c-prob','c-lwd','c-crim','c-lpm','c-crim','c-lpm'],labels:['LWD','Probate & Admin','LWD','Criminal Lit.','LPM','Criminal Lit.','LPM']},
  {day:'Fri',di:5,cols:['c-lpm','c-pe','c-comm','c-lpm','c-lpm','c-lpm','c-lpm'],labels:['LPM','PE','Commercial','LPM','LPM','LPM','LPM']},
  {day:'Sat',di:6,cols:['c-free','c-free','c-free','c-free','c-free','c-free','c-free'],labels:['Rest','Rest','Rest','Rest','Rest','Rest','Rest']},
  {day:'Sun',di:0,cols:['c-empty','c-lpm','c-trial','c-prob','c-comm','c-comm','c-comm'],labels:['—','LPM ★','Trial','Probate & Admin','Commercial','Commercial','Commercial']}
];

/* ══════ STATE ══════ */
var timetable, progress={}, checkedToday={}, editMode=false, editTarget=null, selectedCls=null, toastTimer=null, activeTab='today';

/* ══════ STORAGE ══════ */
function sGet(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function sSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}
function sDel(k){try{localStorage.removeItem(k);}catch(e){}}

/* ══════ HELPERS ══════ */
function el(id){return document.getElementById(id);}
function pad2(n){return n<10?'0'+n:''+n;}
function colorByCls(cls){for(var i=0;i<COLORS.length;i++)if(COLORS[i].cls===cls)return COLORS[i];return null;}
function clsToKey(cls){var m={'c-civil':'civil','c-crim':'crim','c-comm':'comm','c-conv':'conv','c-trial':'trial','c-lpm':'lpm','c-lwd':'lwd','c-pe':'pe','c-prob':'prob'};return m[cls]||null;}
function countSlots(){var c={};UNITS.forEach(function(u){c[u.key]=0;});timetable.forEach(function(row){row.cols.forEach(function(cls){var k=clsToKey(cls);if(k&&c[k]!==undefined)c[k]++;});});return c;}
function getWeekKey(){var d=new Date(),day=d.getDay()||7;d.setDate(d.getDate()-day+1);return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function todayRow(){var di=new Date().getDay();for(var i=0;i<timetable.length;i++)if(timetable[i].di===di)return timetable[i];return null;}

/* ══════ ONBOARDING ══════ */
function obNext(step){
  for(var i=1;i<=3;i++){
    var s=el('ob-step-'+i),d=el('od'+i);
    if(s)s.classList.toggle('active',i===step);
    if(d)d.classList.toggle('active',i===step);
  }
}
function obDone(){
  sSet('ksl_ob_done',true);
  var o=el('onboarding');
  if(o)o.hidden=true;
}
function showOnboarding(){
  if(!sGet('ksl_ob_done',false)){
    var o=el('onboarding');
    if(o)o.hidden=false;
  }
}
window.obNext=obNext; window.obDone=obDone;

/* ══════ TABS ══════ */
function switchTab(name){
  activeTab=name;
  document.querySelectorAll('.bb-btn').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-tab')===name);});
  document.querySelectorAll('.tab-pane').forEach(function(d){d.classList.toggle('active',d.id==='tab-'+name);});
  if(name==='today'){buildHero();buildTodayCard();buildQuote();}
  if(name==='study'){buildTable();buildGoals();}
  if(name==='track'){buildPapers();buildOrals();buildProgress();}
}
window.switchTab=switchTab;

/* ══════ COUNTDOWN ══════ */
function startCountdown(targetISO,timerId,barId,startISO){
  var target=new Date(targetISO).getTime(),start=new Date(startISO).getTime(),total=target-start;
  var tEl=el(timerId),bEl=el(barId);
  function tick(){
    var now=Date.now(),diff=target-now;
    var pct=total>0?Math.min(100,Math.max(0,((total-diff)/total)*100)):100;
    if(bEl)bEl.style.width=pct.toFixed(1)+'%';
    if(!tEl)return;
    if(diff<=0){tEl.innerHTML='<span style="font-size:13px;font-weight:700;color:#a02020">Exam Day!</span>';return;}
    var d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
    var cls=timerId==='oralTimer'?'oral':'main';
    tEl.innerHTML='<div class="cd-unit"><span class="cd-num '+cls+'">'+d+'</span><span class="cd-sub">days</span></div><span class="cd-sep">:</span><div class="cd-unit"><span class="cd-num '+cls+'">'+pad2(h)+'</span><span class="cd-sub">hrs</span></div><span class="cd-sep">:</span><div class="cd-unit"><span class="cd-num '+cls+'">'+pad2(m)+'</span><span class="cd-sub">min</span></div><span class="cd-sep">:</span><div class="cd-unit"><span class="cd-num '+cls+'">'+pad2(s)+'</span><span class="cd-sub">sec</span></div>';
  }
  tick();setInterval(tick,1000);
}

/* ══════ HERO ══════ */
function buildHero(){
  var now=new Date(),di=now.getDay();
  var mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var hDay=el('heroDay'),hDate=el('heroDate'),hMot=el('heroMot');
  if(hDay)hDay.textContent=DAY_NAMES[di];
  if(hDate)hDate.textContent=now.getDate()+' '+mo[now.getMonth()]+' '+now.getFullYear();
  if(hMot)hMot.textContent=MOTIVATIONS[now.getDate()%MOTIVATIONS.length];
  // Ring: days to oral
  var diff=new Date('2026-07-20T08:00:00+03:00').getTime()-Date.now();
  var dLeft=Math.max(0,Math.ceil(diff/86400000));
  var rNum=el('ringDays');if(rNum)rNum.textContent=dLeft;
  // 150.8 = 2π×24 (circumference of r=24 circle)
  var total=new Date('2026-07-20T08:00:00+03:00').getTime()-new Date('2026-01-01T00:00:00+03:00').getTime();
  var pct=total>0?Math.min(1,Math.max(0,(total-diff)/total)):1;
  var ring=el('ringOral');
  if(ring)ring.style.strokeDashoffset=(150.8*(1-pct)).toFixed(2);
}

/* ══════ TODAY CHECKLIST ══════ */
function buildTodayCard(){
  var now=new Date(),di=now.getDay();
  var dateKey=now.getFullYear()+'-'+pad2(now.getMonth()+1)+'-'+pad2(now.getDate());
  var storKey='ksl_check_'+dateKey;
  if(!checkedToday[dateKey])checkedToday[dateKey]=sGet(storKey,{});
  var checked=checkedToday[dateKey];
  var row=todayRow(),listEl=el('todayChecklist'),progEl=el('todayProg');
  if(!listEl)return;
  if(!row){listEl.innerHTML='<p class="helper-text">No schedule found.</p>';return;}
  if(row.di===6){
    listEl.innerHTML='<div class="today-free">🌿 Saturday — Rest Day<br><small style="color:#666;font-weight:400">Your brain is consolidating memory. No studying today.</small></div>';
    if(progEl)progEl.textContent='';return;
  }
  var sessions=[],doneCount=0;
  for(var c=0;c<7;c++){
    var lbl=row.labels[c];if(!lbl||lbl==='—')continue;
    if(checked[c])doneCount++;
    sessions.push(c);
  }
  if(progEl)progEl.textContent=doneCount+'/'+sessions.length+' done';
  var html='';
  sessions.forEach(function(c){
    var lbl=row.labels[c],cls=row.cols[c];
    var col=colorByCls(cls),bg=col?col.bg:'#f2f1ed';
    var isDone=!!checked[c];
    html+='<div class="check-item'+(isDone?' done':'')+'" onclick="toggleCheck(\''+dateKey+'\','+c+')" style="border-color:'+(isDone?'#c0e0c0':'#f0efe8')+'">'+
      '<div class="check-box">'+(isDone?'✓':'')+'</div>'+
      '<span class="check-session">'+SESSION_NAMES[c]+'</span>'+
      '<span class="check-label">'+lbl+'</span>'+
      '<span class="check-time">'+COL_TIMES[c]+'</span>'+
    '</div>';
  });
  listEl.innerHTML=html||'<p class="helper-text">Nothing scheduled today.</p>';
}
function toggleCheck(dateKey,col){
  var storKey='ksl_check_'+dateKey;
  if(!checkedToday[dateKey])checkedToday[dateKey]={};
  checkedToday[dateKey][col]=!checkedToday[dateKey][col];
  sSet(storKey,checkedToday[dateKey]);
  // pop animation on the box
  var items=document.querySelectorAll('.check-item');
  items.forEach(function(item){
    if(item.getAttribute('onclick')&&item.getAttribute('onclick').indexOf(','+col+')')>-1){
      item.classList.add('check-pop');
      setTimeout(function(){item.classList.remove('check-pop');},300);
    }
  });
  buildTodayCard();
  if(checkedToday[dateKey][col])showToast('Session ticked ✓');
}
window.toggleCheck=toggleCheck;

/* ══════ QUOTE ══════ */
function buildQuote(){var q=el('quoteBar');if(q&&QUOTES.length){q.textContent='\u201C '+QUOTES[new Date().getDate()%QUOTES.length];}}

/* ══════ TIMETABLE ══════ */
function buildTable(){
  var tbody=el('ttBody');if(!tbody)return;
  var todayDi=new Date().getDay(),html='';
  for(var r=0;r<timetable.length;r++){
    var row=timetable[r],isSat=row.di===6,isToday=row.di===todayDi;
    html+='<tr'+(isSat?' class="sat-row"':isToday?' class="today-row"':'')+' data-r="'+r+'">';
    html+='<td class="day-cell">'+row.day+'</td>';
    for(var c=0;c<7;c++){
      var cls=row.cols[c]||'c-empty',lbl=row.labels[c]||'—';
      html+='<td class="'+cls+'" data-r="'+r+'" data-c="'+c+'">'+(cls==='c-lwd'?'<span class="lwd-badge">★</span>':'')+lbl+'<span class="edit-dot"></span></td>';
    }
    html+='</tr>';
  }
  tbody.innerHTML=html;
  tbody.onclick=function(e){
    if(!editMode)return;
    var td=e.target.closest('td[data-c]');if(!td)return;
    var cls=td.className.split(' ')[0];
    if(cls==='day-cell'||cls==='c-empty'||cls==='c-free')return;
    openPopover(parseInt(td.getAttribute('data-r'),10),parseInt(td.getAttribute('data-c'),10));
  };
}

/* ══════ GOALS ══════ */
function buildGoals(){
  var c=el('goalsContainer'),s=el('goalsSummary');if(!c)return;
  var wk=getWeekKey(),goals=sGet('ksl_goals_'+wk,{});
  var html='<div class="goals-header-row"><span class="goals-col-lbl">Unit</span><span class="goals-col-lbl">Planned</span><span class="goals-col-lbl">Actual</span><span class="goals-col-lbl">Status</span></div>';
  var tp=0,ta=0;
  UNITS.forEach(function(u){
    var g=goals[u.key]||{planned:0,actual:0};
    tp+=g.planned||0;ta+=g.actual||0;
    var diff=(g.actual||0)-(g.planned||0);
    var status=g.planned===0?'—':diff>=0?'<span class="status-ok">On track ✓</span>':'<span class="status-behind">−'+(Math.abs(diff).toFixed(1))+'h</span>';
    html+='<div class="goals-row" style="border-left:3px solid '+u.bg+'">'+
      '<div class="goals-unit">'+(u.priority?'★ ':'')+u.name+'</div>'+
      '<div class="goals-input-wrap"><button class="hr-btn" onclick="adjGoal(\''+u.key+'\',\'planned\',-0.5)">−</button><span class="hr-val" id="gp-'+u.key+'">'+(g.planned||0)+'</span><button class="hr-btn" onclick="adjGoal(\''+u.key+'\',\'planned\',0.5)">+</button></div>'+
      '<div class="goals-input-wrap"><button class="hr-btn" onclick="adjGoal(\''+u.key+'\',\'actual\',-0.5)">−</button><span class="hr-val" id="ga-'+u.key+'">'+(g.actual||0)+'</span><button class="hr-btn" onclick="adjGoal(\''+u.key+'\',\'actual\',0.5)">+</button></div>'+
      '<div class="goals-status">'+status+'</div></div>';
  });
  c.innerHTML=html;
  var sdiff=ta-tp,sc=sdiff>=0?'#1a3d0a':'#a02020';
  if(s)s.innerHTML='<div class="summary-row"><span>Planned this week</span><strong>'+tp.toFixed(1)+'h</strong></div><div class="summary-row"><span>Studied this week</span><strong>'+ta.toFixed(1)+'h</strong></div><div class="summary-row"><span>Difference</span><strong style="color:'+sc+'">'+(sdiff>=0?'+':'')+sdiff.toFixed(1)+'h</strong></div><div class="summary-bar-wrap"><div class="summary-bar" style="width:'+Math.min(100,tp>0?ta/tp*100:0).toFixed(0)+'%;background:#d8edca"></div></div>';
}
function adjGoal(unitKey,field,delta){
  var wk=getWeekKey(),goals=sGet('ksl_goals_'+wk,{});
  if(!goals[unitKey])goals[unitKey]={planned:0,actual:0};
  goals[unitKey][field]=Math.max(0,Math.round(((goals[unitKey][field]||0)+delta)*10)/10);
  sSet('ksl_goals_'+wk,goals);buildGoals();
}
function resetWeekGoals(){if(!confirm('Reset all goals for this week?'))return;sDel('ksl_goals_'+getWeekKey());buildGoals();showToast('Goals reset');}
window.adjGoal=adjGoal;window.resetWeekGoals=resetWeekGoals;

/* ══════ PAST PAPERS ══════ */
function buildPapers(){
  var c=el('papersContainer'),emEl=el('papersEmpty');if(!c)return;
  var papers=sGet('ksl_papers',{});
  var html='';
  UNITS.forEach(function(u){
    var done=0;
    YEARS.forEach(function(y){if((papers[u.key]||{})[y]==='reviewed')done++;});
    var pct=Math.round(done/YEARS.length*100);
    html+='<div class="card paper-card"><div class="paper-unit-header"><span class="paper-unit-name">'+(u.priority?'★ ':'')+u.name+'</span><span class="paper-summary">'+done+'/'+YEARS.length+' reviewed <span class="paper-pct-badge" style="background:'+u.bg+'">'+pct+'%</span></span></div><div class="paper-bar-wrap"><div class="paper-bar" style="width:'+pct+'%;background:'+u.bg+'"></div></div><div class="paper-years">';
    YEARS.forEach(function(y){
      var state=(papers[u.key]||{})[y]||'none';
      var stateLabel=state==='reviewed'?'✓ done':state==='attempted'?'tried':'';
      html+='<button class="year-btn" style="background:'+PAPER_BG[state]+';color:'+PAPER_TC[state]+'" data-unit="'+u.key+'" data-year="'+y+'" onclick="cyclePaper(\''+u.key+'\','+y+',this)">'+y+'<span class="year-state">'+stateLabel+'</span></button>';
    });
    html+='</div></div>';
  });
  c.innerHTML=html;
  if(emEl)emEl.hidden=true;
}
function cyclePaper(unitKey,year,btn){
  var papers=sGet('ksl_papers',{});
  if(!papers[unitKey])papers[unitKey]={};
  var cur=papers[unitKey][year]||'none';
  var next=PAPER_STATES[(PAPER_STATES.indexOf(cur)+1)%PAPER_STATES.length];
  papers[unitKey][year]=next;sSet('ksl_papers',papers);
  if(btn){btn.classList.add('year-pop');setTimeout(function(){btn.classList.remove('year-pop');},250);}
  buildPapers();
  if(next==='reviewed')showToast('✓ '+year+' reviewed!');
  else if(next==='attempted')showToast('Marked attempted');
  else showToast('Cleared');
}
window.cyclePaper=cyclePaper;

/* ══════ ORAL PREP ══════ */
function buildOrals(){
  var c=el('oralsContainer'),dEl=el('oralDaysLeft'),emEl=el('oralsEmpty');if(!c)return;
  var diff=new Date('2026-07-20T08:00:00+03:00').getTime()-Date.now();
  var dl=Math.max(0,Math.ceil(diff/86400000));
  if(dEl)dEl.textContent=dl+' days to go';
  var orals=sGet('ksl_orals',{});
  var html='';
  UNITS.forEach(function(u){
    var tasks=orals[u.key]||{};
    var done=ORAL_TASKS.filter(function(t){return tasks[t.key];}).length;
    var pct=Math.round(done/ORAL_TASKS.length*100);
    html+='<div class="card oral-card"><div class="oral-unit-header"><div class="oral-unit-name">'+(u.priority?'<span class="lwd-star">★</span> ':'')+u.name+'</div><div class="oral-pct-wrap"><span class="oral-pct">'+done+'/'+ORAL_TASKS.length+'</span><div class="oral-bar-wrap"><div class="oral-bar" style="width:'+pct+'%;background:'+u.bg+'"></div></div></div></div><div class="oral-tasks">';
    ORAL_TASKS.forEach(function(t){
      var checked=!!tasks[t.key];
      html+='<label class="oral-task'+(checked?' oral-task-done':'')+'"><input type="checkbox" '+(checked?'checked':'')+' onchange="toggleOral(\''+u.key+'\',\''+t.key+'\',this.checked)"/><span>'+t.label+'</span></label>';
    });
    html+='</div></div>';
  });
  c.innerHTML=html;
  if(emEl)emEl.hidden=true;
}
function toggleOral(unitKey,taskKey,checked){
  var orals=sGet('ksl_orals',{});
  if(!orals[unitKey])orals[unitKey]={};
  orals[unitKey][taskKey]=checked;sSet('ksl_orals',orals);buildOrals();
  if(checked)showToast('✓ Marked complete');
}
window.toggleOral=toggleOral;

/* ══════ PROGRESS ══════ */
function buildProgress(){
  var listEl=el('progList');if(!listEl)return;
  var counts=countSlots(),total=7*7,html='';
  UNITS.forEach(function(u){
    var autoV=total>0?Math.round((counts[u.key]||0)/total*100):0;
    var manV=progress[u.key]!==undefined?progress[u.key]:-1;
    var pct=manV>=0?manV:autoV;
    var star=u.priority?'<span class="lwd-star">★</span> ':'';
    html+='<div class="prog-row"><div class="prog-name">'+star+u.name+'</div><div class="prog-bar-wrap" data-key="'+u.key+'" tabindex="0" role="button"><div class="prog-bar" id="pb-'+u.key+'" style="width:'+pct+'%;background:'+u.bg+'"></div></div><div class="prog-pct" id="pp-'+u.key+'">'+pct+'%</div></div>';
  });
  listEl.innerHTML=html;
  listEl.onclick=function(e){var w=e.target.closest('[data-key]');if(w)cycleProgress(w.getAttribute('data-key'));};
  listEl.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){var w=e.target.closest('[data-key]');if(w){e.preventDefault();cycleProgress(w.getAttribute('data-key'));}}};
}
function cycleProgress(key){
  var steps=[0,25,50,75,100],cur=progress[key]!==undefined&&progress[key]>=0?progress[key]:0;
  var next=steps[(steps.indexOf(cur)+1)%steps.length];
  progress[key]=next;sSet('ksl_prog',progress);
  var bar=el('pb-'+key),pct=el('pp-'+key);
  if(bar)bar.style.width=next+'%';if(pct)pct.textContent=next+'%';
  showToast(next===100?'🎉 Unit complete!':'Progress: '+next+'%');
}

/* ══════ EDIT MODE ══════ */
function toggleEdit(){
  editMode=!editMode;
  var btn=el('editBtn'),save=el('saveBtn'),hint=el('editHint');
  if(btn){btn.textContent=editMode?'✏️ Editing':'✏️ Edit';btn.className='btn-nav'+(editMode?' active':'');}
  if(save)save.hidden=!editMode;
  if(hint)hint.hidden=!editMode;
  document.body.classList.toggle('edit-mode',editMode);
  if(!editMode)closePopover();
  buildTable();
}
function saveAll(){
  var ok=sSet('ksl_tt',timetable);
  showToast(ok?'✅ Saved!':'⚠️ Storage full');
  toggleEdit();buildTodayCard();
}
function resetAll(){
  if(!confirm('Reset to original timetable? All edits will be lost.'))return;
  timetable=JSON.parse(JSON.stringify(DEFAULT_TIMETABLE));
  progress={};sDel('ksl_tt');sDel('ksl_prog');
  buildTable();buildTodayCard();
  showToast('↩ Reset');if(editMode)toggleEdit();
}
window.toggleEdit=toggleEdit;window.saveAll=saveAll;window.resetAll=resetAll;

/* ══════ POPOVER ══════ */
function openPopover(r,c){
  var row=timetable[r];editTarget={r:r,c:c};selectedCls=row.cols[c];
  var ctx=el('popoverCtx'),inp=el('popoverInput'),pop=el('popover'),bkd=el('popoverBackdrop');
  if(ctx)ctx.textContent=row.day+' — '+COL_NAMES[c];
  if(inp)inp.value=row.labels[c]||'';
  buildColorGrid();
  if(pop)pop.hidden=false;if(bkd)bkd.hidden=false;
  setTimeout(function(){if(inp)inp.focus();},150);
}
function closePopover(){
  var pop=el('popover'),bkd=el('popoverBackdrop');
  if(pop)pop.hidden=true;if(bkd)bkd.hidden=true;editTarget=null;
}
function buildColorGrid(){
  var grid=el('colorGrid');if(!grid)return;
  var html='';
  COLORS.forEach(function(co){html+='<div class="color-opt'+(co.cls===selectedCls?' sel':'')+'" style="background:'+co.bg+'" data-cls="'+co.cls+'" tabindex="0" role="button"></div>';});
  grid.innerHTML=html;
  grid.onclick=function(e){var opt=e.target.closest('[data-cls]');if(opt){selectedCls=opt.getAttribute('data-cls');buildColorGrid();}};
}
function applyEdit(){
  if(!editTarget)return;
  var inp=el('popoverInput'),lbl=inp?inp.value.trim():'';
  if(!lbl){showToast('Enter a subject name');return;}
  timetable[editTarget.r].labels[editTarget.c]=lbl;
  timetable[editTarget.r].cols[editTarget.c]=selectedCls;
  buildTable();closePopover();showToast('Updated — tap Save to keep');
}
function clearCell(){
  if(!editTarget)return;
  timetable[editTarget.r].labels[editTarget.c]='—';
  timetable[editTarget.r].cols[editTarget.c]='c-empty';
  buildTable();closePopover();showToast('Cleared — tap Save to keep');
}
window.closePopover=closePopover;window.applyEdit=applyEdit;window.clearCell=clearCell;

/* ══════ EXPORT / IMPORT ══════ */
function exportData(){
  var payload=JSON.stringify({timetable:timetable,progress:progress,papers:sGet('ksl_papers',{}),orals:sGet('ksl_orals',{})},null,2);
  try{
    var blob=new Blob([payload],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='ksl-study-backup.json';document.body.appendChild(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(url);document.body.removeChild(a);},1000);
    showToast('✅ Exported! Send the file to your other device.');
  }catch(e){showToast('⚠️ Export failed');}
}
function triggerImport(){var f=el('importFile')||el('importFile2');if(f){f.value='';f.click();}}
function importData(evt){
  var file=evt.target.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    try{
      var data=JSON.parse(e.target.result);
      if(!data.timetable||!Array.isArray(data.timetable))throw new Error('Bad format');
      timetable=data.timetable;progress=data.progress||{};
      if(data.papers)sSet('ksl_papers',data.papers);
      if(data.orals)sSet('ksl_orals',data.orals);
      sSet('ksl_tt',timetable);sSet('ksl_prog',progress);
      buildTable();buildTodayCard();buildHero();
      showToast('✅ Imported! Your data is synced.');
    }catch(err){showToast('⚠️ Import failed — bad file');}
  };
  reader.readAsText(file);
}
window.exportData=exportData;window.triggerImport=triggerImport;window.importData=importData;

/* ══════ TOAST ══════ */
function showToast(msg){
  var t=el('toast');if(!t)return;
  t.textContent=msg;t.className='toast show';
  clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.className='toast';},2600);
}

/* ══════ KEYBOARD ══════ */
document.addEventListener('keydown',function(e){
  if(e.key==='Escape')closePopover();
  if(e.key==='Enter'){var pop=el('popover');if(pop&&!pop.hidden&&editTarget)applyEdit();}
});

/* ══════ INIT ══════ */
(function init(){
  timetable=sGet('ksl_tt',null)||JSON.parse(JSON.stringify(DEFAULT_TIMETABLE));
  progress=sGet('ksl_prog',{});
  showOnboarding();
  startCountdown('2026-07-20T08:00:00+03:00','oralTimer','oralBar','2026-01-01T00:00:00+03:00');
  startCountdown('2026-11-01T08:00:00+03:00','mainTimer','mainBar','2026-01-01T00:00:00+03:00');
  buildHero();buildTodayCard();buildQuote();buildTable();
})();
