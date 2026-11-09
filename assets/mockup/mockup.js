(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const number = (value,digits=3) => new Intl.NumberFormat('pt-BR',{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
  const state = {batch:24,lower:9.9,upper:10.1,confidence:95,fit:true,limits:true,grid:true,view:'histogram',analysis:'capability',theme:'light'};
  const media = matchMedia('(prefers-color-scheme: dark)');
  const escapeXml = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  function sample(seed) {
    let x=seed; const random=()=>{x=(Math.imul(1664525,x)+1013904223)>>>0;return(x+1)/4294967297};
    return Array.from({length:200},()=>10+(seed===24?.003:.018)+(seed===24?.021:.029)*Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random()));
  }
  const batches = {24:sample(24),25:sample(25)};
  function stats() {
    const data=batches[state.batch],sorted=[...data].sort((a,b)=>a-b),n=data.length,mean=data.reduce((a,b)=>a+b,0)/n;
    const sd=Math.sqrt(data.reduce((sum,x)=>sum+(x-mean)**2,0)/(n-1));
    const quantile=p=>{const pos=(n-1)*p,i=Math.floor(pos);return sorted[i]+(sorted[Math.min(i+1,n-1)]-sorted[i])*(pos-i)};
    return {data,sorted,n,mean,sd,cp:(state.upper-state.lower)/(6*sd),cpk:Math.min(state.upper-mean,mean-state.lower)/(3*sd),quantile};
  }
  // Standard normal inverse CDF, used only for the illustrative mean interval.
  function normalQuantile(p) {
    let low=-8,high=8;
    const cdf=x=>{const t=1/(1+.2316419*Math.abs(x)),d=.3989422804014327*Math.exp(-x*x/2),q=d*t*(.31938153+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return x>=0?1-q:q};
    for(let i=0;i<55;i++){const mid=(low+high)/2;if(cdf(mid)<p)low=mid;else high=mid}return(low+high)/2;
  }
  function updateTheme(theme) {
    state.theme=theme; const dark=theme==='system'?media.matches:theme==='dark';document.documentElement.dataset.theme=dark?'dark':'light';
    document.querySelectorAll('#themeMenu [data-theme]').forEach(button=>button.setAttribute('aria-checked',String(button.dataset.theme===theme)));
    $('themeToggle').querySelector('use').setAttribute('href',dark?'assets/ui/icons.svg#i-moon':'assets/ui/icons.svg#i-sun');
  }
  media.addEventListener('change',()=>{if(state.theme==='system')updateTheme('system')});
  document.querySelectorAll('#themeMenu [data-theme]').forEach(button=>button.addEventListener('click',()=>updateTheme(button.dataset.theme)));
  function renderChart(s) {
    const seriesStyle=SCCharts.series(0);
    const W=Math.max(280,Math.round($('chart').getBoundingClientRect().width)),H=W<500?260:330,L=43,R=14,T=35,B=39,plotW=W-L-R,plotH=H-T-B;
    $('chart').setAttribute('viewBox',`0 0 ${W} ${H}`);
    const low=Math.min(state.lower,s.sorted[0],s.mean-4*s.sd),high=Math.max(state.upper,s.sorted.at(-1),s.mean+4*s.sd),pad=(high-low)*.1,xmin=low-pad,xmax=high+pad;
    const x=v=>L+(v-xmin)/(xmax-xmin)*plotW;let parts=[];
    parts.push('<title id="chartTitle">'+(state.view==='histogram'?'Distribuição das medições':'Sequência das medições')+'</title><desc id="chartDesc">Amostra sintética de '+s.n+' observações em milímetros. Média '+escapeXml(number(s.mean))+', desvio padrão '+escapeXml(number(s.sd))+'. Limites de especificação: '+escapeXml(number(state.lower))+' e '+escapeXml(number(state.upper))+'. Os dados completos estão disponíveis no botão Ver medições.</desc>');
    if(state.view==='histogram') {
      const count=18,binWidth=(xmax-xmin)/count,bins=Array(count).fill(0);s.data.forEach(v=>bins[Math.min(count-1,Math.max(0,Math.floor((v-xmin)/binWidth)))]++);
      const peak=s.n*binWidth/(s.sd*Math.sqrt(2*Math.PI)),ymax=Math.ceil(Math.max(...bins,peak)*1.12/20)*20,y=v=>T+plotH-v/ymax*plotH;
      for(let i=0;i<=4;i++){const v=ymax*i/4,py=y(v);if(state.grid)parts.push(`<line class="grid-line" x1="${L}" x2="${W-R}" y1="${py}" y2="${py}"/>`);parts.push(`<text x="${L-12}" y="${py+4}" text-anchor="end">${number(v,0)}</text>`)}
      parts.push('<text x="0" y="13">Frequência</text>');
      bins.forEach((n,i)=>{const a=xmin+i*binWidth,b=a+binWidth;parts.push(`<rect class="bar" x="${x(a)+1}" y="${y(n)}" width="${Math.max(0,x(b)-x(a)-2)}" height="${T+plotH-y(n)}" rx="1.5" data-tooltip="${escapeXml(number(a)+'–'+number(b)+' mm|'+n+' observações')}"><title>${escapeXml(number(a)+' a '+number(b)+' mm: '+n+' observações')}</title></rect>`)});
      if(state.fit){let path='';for(let i=0;i<=160;i++){const v=xmin+(xmax-xmin)*i/160,density=s.n*binWidth/(s.sd*Math.sqrt(2*Math.PI))*Math.exp(-.5*((v-s.mean)/s.sd)**2);path+=(i?'L':'M')+x(v).toFixed(2)+' '+y(density).toFixed(2)}parts.push(`<path class="fit-line" d="${path}"/>`)}
      if(state.limits)[[state.lower,'LIE'],[state.upper,'LSE']].forEach(([v,label])=>parts.push(`<line class="spec-line" x1="${x(v)}" x2="${x(v)}" y1="${T-6}" y2="${T+plotH}"/><text class="spec-text" x="${x(v)}" y="${T-14}" text-anchor="middle">${label} ${number(v)}</text>`));
      parts.push(`<line class="mean-line" x1="${x(s.mean)}" x2="${x(s.mean)}" y1="${T}" y2="${T+plotH}"/>`);
      for(let i=0;i<=4;i++){const v=xmin+(xmax-xmin)*i/4;parts.push(`<text x="${x(v)}" y="${H-18}" text-anchor="middle">${number(v,2)}</text>`)}parts.push(`<text x="${W-R}" y="${H-1}" text-anchor="end">Diâmetro (mm)</text>`);
    } else {
      const px=i=>L+i/(s.n-1)*plotW,y=v=>T+plotH-(v-xmin)/(xmax-xmin)*plotH;
      for(let i=0;i<=4;i++){const v=xmin+(xmax-xmin)*i/4;if(state.grid)parts.push(`<line class="grid-line" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/>`);parts.push(`<text x="${L-8}" y="${y(v)+4}" text-anchor="end">${number(v,2)}</text>`)}
      if(state.limits)[[state.lower,'LIE'],[state.upper,'LSE']].forEach(([v,label])=>parts.push(`<line class="spec-line" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="spec-text" x="${W-R}" y="${y(v)-7}" text-anchor="end">${label} ${number(v)}</text>`));
      parts.push(`<path class="sequence" d="${s.data.map((v,i)=>(i?'L':'M')+px(i).toFixed(2)+' '+y(v).toFixed(2)).join(' ')}"/>`);
      s.data.forEach((v,i)=>parts.push(`<circle class="point" cx="${px(i)}" cy="${y(v)}" r="${seriesStyle.size/2}" data-tooltip="Observação ${i+1}|${escapeXml(number(v))} mm"><title>Observação ${i+1}: ${escapeXml(number(v))} mm</title></circle>`));
      parts.push(`<line class="mean-line" x1="${L}" x2="${W-R}" y1="${y(s.mean)}" y2="${y(s.mean)}"/>`);
      [0,49,99,149,199].forEach(i=>parts.push(`<text x="${px(i)}" y="${H-18}" text-anchor="middle">${i+1}</text>`));parts.push(`<text x="${W-R}" y="${H-1}" text-anchor="end">Ordem da observação</text>`);
    }
    $('chart').innerHTML=parts.join('');$('plotTooltip').hidden=true;
    $('plotTitle').textContent=state.view==='histogram'?'Distribuição das medições':'Sequência das medições';$('plotSubtitle').textContent=s.n+' observações'+(state.fit&&state.view==='histogram'?' · Ajuste normal':'');
    $('legendData').textContent=state.view==='histogram'?'Frequência observada':'Medições individuais';$('fitLegend').hidden=!(state.fit&&state.view==='histogram');$('specLegend').hidden=!state.limits;
  }
  function render() {
    const s=stats();$('metricCpk').textContent=number(s.cpk,2);$('metricCp').textContent=number(s.cp,2);$('metricMean').textContent=number(s.mean);$('metricStd').textContent=number(s.sd);
    [['statMin',0],['statQ1',.25],['statMedian',.5],['statQ3',.75],['statMax',1]].forEach(([id,p])=>$(id).textContent=number(s.quantile(p)));
    const capable=s.cpk>=1.33;$('resultTitle').textContent=capable?'Cpk atende à referência de 1,33':'Cpk abaixo da referência de 1,33';$('resultIcon').style.color=capable?'var(--sc-success)':'var(--sc-warning)';$('resultIcon').querySelector('use').setAttribute('href',capable?'assets/ui/icons.svg#i-circle-check':'assets/ui/icons.svg#i-warning');
    const z=normalQuantile(.5+state.confidence/200),margin=z*s.sd/Math.sqrt(s.n);$('resultDescription').textContent='IC aproximado da média ('+number(state.confidence,state.confidence%1?1:0)+'%): '+number(s.mean-margin)+' a '+number(s.mean+margin)+' mm. Modelo normal assumido.';
    const batch='Lote 0'+state.batch;$('documentSubtitle').textContent=batch+' · Dados de exemplo';$('sidebarBatch').textContent=batch;$('batchValue').textContent=batch;
    $('pageTitle').textContent=state.analysis==='capability'?'Capabilidade do processo':state.analysis==='distribution'?'Distribuição das medições':'Controle estatístico';
    $('pageDescription').textContent=state.analysis==='sequence'?'Sequência individual · Limites de especificação':state.analysis==='distribution'?'Histograma · Modelo normal':'Amostra individual · Limites bilaterais';
    document.querySelectorAll('[data-batch]').forEach(b=>b.setAttribute('aria-selected',String(Number(b.dataset.batch)===state.batch)));
    document.querySelectorAll('[data-analysis]').forEach(b=>{if(b.dataset.analysis===state.analysis)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));renderChart(s);SCUI.refreshSelections();
  }
  const mobileLayout=matchMedia('(max-width:700px)');
  function setSidebar(open) {
    document.body.classList.toggle('nav-open',open);
    $('sidebarToggle').setAttribute('aria-expanded',String(open));
    $('sidebarToggle').setAttribute('aria-label',open?'Fechar navegação':'Abrir navegação');
    $('sidebar').inert=mobileLayout.matches&&!open;
    $('workspace').inert=open;$('parameters').inert=open;
    document.querySelector('.toolbar-actions').inert=open;
  }
  function closeSidebar() {setSidebar(false)}
  mobileLayout.addEventListener('change',closeSidebar);closeSidebar();
  document.querySelectorAll('[data-analysis]').forEach(button=>button.addEventListener('click',()=>{state.analysis=button.dataset.analysis;state.view=state.analysis==='sequence'?'sequence':'histogram';render();const wasOpen=document.body.classList.contains('nav-open');closeSidebar();if(wasOpen)$('pageTitle').focus({preventScroll:true})}));
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{state.view=button.dataset.view;render()}));
  document.querySelectorAll('[data-batch]').forEach(button=>button.addEventListener('click',()=>{state.batch=Number(button.dataset.batch);render()}));
  $('sidebarToggle').addEventListener('click',()=>{const open=!document.body.classList.contains('nav-open');setSidebar(open);if(open)$('sidebar').querySelector('[aria-current]').focus()});$('navScrim').addEventListener('click',()=>{closeSidebar();$('sidebarToggle').focus()});
  document.addEventListener('keydown',event=>{
    if(!document.body.classList.contains('nav-open'))return;
    if(event.key==='Escape'){closeSidebar();$('sidebarToggle').focus()}
    if(event.key==='Tab'){event.preventDefault();const controls=[$('sidebarToggle'),...$('sidebar').querySelectorAll('button')],i=controls.indexOf(document.activeElement);controls[(i+(event.shiftKey?-1:1)+controls.length)%controls.length].focus()}
  });
  $('showParameters').addEventListener('click',()=>{$('parameters').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});$('batchButton').focus({preventScroll:true})});
  const markDirty=()=>{$('applyStatus').textContent='Modificações por aplicar'};
  function syncConfidence(value) { $('confidence').value=value;$('confidenceNumber').value=value;$('confidence').style.setProperty('--fill',((Number(value)-80)/19.9*100)+'%');$('confidence').setAttribute('aria-valuetext',number(Number(value),Number(value)%1?1:0)+' por cento') }
  $('confidence').addEventListener('input',event=>{syncConfidence(event.target.value);markDirty()});$('confidenceNumber').addEventListener('input',event=>{const v=Number(event.target.value);if(v>=80&&v<=99.9){$('confidence').value=v;$('confidence').style.setProperty('--fill',((v-80)/19.9*100)+'%');$('confidence').setAttribute('aria-valuetext',number(v,v%1?1:0)+' por cento')}markDirty()});
  ['lowerLimit','upperLimit'].forEach(id=>$(id).addEventListener('input',markDirty));
  $('parameters').addEventListener('submit',event=>{event.preventDefault();const lo=Number($('lowerLimit').value.replace(',','.')),hi=Number($('upperLimit').value.replace(',','.')),confidence=Number($('confidenceNumber').value),empty=!$('lowerLimit').value.trim()||!$('upperLimit').value.trim(),invalid=empty||!Number.isFinite(lo)||!Number.isFinite(hi)||lo>=hi;
    ['lowerLimit','upperLimit'].forEach(id=>$(id).setAttribute('aria-invalid',String(invalid)));$('confidenceNumber').setAttribute('aria-invalid',String(!(confidence>=80&&confidence<=99.9)));
    if(invalid||!(confidence>=80&&confidence<=99.9)){$('limitError').hidden=false;$('limitError').textContent=invalid?'Informe limites válidos: o inferior deve ser menor que o superior.':'A confiança deve estar entre 80% e 99,9%.';(invalid?$('lowerLimit'):$('confidenceNumber')).focus();return}
    $('limitError').hidden=true;state.lower=lo;state.upper=hi;state.confidence=confidence;syncConfidence(confidence);render();$('applyStatus').textContent='Parâmetros aplicados';
  });
  [['fitSwitch','fit'],['limitsSwitch','limits']].forEach(([id,key])=>$(id).addEventListener('click',()=>{state[key]=!state[key];$(id).setAttribute('aria-checked',String(state[key]));render()}));
  $('resetParameters').addEventListener('click',()=>{state.lower=9.9;state.upper=10.1;state.confidence=95;state.fit=true;state.limits=true;syncConfidence(95);$('lowerLimit').value='9,900';$('upperLimit').value='10,100';['lowerLimit','upperLimit','confidenceNumber'].forEach(id=>$(id).removeAttribute('aria-invalid'));$('limitError').hidden=true;$('fitSwitch').setAttribute('aria-checked','true');$('limitsSwitch').setAttribute('aria-checked','true');render();$('applyStatus').textContent='Parâmetros restaurados'});
  $('gridToggle').addEventListener('click',()=>{state.grid=!state.grid;$('gridToggle').setAttribute('aria-checked',String(state.grid));renderChart(stats())});
  function openData() {const data=batches[state.batch];$('dataTitle').textContent='Medições · Lote 0'+state.batch;$('dataRows').innerHTML=data.map((x,i)=>'<tr><td>'+String(i+1).padStart(3,'0')+'</td><td>'+number(x)+'</td></tr>').join('');$('dataDialog').showModal();closeSidebar()}
  $('viewData').addEventListener('click',openData);$('openData').addEventListener('click',openData);$('closeData').addEventListener('click',()=>$('dataDialog').close());$('dataDialog').addEventListener('click',event=>{if(event.target===$('dataDialog')){const r=$('dataDialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('dataDialog').close()}});
  let toastTimer;function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3500)}
  function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Arquivo exportado')}
  $('exportCsv').addEventListener('click',()=>download('\ufeffObservação;Diâmetro (mm)\r\n'+batches[state.batch].map((x,i)=>(i+1)+';'+number(x,6)).join('\r\n'),'text/csv;charset=utf-8','statistics-center-lote-0'+state.batch+'.csv'));
  let exportFont;
  async function embeddedFont() {
    if(!exportFont)exportFont=Promise.all([
      fetch('assets/fonts/arimo/Arimo-Variable.ttf').then(r=>{if(!r.ok)throw Error('Font unavailable');return r.arrayBuffer()}),
      fetch('assets/fonts/arimo/OFL.txt').then(r=>{if(!r.ok)throw Error('License unavailable');return r.text()})
    ]).then(([buffer,license])=>({base64:btoa(new Uint8Array(buffer).reduce((text,byte)=>text+String.fromCharCode(byte),'')),license})).catch(error=>{exportFont=null;throw error});
    return exportFont;
  }
  $('exportSvg').addEventListener('click',async()=>{
    const clone=$('chart').cloneNode(true),styles=getComputedStyle(document.documentElement),originals=$('chart').querySelectorAll('*');
    clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width',String($('chart').viewBox.baseVal.width*2));clone.setAttribute('height',String($('chart').viewBox.baseVal.height*2));clone.style.background=styles.getPropertyValue('--sc-bg-primary');
    const properties=['fill','stroke','stroke-width','stroke-dasharray','font-family','font-size','font-weight'];
    clone.querySelectorAll('*').forEach((node,i)=>{const computed=getComputedStyle(originals[i]);properties.forEach(p=>node.style.setProperty(p,computed.getPropertyValue(p)))});
    try {
      const {base64,license}=await embeddedFont(),ns='http://www.w3.org/2000/svg',style=document.createElementNS(ns,'style'),metadata=document.createElementNS(ns,'metadata');
      style.textContent="@font-face{font-family:'Arimo';font-style:normal;font-weight:400 700;src:url(data:font/ttf;base64,"+base64+") format('truetype')}";
      metadata.textContent=license;clone.prepend(metadata,style);
      download(new XMLSerializer().serializeToString(clone),'image/svg+xml;charset=utf-8','statistics-center-grafico.svg');
    } catch {toast('Não foi possível carregar a fonte para exportar o gráfico. Abra esta prévia pelo servidor local.')}
  });
  $('chart').addEventListener('pointermove',event=>{const target=event.target.closest('[data-tooltip]'),tooltip=$('plotTooltip');if(!target){tooltip.hidden=true;return}const [title,value]=target.dataset.tooltip.split('|');tooltip.replaceChildren();const strong=document.createElement('strong');strong.textContent=title;tooltip.append(strong,document.createTextNode(value));tooltip.hidden=false;const rect=$('chart').getBoundingClientRect();tooltip.style.left=Math.max(0,Math.min(rect.width-tooltip.offsetWidth,event.clientX-rect.left+12))+'px';tooltip.style.top=Math.max(0,event.clientY-rect.top-tooltip.offsetHeight-12)+'px'});$('chart').addEventListener('pointerleave',()=>$('plotTooltip').hidden=true);
  let chartWidth=0;
  const plotObserver=new ResizeObserver(([entry])=>{const width=Math.round(entry.contentRect.width);if(width!==chartWidth){chartWidth=width;renderChart(stats())}});
  plotObserver.observe(document.querySelector('.plot-wrapper'));
  syncConfidence(95);updateTheme('light');render();
})();
