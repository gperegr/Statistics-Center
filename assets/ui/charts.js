/* Renderer-independent chart styles plus a Plotly adapter (Plotly is optional). */
(() => {
  'use strict';
  const read=()=>getComputedStyle(document.documentElement);
  const token=(name,styles)=>styles.getPropertyValue('--sc-'+name).trim();
  function palette(){const styles=read();return Array.from({length:8},(_,i)=>token('chart-series-'+(i+1),styles))}
  function series(index=0){
    if(!Number.isInteger(index)||index<0)throw new RangeError('Series index must be a nonnegative integer');
    const styles=read(),colors=palette(),cycle=Math.floor(index/colors.length);
    return {color:colors[index%colors.length],width:Number(token('chart-line-data',styles)),dash:['solid','dash','dot','dashdot'][cycle%4],symbol:['circle','square','diamond','triangle-up','cross','x','triangle-down','star'][index%8],size:Number(token('chart-marker-size',styles))};
  }
  function plotlyLayout(overrides={}) {
    const styles=read(),axis={gridcolor:token('border',styles),gridwidth:Number(token('chart-line-grid',styles)),zeroline:false,linecolor:token('border-strong',styles),tickfont:{family:token('font-family',styles),size:11,color:token('text-secondary',styles)}};
    return {colorway:palette(),paper_bgcolor:token('bg-primary',styles),plot_bgcolor:token('bg-primary',styles),font:{family:token('font-family',styles),size:12,color:token('text',styles)},xaxis:{...axis,...overrides.xaxis},yaxis:{...axis,...overrides.yaxis},...Object.fromEntries(Object.entries(overrides).filter(([key])=>!['xaxis','yaxis'].includes(key)))};
  }
  function plotlyTrace(index=0){const style=series(index);return {line:{color:style.color,width:style.width,dash:style.dash},marker:{color:style.color,size:style.size,symbol:style.symbol}}}
  function svgMarker(index,x,y) {
    if(!Number.isFinite(x)||!Number.isFinite(y))throw new TypeError('Marker coordinates must be finite');
    const style=series(index),r=style.size/2,ns='http://www.w3.org/2000/svg';
    const node=document.createElementNS(ns,index%8===0?'circle':index%8===1?'rect':'path');
    if(index%8===0){node.setAttribute('cx',x);node.setAttribute('cy',y);node.setAttribute('r',r)}
    else if(index%8===1){node.setAttribute('x',x-r);node.setAttribute('y',y-r);node.setAttribute('width',r*2);node.setAttribute('height',r*2)}
    else {
      const shapes={2:`M${x} ${y-r}l${r} ${r} -${r} ${r} -${r} -${r}Z`,3:`M${x} ${y-r}l${r} ${r*2}h-${r*2}Z`,4:`M${x-r} ${y}h${r*2}M${x} ${y-r}v${r*2}`,5:`M${x-r} ${y-r}l${r*2} ${r*2}M${x-r} ${y+r}l${r*2} -${r*2}`,6:`M${x-r} ${y-r}h${r*2}l-${r} ${r*2}Z`};
      const star=Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,rad=i%2?r*.45:r;return(i?'L':'M')+(x+Math.cos(a)*rad)+' '+(y+Math.sin(a)*rad)}).join(' ')+'Z';
      node.setAttribute('d',shapes[index%8]||star);
    }
    node.setAttribute('fill',index%8===4||index%8===5?'none':style.color);node.setAttribute('stroke',style.color);node.setAttribute('stroke-width','1.25');return node;
  }
  window.SCCharts=Object.freeze({palette,series,plotlyLayout,plotlyTrace,svgMarker});
})();
