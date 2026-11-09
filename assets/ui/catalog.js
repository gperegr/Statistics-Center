(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  function renderChartStandards() {
    $('chartPalette').replaceChildren();
    SCCharts.palette().forEach((color,index)=>{
      const swatch=document.createElement('div');swatch.className='swatch';
      const chip=document.createElement('i');chip.style.background=color;chip.setAttribute('aria-hidden','true');
      const label=document.createElement('span');label.textContent='Série '+(index+1);
      const value=document.createElement('code');value.textContent=color;label.append(value);swatch.append(chip,label);$('chartPalette').append(swatch);
    });
    const svg=$('seriesPreview'),ns='http://www.w3.org/2000/svg',width=Math.max(280,Math.round(svg.clientWidth)),columns=width<500?1:2;svg.setAttribute('viewBox',`0 0 ${width} ${columns===1?350:180}`);svg.querySelectorAll('g').forEach(node=>node.remove());
    for(let i=0;i<8;i++) {
      const style=SCCharts.series(i),g=document.createElementNS(ns,'g'),left=16+(i%columns)*(width/columns),y=20+Math.floor(i/columns)*43;
      const line=document.createElementNS(ns,'path');line.setAttribute('d',`M${left} ${y+9}l20 -8 20 5 20 -7 20 7`);line.setAttribute('fill','none');line.setAttribute('stroke',style.color);line.setAttribute('stroke-width',style.width);
      const dot=SCCharts.svgMarker(i,left+40,y+6);
      const text=document.createElementNS(ns,'text');text.setAttribute('x',left+100);text.setAttribute('y',y+10);text.textContent='Série '+(i+1)+' · '+style.symbol;g.append(line,dot,text);svg.append(g);
    }
  }
  $('catalogTheme').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('catalogTheme').setAttribute('aria-pressed',String(dark));$('catalogTheme').textContent=dark?'Tema claro':'Tema escuro';renderChartStandards()});
  document.querySelectorAll('[data-demo-toast]').forEach(button=>button.addEventListener('click',()=>SCUI.toast(button.dataset.demoToast)));
  $('mixedCheckbox').indeterminate=true;
  const range=$('confidenceExample'),exact=$('exactConfidence');
  range.addEventListener('input',()=>exact.value=range.value);
  exact.addEventListener('input',()=>{const n=Number(exact.value);if(exact.value&&n>=80&&n<=99.9){range.value=n;SCUI.updateSlider(range);exact.setAttribute('aria-invalid','false')}else exact.setAttribute('aria-invalid','true')});
  document.querySelector('#sampleDropdown').addEventListener('click',event=>{const item=event.target.closest('[role=option]');if(item)$('dropdownStatus').textContent='Amostra selecionada: '+item.dataset.value});
  $('demoListbox').addEventListener('click',event=>{const item=event.target.closest('[role=option]');if(item)item.setAttribute('aria-selected',String(item.getAttribute('aria-selected')!=='true'))});
  $('demoListbox').addEventListener('keydown',event=>{const items=[...$('demoListbox').querySelectorAll('[role=option]')],index=items.indexOf(document.activeElement);if(event.key===' '){event.preventDefault();if(index>=0)items[index].setAttribute('aria-selected',String(items[index].getAttribute('aria-selected')!=='true'))}else if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?items.length-1:Math.max(0,Math.min(items.length-1,index+(event.key==='ArrowDown'?1:-1)));items.forEach((item,i)=>item.tabIndex=i===next?0:-1);items[next].focus()}});
  document.querySelector('[data-sc-segmented]').addEventListener('sc:change',event=>$('segmentStatus').textContent=event.detail.value==='histogram'?'Distribuição selecionada':'Sequência selecionada');
  [0,4,8,12,16,20,24,32,40,48].forEach((value,index)=>{const sample=document.createElement('div');sample.className='space-sample';const bar=document.createElement('i');bar.style.width=Math.max(1,value)+'px';sample.append(bar,document.createTextNode(index+' · '+value+' px'));$('spacingSamples').append(sample)});
  window.addEventListener('resize',renderChartStandards);
  renderChartStandards();
})();
