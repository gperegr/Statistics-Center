/* Align purely numeric result cells without changing displayed values or data. */
(() => {
  const selector = '.results-table td, .preview-table td';
  const numeric = /^[<>≤≥]?\s*[+−-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?\s*%?$/;
  function update(root) {
    const cells = root.matches?.(selector) ? [root] : root.querySelectorAll?.(selector) || [];
    for (const cell of cells) {
      if (cell.cellIndex === 0 || cell.querySelector('input,select,button,textarea')) continue;
      cell.classList.toggle('sc-numeric-cell', numeric.test(cell.textContent.trim()));
    }
  }
  function start() {
    update(document);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        const node = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
        if (node) update(node.closest?.('td') || node);
        for (const added of record.addedNodes) if (added.nodeType === Node.ELEMENT_NODE) update(added);
      }
    });
    observer.observe(document.body, { childList:true, subtree:true, characterData:true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true }); else start();
})();
