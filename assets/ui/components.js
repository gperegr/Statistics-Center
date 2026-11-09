/* Reusable behavior. Data attributes opt in; application state stays in the caller. */
(() => {
  'use strict';
  const initialized = new WeakSet();
  const toastTimers = new WeakMap();
  const indicators = new Set();
  const popupControllers = new Map();
  let selectSequence=0;
  const emit = (element, name, detail) => element.dispatchEvent(new CustomEvent(name, {bubbles:true, detail}));
  const all = (root, selector) => [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
  function refreshSelections() {
    for (const group of indicators) {
      if (!group.isConnected) { indicators.delete(group); continue; }
      const selected = group.querySelector('[aria-current="page"],[aria-pressed="true"]');
      const indicator = group.querySelector('.sc-selection-indicator');
      if (!selected || !indicator) continue;
      const first = !indicator.dataset.ready;
      if (first) indicator.style.transition = 'none';
      indicator.style.width = selected.offsetWidth + 'px';
      indicator.style.height = selected.offsetHeight + 'px';
      indicator.style.transform = `translate(${selected.offsetLeft}px,${selected.offsetTop}px)`;
      if (first) { void indicator.offsetWidth; indicator.style.transition = ''; indicator.dataset.ready = 'true'; }
    }
  }
  const resizeObserver = new ResizeObserver(refreshSelections);
  function bindPopup(button) {
    const popup = document.getElementById(button.dataset.scPopover);
    if (!popup) return;
    if (popupControllers.has(popup)) throw new Error('Each popup must have a unique trigger: ' + popup.id);
    const options = () => [...popup.querySelectorAll('button:not(:disabled)')];
    const isOpen = () => popup.matches(':popover-open');
    const position = () => {
      const r = button.getBoundingClientRect();
      if (popup.getAttribute('role') === 'listbox') popup.style.minWidth = r.width + 'px';
      popup.style.left = Math.max(12, Math.min(innerWidth-popup.offsetWidth-12, r.right-popup.offsetWidth)) + 'px';
      popup.style.top = (r.bottom+popup.offsetHeight+14 > innerHeight ? Math.max(12,r.top-popup.offsetHeight-8) : r.bottom+8) + 'px';
    };
    const close = (restoreFocus=true) => { if (isOpen()) popup.hidePopover(); button.setAttribute('aria-expanded','false'); if(restoreFocus) button.focus(); };
    const open = () => {
      popup.showPopover(); position(); button.setAttribute('aria-expanded','true');
      (options().find(item=>item.matches('[aria-selected="true"],[aria-checked="true"]')) || options()[0])?.focus();
    };
    button.setAttribute('aria-controls',popup.id);
    button.setAttribute('aria-expanded','false');
    button.addEventListener('click', () => isOpen() ? close() : open());
    button.addEventListener('keydown', event => { if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();open();if(event.key==='ArrowUp')options().at(-1)?.focus();} });
    popup.addEventListener('toggle', () => button.setAttribute('aria-expanded',String(isOpen())));
    let search='', searchTimer;
    popup.addEventListener('keydown', event => {
      const items=options(),index=items.indexOf(document.activeElement);
      if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
        event.preventDefault();
        const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
        items[next]?.focus();
      } else if(event.key==='Escape'){event.preventDefault();close();}
      else if(event.key==='Tab'){
        event.preventDefault();close(false);
        const controls=[...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(item=>!item.disabled&&item.tabIndex>=0&&!item.closest('[inert]')&&item.getClientRects().length);
        const index=controls.indexOf(button);controls[(index+(event.shiftKey?-1:1)+controls.length)%controls.length]?.focus();
      }
      else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&event.key!==' ') {
        clearTimeout(searchTimer);search+=event.key.toLocaleLowerCase();searchTimer=setTimeout(()=>search='',650);
        items.find(item=>item.textContent.trim().toLocaleLowerCase().startsWith(search))?.focus();
      }
    });
    popup.addEventListener('click', event => {
      const item=event.target.closest('button');if(!item||item.disabled)return;
      // Selection state is automatic only when explicitly opted in.
      if(popup.hasAttribute('data-sc-select')) {
        popup.querySelectorAll('[role="option"]').forEach(option=>option.setAttribute('aria-selected',String(option===item)));
        const label=document.getElementById(button.dataset.scValueTarget);
        if(label)label.textContent=item.dataset.label || item.textContent.trim();
        emit(button,'sc:select',{value:item.dataset.value,label:item.dataset.label||item.textContent.trim()});
      }
      close();
    });
    popupControllers.set(popup,{button,position,isOpen});
  }
  function updateSlider(slider) {
    const min=Number(slider.min || 0),max=Number(slider.max || 100),value=Number(slider.value);
    slider.style.setProperty('--fill',Math.max(0,Math.min(100,(value-min)/(max-min || 1)*100))+'%');
    const output=document.getElementById(slider.dataset.scOutput);
    if(output)output.textContent=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:4}).format(value)+(slider.dataset.scUnit || '');
  }
  function syncNativeSelect(select) {
    const host=select.closest('.sc-native-select-host'),menu=host&&document.getElementById(select.dataset.scMenuId);
    if(!menu)return;
    const label=select.selectedOptions[0]?.textContent.trim()||select.getAttribute('aria-label')||'Selecionar';
    const value=document.getElementById(select.dataset.scValueId);if(value)value.textContent=label;
    menu.replaceChildren();
    for(const option of select.options){
      const item=document.createElement('button');item.type='button';item.className='sc-menu__item';item.setAttribute('role','option');
      item.dataset.value=option.value;item.dataset.label=option.textContent.trim();item.setAttribute('aria-selected',String(option.selected));
      if(option.disabled){item.disabled=true;item.setAttribute('aria-disabled','true')}
      item.append(document.createTextNode(option.textContent.trim()));
      if(option.selected){const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.classList.add('sc-icon','sc-menu__check');icon.setAttribute('aria-hidden','true');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','assets/ui/icons.svg#i-check');icon.append(use);item.append(icon)}
      menu.append(item);
    }
    const trigger=host.querySelector('.sc-native-select-trigger');if(trigger)trigger.disabled=select.disabled;
  }
  function decorateNativeSelect(select){
    if(initialized.has(select)||select.multiple||select.size>1)return;
    initialized.add(select);const id='sc-native-select-'+(++selectSequence),host=document.createElement('div');host.className='sc-native-select-host';
    const trigger=document.createElement('button');trigger.type='button';trigger.className='sc-button sc-button--secondary sc-dropdown sc-native-select-trigger';trigger.id=id+'-trigger';trigger.dataset.scPopover=id+'-menu';trigger.dataset.scValueTarget=id+'-value';trigger.setAttribute('aria-haspopup','listbox');
    if(select.style.width){host.style.width=select.style.width;host.style.flex='0 0 '+select.style.width;}
    if(select.hasAttribute('data-i18n-tooltip'))trigger.setAttribute('data-i18n-tooltip',select.getAttribute('data-i18n-tooltip'));
    if(select.title)trigger.title=select.title;
    const value=document.createElement('span');value.id=id+'-value';trigger.append(value);
    const chevron=document.createElementNS('http://www.w3.org/2000/svg','svg');chevron.classList.add('sc-icon','sc-icon--small');chevron.setAttribute('aria-hidden','true');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','assets/ui/icons.svg#i-chevron');chevron.append(use);trigger.append(chevron);
    const menu=document.createElement('div');menu.className='sc-menu';menu.id=id+'-menu';menu.setAttribute('popover','');menu.setAttribute('role','listbox');menu.setAttribute('aria-label',select.labels?.[0]?.textContent.trim()||select.getAttribute('aria-label')||'Opções');menu.dataset.scSelect='';
    const label=select.labels?.[0];if(label){if(!label.id)label.id=id+'-label';trigger.setAttribute('aria-labelledby',label.id+' '+value.id);label.htmlFor=trigger.id;}else{trigger.setAttribute('aria-label',select.getAttribute('aria-label')||select.title||'Selecionar opção');trigger.setAttribute('aria-labelledby',value.id)}
    if(select.getAttribute('aria-describedby'))trigger.setAttribute('aria-describedby',select.getAttribute('aria-describedby'));
    select.dataset.scMenuId=menu.id;select.dataset.scValueId=value.id;select.classList.add('sc-native-select-source');select.setAttribute('aria-hidden','true');select.tabIndex=-1;
    const enclosingLabel=select.closest('label');(enclosingLabel||select).after(host);host.append(select,trigger);document.body.append(menu);initialized.add(trigger);bindPopup(trigger);
    trigger.addEventListener('sc:select',event=>{select.value=String(event.detail.value??'');select.dispatchEvent(new Event('change',{bubbles:true}));syncNativeSelect(select)});
    trigger.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();trigger.click()}});
    const observer=new MutationObserver(()=>syncNativeSelect(select));observer.observe(select,{childList:true,subtree:true,attributes:true,characterData:true});syncNativeSelect(select);
  }
  function decorateSelects(root=document){all(root,'select:not([multiple])').forEach(decorateNativeSelect)}
  function refreshNativeSelects(){document.querySelectorAll('select.sc-native-select-source').forEach(syncNativeSelect)}
  document.addEventListener('reset',()=>setTimeout(refreshNativeSelects,0),true);
  const dynamicSelectObserver=new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes)if(node.nodeType===Node.ELEMENT_NODE)decorateSelects(node);
  });
  function init(root=document) {
    all(root,'.sc-nav,.sc-segmented').forEach(group=>{
      if(initialized.has(group))return;initialized.add(group);indicators.add(group);resizeObserver.observe(group);
      if(group.hasAttribute('data-sc-segmented')) {
        const buttons=()=>[...group.querySelectorAll('button:not(:disabled)')];
        function choose(button){buttons().forEach(item=>item.setAttribute('aria-pressed',String(item===button)));refreshSelections();emit(group,'sc:change',{value:button.dataset.value});}
        group.addEventListener('click',event=>{const button=event.target.closest('button');if(button&&!button.disabled)choose(button)});
        group.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const items=buttons(),index=items.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowRight'?1:-1)+items.length)%items.length;items[next]?.focus();if(items[next])choose(items[next])});
      }
    });
    all(root,'[data-sc-popover]').forEach(button=>{if(initialized.has(button))return;initialized.add(button);bindPopup(button)});
    all(root,'[data-sc-slider]').forEach(slider=>{if(initialized.has(slider))return;initialized.add(slider);updateSlider(slider);slider.addEventListener('input',()=>updateSlider(slider));slider.form?.addEventListener('reset',()=>queueMicrotask(()=>updateSlider(slider)))});
    all(root,'[data-sc-switch]').forEach(button=>{if(initialized.has(button))return;initialized.add(button);button.addEventListener('click',()=>{const checked=button.getAttribute('aria-checked')!=='true';button.setAttribute('aria-checked',String(checked));emit(button,'sc:change',{checked})})});
    all(root,'[data-sc-dialog-open]').forEach(button=>{if(initialized.has(button))return;initialized.add(button);button.addEventListener('click',()=>document.getElementById(button.dataset.scDialogOpen)?.showModal())});
    all(root,'[data-sc-dialog-close]').forEach(button=>{if(initialized.has(button))return;initialized.add(button);button.addEventListener('click',()=>button.closest('dialog')?.close())});
    decorateSelects(root);
    if(!dynamicSelectObserverStarted&&document.documentElement){dynamicSelectObserver.observe(document.documentElement,{childList:true,subtree:true});dynamicSelectObserverStarted=true}
    refreshSelections();
  }
  let dynamicSelectObserverStarted=false;
  function toast(message,{element,duration=3500}={}) {
    if(!element){element=document.getElementById('scToast');if(!element){element=document.createElement('p');element.id='scToast';element.className='sc-toast';element.setAttribute('role','status');document.body.append(element)}}
    clearTimeout(toastTimers.get(element));element.textContent=message;element.hidden=false;
    toastTimers.set(element,setTimeout(()=>element.hidden=true,duration));
  }
  window.addEventListener('resize',()=>{for(const controller of popupControllers.values())if(controller.isOpen())controller.position()});
  document.addEventListener('click',event=>{if(event.target.closest('.sc-button[aria-disabled="true"]')){event.preventDefault();event.stopImmediatePropagation()}},true);
  window.SCUI=Object.freeze({init,refreshSelections,refreshNativeSelects,updateSlider,toast});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();
})();
