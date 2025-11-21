// ===== keyboard.js — On-Screen Keyboard =====
(function(){
  const toggle = document.getElementById('kbToggle');
  const kb = document.getElementById('keyboard');
  if (!toggle || !kb) return;

  const rows = [
    ['1','2','3','4','5','6','7','8','9','0','Back'],
    ['q','w','e','r','t','y','u','i','o','p'],
    ['Caps','a','s','d','f','g','h','j','k','l','Enter'],
    ['z','x','c','v','b','n','m','-','_','.','@'],
    ['←','→','Space','Del','Clear']
  ];

  const rowEls = kb.querySelectorAll('.kb-row');
  rows.forEach((row, i)=>{
    const rowEl = rowEls[i] || kb.appendChild(Object.assign(document.createElement('div'), {className:'kb-row'}));
    row.forEach(key=>{
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kb-btn';
      if (['Back','Enter','Caps','Space','Clear','Del','←','→'].includes(key)) btn.classList.add('wide');
      if (key === 'Space') btn.classList.add('space');
      btn.textContent = key;
      btn.dataset.key = key;
      rowEl.appendChild(btn);
    });
  });

  let caps = False = false; // typo-safe guard
  caps = false;
  let lastField = null;

  document.addEventListener('focusin', (e)=>{
    const el = e.target;
    if (!el) return;
    const ok = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    if (ok) lastField = el;
  });

  kb.addEventListener('mousedown', e => e.preventDefault());
  toggle.addEventListener('mousedown', e => e.preventDefault());

  function targetField(){
    const el = document.activeElement;
    const ok = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    return ok ? el : lastField;
  }

  function setCaret(el, pos){
    if (el.isContentEditable) return;
    if (typeof el.setSelectionRange === 'function') el.setSelectionRange(pos, pos);
  }

  function insertAtCaret(el, text){
    if (!el) return;
    if (!el.isContentEditable){
      const start = el.selectionStart ?? el.value.length;
      const end   = el.selectionEnd ?? el.value.length;
      el.value = el.value.slice(0, start) + text + el.value.slice(end);
      setCaret(el, start + text.length);
      el.dispatchEvent(new Event('input', {bubbles:true}));
    } else {
      el.textContent = (el.textContent || '') + text;
    }
  }

  function backspace(el){
    if (!el) return;
    if (!el.isContentEditable){
      const start = el.selectionStart ?? 0;
      const end   = el.selectionEnd ?? 0;
      if (start !== end){
        el.value = el.value.slice(0, start) + el.value.slice(end);
        setCaret(el, start);
      } else if (start > 0){
        el.value = el.value.slice(0, start - 1) + el.value.slice(end);
        setCaret(el, start - 1);
      }
      el.dispatchEvent(new Event('input', {bubbles:true}));
    } else {
      el.textContent = (el.textContent || '').slice(0, -1);
    }
  }

  function delKey(el){
    if (!el) return;
    if (document.activeElement !== el) el.focus();

    if (!el.isContentEditable) {
      const hasSel = typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number';
      if (!hasSel) {
        el.value = String(el.value).slice(0, -1);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      const start = el.selectionStart;
      const end   = el.selectionEnd;
      const len   = el.value.length;

      if (start !== end) {
        el.value = el.value.slice(0, start) + el.value.slice(end);
        setCaret(el, start);
      } else if (start < len) {
        el.value = el.value.slice(0, start) + el.value.slice(start + 1);
        setCaret(el, start);
      } else if (len > 0) {
        el.value = el.value.slice(0, len - 1);
        setCaret(el, len - 1);
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    const sel = window.getSelection && window.getSelection();
    if (sel && sel.rangeCount) {
      const r = sel.getRangeAt(0);
      if (!r.collapsed) {
        r.deleteContents();
      } else {
        try {
          r.setEnd(r.endContainer, Math.min(r.endOffset + 1, (r.endContainer.textContent || '').length));
          r.deleteContents();
        } catch {
          const t = (el.textContent || '');
          el.textContent = t.substring(1);
        }
      }
    } else {
      const t = (el.textContent || '');
      el.textContent = t.substring(1);
    }
  }

  function moveCaret(el, dir){
    if (!el || el.isContentEditable) return;
    const pos = el.selectionStart ?? 0;
    const next = Math.max(0, Math.min((el.value || '').length, pos + dir));
    setCaret(el, next);
  }

  kb.addEventListener('click', (e)=>{
    const btn = e.target.closest('.kb-btn');
    if (!btn) return;
    const key = btn.dataset.key;
    const el = targetField();
    if (!el) return;

    switch(key){
      case 'Back': backspace(el); break;
      case 'Del':
      case 'Delete': delKey(el); break;
      case 'Enter': insertAtCaret(el, '\n'); break;
      case 'Space': insertAtCaret(el, ' '); break;
      case 'Caps': caps = !caps; btn.classList.toggle('active', caps); break;
      case 'Clear':
        if (!el.isContentEditable) {
          el.value = '';
          el.dispatchEvent(new Event('input', {bubbles:true}));
        } else {
          el.textContent = '';
        }
        break;
      case '←': moveCaret(el, -1); break;
      case '→': moveCaret(el, +1); break;
      default: insertAtCaret(el, caps ? key.toUpperCase() : key);
    }
    el.focus();
  });

  function openKb(){ kb.classList.add('show'); toggle.textContent = 'Hide Keyboard'; }
  function closeKb(){ kb.classList.remove('show'); toggle.textContent = 'Keyboard'; }
  toggle.addEventListener('click', ()=> kb.classList.contains('show') ? closeKb() : openKb());
})();
