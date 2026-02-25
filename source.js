javascript:(function(){
  'use strict';

  var MODAL_ID = 'payson-typer-root';
  var existing = document.getElementById(MODAL_ID);
  if (existing) { toggleVisible(); return; }

  // -- Prefs --
  function savePrefs(p) {
    var s = JSON.stringify(p);
    try { localStorage.setItem('payson_typer', s); } catch(e) {}
    try { document.cookie = 'payson_typer=' + encodeURIComponent(s) + ';max-age=31536000;path=/'; } catch(e) {}
  }
  function loadPrefs() {
    try { var s = localStorage.getItem('payson_typer'); if (s) return JSON.parse(s); } catch(e) {}
    try {
      var m = document.cookie.match(/payson_typer=([^;]+)/);
      if (m) return JSON.parse(decodeURIComponent(m[1]));
    } catch(e) {}
    return { wpm: 80, accuracy: 95, variance: 40, finish: true };
  }
  var prefs = loadPrefs();

  // -- CSS --
  var css = [
    '@keyframes pt-glow{0%,100%{box-shadow:0 0 18px 2px rgba(168,85,247,.35),0 8px 40px rgba(0,0,0,.7)}50%{box-shadow:0 0 28px 4px rgba(217,70,239,.5),0 8px 40px rgba(0,0,0,.7)}}',
    '@keyframes pt-shimmer{0%{background-position:0% 50%}100%{background-position:200% 50%}}',
    '#payson-typer-root{position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:2147483647;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;width:310px;max-width:95vw;}',
    '#pt-box{',
      'background:rgba(15,10,25,0.82);',
      'backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);',
      'border:1px solid rgba(168,85,247,0.3);',
      'border-radius:18px;',
      'overflow:hidden;',
      'animation:pt-glow 3s ease-in-out infinite;',
    '}',
    '#pt-header{',
      'padding:16px 18px 12px;',
      'cursor:grab;',
      'border-bottom:1px solid rgba(168,85,247,0.15);',
      'background:rgba(168,85,247,0.08);',
      'position:relative;',
    '}',
    '#pt-header:active{cursor:grabbing;}',
    '#pt-title{',
      'margin:0;font-size:18px;font-weight:800;letter-spacing:-.3px;',
      'background:linear-gradient(90deg,#e879f9,#a855f7,#ec4899,#a855f7);',
      'background-size:200% auto;animation:pt-shimmer 4s linear infinite;',
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;',
    '}',
    '#pt-subtitle{margin:2px 0 0;font-size:10px;color:rgba(200,180,255,0.4);letter-spacing:.6px;font-weight:600;text-transform:uppercase;}',
    '#pt-body{padding:16px 18px 18px;}',
    '.pt-label{display:flex;justify-content:space-between;align-items:center;margin:14px 0 7px;}',
    '.pt-label:first-child{margin-top:0;}',
    '.pt-label-text{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:rgba(200,180,255,0.45);}',
    '.pt-label-val{font-size:12px;font-weight:800;color:rgba(232,180,255,0.9);}',
    'input[type=range].pt-range{width:100%;-webkit-appearance:none;appearance:none;height:18px;outline:none;cursor:pointer;background:transparent;touch-action:none;}',
    'input[type=range].pt-range::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:rgba(168,85,247,0.2);}',
    'input[type=range].pt-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;margin-top:-6px;width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#e879f9,#a855f7);box-shadow:0 2px 8px rgba(168,85,247,0.6);cursor:pointer;transition:transform .15s;}',
    'input[type=range].pt-range::-webkit-slider-thumb:active{transform:scale(1.2);}',
    'input[type=range].pt-range::-moz-range-track{height:4px;border:none;border-radius:999px;background:rgba(168,85,247,0.2);}',
    'input[type=range].pt-range::-moz-range-progress{height:4px;border:none;border-radius:999px;background:rgba(168,85,247,0.45);}',
    'input[type=range].pt-range::-moz-range-thumb{width:16px;height:16px;border-radius:50%;border:none;background:linear-gradient(135deg,#e879f9,#a855f7);box-shadow:0 2px 8px rgba(168,85,247,0.6);cursor:pointer;}',
    '.pt-check-row{display:flex;align-items:center;gap:9px;margin-top:14px;}',
    '.pt-check-row input[type=checkbox]{width:15px;height:15px;cursor:pointer;accent-color:#a855f7;}',
    '.pt-check-row label{font-size:12px;color:rgba(200,180,255,0.55);cursor:pointer;font-weight:600;}',
    '#pt-btns{display:flex;gap:8px;margin-top:16px;}',
    '#pt-btn-start{flex:1;padding:11px 0;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#a855f7,#ec4899);font-size:13px;font-weight:800;color:#fff;letter-spacing:.2px;box-shadow:0 4px 20px rgba(168,85,247,0.4);transition:opacity .15s,transform .1s;}',
    '#pt-btn-start:hover{opacity:.88;transform:translateY(-1px);}',
    '#pt-btn-start:active{transform:translateY(0);}',
    '#pt-btn-cancel{padding:11px 16px;border-radius:10px;cursor:pointer;background:rgba(255,255,255,0.04);border:1px solid rgba(168,85,247,0.2);color:rgba(200,180,255,0.45);font-size:13px;font-weight:700;transition:all .15s;}',
    '#pt-btn-cancel:hover{color:rgba(200,180,255,0.9);border-color:rgba(168,85,247,0.5);background:rgba(168,85,247,0.08);}',
    '#pt-btn-stop{display:none;width:100%;padding:11px 0;border-radius:10px;border:1px solid rgba(239,68,68,0.3);cursor:pointer;margin-top:10px;font-size:13px;font-weight:800;letter-spacing:.2px;background:rgba(239,68,68,0.12);color:#f87171;transition:all .15s;}',
    '#pt-btn-stop:hover{background:rgba(239,68,68,0.2);border-color:rgba(239,68,68,0.5);}',
    '#pt-progress-wrap{height:3px;background:rgba(168,85,247,0.12);border-radius:3px;margin-top:12px;overflow:hidden;display:none;}',
    '#pt-progress-bar{height:100%;width:0%;border-radius:3px;background:linear-gradient(90deg,#a855f7,#ec4899);transition:width .4s;}',
    '#pt-status{margin-top:9px;font-size:11px;font-weight:700;color:rgba(200,180,255,0.4);text-align:center;min-height:14px;letter-spacing:.3px;}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.id = 'payson-typer-style';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // -- DOM --
  var root = document.createElement('div');
  root.id = MODAL_ID;
  root.innerHTML =
    '<div id="pt-box">' +
      '<div id="pt-header">' +
        '<p id="pt-title">Payson Typer</p>' +
        '<p id="pt-subtitle">For TypingClub &mdash; Made By Payson</p>' +
      '</div>' +
      '<div id="pt-body">' +
        '<div class="pt-label"><span class="pt-label-text">Typing Speed</span><span class="pt-label-val"><span id="pt-wpm-val">' + prefs.wpm + '</span> wpm</span></div>' +
        '<input type="range" class="pt-range" id="pt-wpm" min="10" max="300" value="' + prefs.wpm + '" step="5">' +
        '<div class="pt-label"><span class="pt-label-text">Accuracy</span><span class="pt-label-val"><span id="pt-acc-val">' + prefs.accuracy + '</span>%</span></div>' +
        '<input type="range" class="pt-range" id="pt-acc" min="50" max="100" value="' + prefs.accuracy + '" step="1">' +
        '<div class="pt-label"><span class="pt-label-text">Rhythm Variance</span><span class="pt-label-val"><span id="pt-var-val">' + prefs.variance + '</span>%</span></div>' +
        '<input type="range" class="pt-range" id="pt-var" min="0" max="100" value="' + prefs.variance + '" step="5">' +
        '<div class="pt-check-row">' +
          '<input type="checkbox" id="pt-finish"' + (prefs.finish ? ' checked' : '') + '>' +
          '<label for="pt-finish">Complete final character (show results)</label>' +
        '</div>' +
        '<div id="pt-btns">' +
          '<button id="pt-btn-cancel">Cancel</button>' +
          '<button id="pt-btn-start">Start Typing</button>' +
        '</div>' +
        '<button id="pt-btn-stop">Stop</button>' +
        '<div id="pt-progress-wrap"><div id="pt-progress-bar"></div></div>' +
        '<div id="pt-status"></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(root);

  // -- Dragging --
  var drag = { on: false, sx: 0, sy: 0, ox: 0, oy: 0 };
  document.getElementById('pt-header').addEventListener('mousedown', function(e) {
    var r = root.getBoundingClientRect();
    root.style.left = r.left + 'px';
    root.style.top = r.top + 'px';
    root.style.transform = 'none';
    drag.on = true; drag.sx = e.clientX; drag.sy = e.clientY;
    drag.ox = r.left; drag.oy = r.top;
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (!drag.on) return;
    var W = window.innerWidth, H = window.innerHeight, bw = root.offsetWidth, bh = root.offsetHeight;
    root.style.left = Math.max(0, Math.min(W - bw, drag.ox + e.clientX - drag.sx)) + 'px';
    root.style.top  = Math.max(0, Math.min(H - bh, drag.oy + e.clientY - drag.sy)) + 'px';
  });
  document.addEventListener('mouseup', function() { drag.on = false; });

  // -- Toggle visibility via Right Shift --
  function toggleVisible() {
    var el = document.getElementById(MODAL_ID);
    if (!el) return;
    el.style.display = el.style.display === 'none' ? '' : 'none';
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Shift' && e.location === 2) toggleVisible();
  });

  // -- Slider bindings --
  function bindRange(inputId, valId) {
    var inp = document.getElementById(inputId);
    var val = document.getElementById(valId);
    if (!inp || !val) return;
    inp.addEventListener('input', function() { val.textContent = inp.value; persist(); });
    inp.addEventListener('change', function() { val.textContent = inp.value; persist(); });

    // Fallback drag handling for pages that interfere with native range dragging.
    if (!window.PointerEvent) return;

    var dragging = false;
    function setValueFromClientX(clientX) {
      var rect = inp.getBoundingClientRect();
      if (rect.width <= 0) return;
      var min = parseFloat(inp.min || '0');
      var max = parseFloat(inp.max || '100');
      var step = parseFloat(inp.step || '1');
      if (!isFinite(min) || !isFinite(max) || !isFinite(step) || max <= min || step <= 0) return;
      var ratio = (clientX - rect.left) / rect.width;
      ratio = Math.max(0, Math.min(1, ratio));
      var raw = min + ratio * (max - min);
      var stepped = min + Math.round((raw - min) / step) * step;
      var decimals = (String(step).split('.')[1] || '').length;
      inp.value = stepped.toFixed(decimals);
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }

    inp.addEventListener('pointerdown', function(e) {
      if (e.button !== 0 && e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
      dragging = true;
      try { inp.setPointerCapture(e.pointerId); } catch(e) {}
      setValueFromClientX(e.clientX);
      e.preventDefault();
    });
    inp.addEventListener('pointermove', function(e) {
      if (!dragging) return;
      setValueFromClientX(e.clientX);
      e.preventDefault();
    });
    function endPointerDrag(e) {
      if (!dragging) return;
      dragging = false;
      try { inp.releasePointerCapture(e.pointerId); } catch(e) {}
    }
    inp.addEventListener('pointerup', endPointerDrag);
    inp.addEventListener('pointercancel', endPointerDrag);
  }
  bindRange('pt-wpm', 'pt-wpm-val');
  bindRange('pt-acc', 'pt-acc-val');
  bindRange('pt-var', 'pt-var-val');
  document.getElementById('pt-finish').addEventListener('change', persist);

  function persist() {
    savePrefs({
      wpm:      parseInt(document.getElementById('pt-wpm').value, 10),
      accuracy: parseInt(document.getElementById('pt-acc').value, 10),
      variance: parseInt(document.getElementById('pt-var').value, 10),
      finish:   document.getElementById('pt-finish').checked
    });
  }

  // -- Destroy --
  function destroy() {
    stopRequested = true;
    root.remove();
    styleEl.remove();
  }
  document.getElementById('pt-btn-cancel').addEventListener('click', destroy);

  // -- Core typing engine --
  var running = false;
  var stopRequested = false;
  var nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

  function setStatus(msg) {
    var el = document.getElementById('pt-status');
    if (el) el.textContent = msg;
  }
  function setProgress(pct) {
    var wrap = document.getElementById('pt-progress-wrap');
    var bar  = document.getElementById('pt-progress-bar');
    if (wrap) wrap.style.display = 'block';
    if (bar)  bar.style.width = pct + '%';
  }

  function getTypingInput() {
    var all = Array.from(document.querySelectorAll('input[type="text"]'));
    return all.find(function(el) { return !el.id && !el.className; }) || all[0] || null;
  }

  function getTargetChars() {
    var NBSP = String.fromCharCode(160);
    return Array.from(document.querySelectorAll('.token span.token_unit'))
      .map(function(el) {
        if (el.firstChild && el.firstChild.classList && el.firstChild.classList.contains('_enter')) return '\n';
        return el.textContent[0] || '';
      })
      .map(function(c) { return c === NBSP ? ' ' : c; })
      .filter(function(c) { return c.length > 0; });
  }

  function sendChar(chr, inp) {
    if (chr === '\n') {
      var enterOpts = {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        charCode: 13,
        bubbles: true,
        cancelable: true
      };
      inp.dispatchEvent(new KeyboardEvent('keydown', enterOpts));
      inp.dispatchEvent(new KeyboardEvent('keypress', enterOpts));
      inp.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: null,
        inputType: 'insertLineBreak'
      }));
      inp.dispatchEvent(new KeyboardEvent('keyup', enterOpts));
      nativeSetter.call(inp, '');
      return;
    }

    nativeSetter.call(inp, chr);
    inp.dispatchEvent(new KeyboardEvent('keydown',  { key: chr, bubbles: true, cancelable: true }));
    inp.dispatchEvent(new KeyboardEvent('keypress', { key: chr, bubbles: true, cancelable: true }));
    inp.dispatchEvent(new InputEvent('input',       { bubbles: true, cancelable: true, data: chr, inputType: 'insertText' }));
    inp.dispatchEvent(new KeyboardEvent('keyup',    { key: chr, bubbles: true, cancelable: true }));
    nativeSetter.call(inp, '');
  }
  function sendBackspace(inp) {
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    inp.dispatchEvent(new InputEvent('input',      { bubbles: true, cancelable: true, data: null, inputType: 'deleteContentBackward' }));
    inp.dispatchEvent(new KeyboardEvent('keyup',   { key: 'Backspace', bubbles: true, cancelable: true }));
    nativeSetter.call(inp, '');
  }

  function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
  function wpmToMs(wpm) { return Math.round(60000 / (wpm * 5)); }
  function jitter(base, pct) {
    if (pct === 0) return base;
    var r = (Math.random() + Math.random()) / 2;
    return Math.max(20, base + (r * 2 - 1) * base * (pct / 100));
  }

  // Pre-compute exactly which indices get wrong chars to hit target accuracy
  function buildErrorSet(total, accuracyPct) {
    var errorSet = {};
    var count = Math.round(total * (1 - accuracyPct / 100));
    if (count <= 0) return errorSet;
    var pool = [];
    for (var i = 3; i < total - 2; i++) pool.push(i);
    for (var j = pool.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = pool[j]; pool[j] = pool[k]; pool[k] = t;
    }
    var placed = 0, last = -10;
    for (var n = 0; n < pool.length && placed < count; n++) {
      if (pool[n] - last >= 3) { errorSet[pool[n]] = true; last = pool[n]; placed++; }
    }
    return errorSet;
  }

  function randomWrongChar(correct) {
    if (correct === '\n') return Math.random() < 0.5 ? ' ' : '.';
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var digits = '0123456789';
    var punct = '.,!?;:\'"-()[]{}<>/\\|@#$%^&*_+=`~';
    var src = alpha;
    if (/[0-9]/.test(correct)) src = digits;
    else if (/[a-z]/i.test(correct)) src = alpha;
    else if (!/\s/.test(correct)) src = punct;
    var opts = src.split('').filter(function(c) { return c.toLowerCase() !== String(correct).toLowerCase(); });
    if (!opts.length) opts = alpha.split('');
    var pick = opts[Math.floor(Math.random() * opts.length)];
    if (/[A-Z]/.test(correct)) pick = pick.toUpperCase();
    return pick;
  }

  async function autoPlay(wpm, variance, accuracy, finish) {
    var chars  = getTargetChars();
    var inp    = getTypingInput();
    if (!chars.length) { setStatus('No characters found. Open a lesson first.'); resetUI(); return; }
    if (!inp)          { setStatus('Typing input not found. Open a lesson first.'); resetUI(); return; }

    inp.focus();
    var base   = wpmToMs(wpm);
    var total  = finish ? chars.length : chars.length - 1;
    var errors = buildErrorSet(total, accuracy);

    for (var i = 0; i < total; i++) {
      if (stopRequested) { setStatus('Stopped at ' + i + ' / ' + total + '.'); resetUI(); return; }
      if (errors[i] && chars[i] !== '\n') {
        sendChar(randomWrongChar(chars[i]), inp);
        await sleep(Math.max(25, jitter(base * 0.55, variance)));
        sendBackspace(inp);
        await sleep(Math.max(20, jitter(base * 0.35, variance)));
      }
      sendChar(chars[i], inp);
      if (i % 5 === 0) { setStatus('Typing... ' + i + ' / ' + total); setProgress(Math.round(i / total * 100)); }
      await sleep(jitter(base, variance));
    }
    setStatus('Done! ' + total + ' chars at ~' + wpm + ' wpm.');
    setProgress(100);
    resetUI();
  }

  function resetUI() {
    running = false; stopRequested = false;
    var btns = document.getElementById('pt-btns');
    var stop = document.getElementById('pt-btn-stop');
    if (btns) btns.style.display = 'flex';
    if (stop) stop.style.display = 'none';
  }

  // -- Button handlers --
  document.getElementById('pt-btn-start').addEventListener('click', function() {
    if (running) return;
    persist();
    var p = loadPrefs();
    running = true; stopRequested = false;
    document.getElementById('pt-btns').style.display = 'none';
    document.getElementById('pt-btn-stop').style.display = 'block';
    setStatus('Starting...');
    autoPlay(p.wpm, p.variance, p.accuracy, p.finish);
  });

  document.getElementById('pt-btn-stop').addEventListener('click', function() {
    stopRequested = true; setStatus('Stopping...');
  });

})();
