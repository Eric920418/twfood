/* TAI FOOD · game.js — 閒置門檻小遊戲「台味接接樂」
 * 長時間未操作 → 全頁覆蓋；接住台灣美食 +10，滿 50 分恢復正常。
 * index.html 與 dish.html 共用；純 DOM + requestAnimationFrame，無套件。
 */
(() => {
  'use strict';

  const IDLE_MS = 60000;     // 閒置 60 秒觸發
  const WIN_SCORE = 50;      // 滿 50 分解鎖
  const HIT_POINTS = 10;
  const PASSED_KEY = 'taifood_game_passed';

  // 台灣味（名稱取自本站菜單）。emoji 故意有重複（🍜），逼玩家讀名稱判斷。
  const TW = [
    { n: '珍珠奶茶', e: '🧋' }, { n: '牛肉麵', e: '🍜' }, { n: '滷肉飯', e: '🍚' },
    { n: '蚵仔煎', e: '🍳' }, { n: '雞排', e: '🍗' }, { n: '臭豆腐', e: '🧈' },
    { n: '芒果冰', e: '🍧' }, { n: '鳳梨酥', e: '🍪' }, { n: '豆花', e: '🍮' },
    { n: '刈包', e: '🥪' }, { n: '大腸蚵仔麵線', e: '🍲' }, { n: '鹽酥雞', e: '🍢' },
  ];
  const FOREIGN = [
    { n: '披薩', e: '🍕' }, { n: '漢堡', e: '🍔' }, { n: '壽司', e: '🍣' },
    { n: '可頌', e: '🥐' }, { n: '塔可', e: '🌮' }, { n: '義大利麵', e: '🍝' },
    { n: '甜甜圈', e: '🍩' }, { n: '熱狗', e: '🌭' }, { n: '牛排', e: '🥩' },
    { n: '法國麵包', e: '🥖' }, { n: '咖哩飯', e: '🍛' }, { n: '貝果', e: '🥯' },
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let root, field, basket, scoreEl, introEl, winEl, hintEl, winScoreEl;
  let open = false, playing = false, score = 0;
  let items = [];           // {el, x, y, w, h, isTW}
  let basketX = 0, BW = 110, BH = 70;
  let raf = 0, lastTs = 0, lastSpawn = 0;
  let idleTimer = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  const passed = () => { try { return sessionStorage.getItem(PASSED_KEY) === '1'; } catch (e) { return false; } };
  const setPassed = () => { try { sessionStorage.setItem(PASSED_KEY, '1'); } catch (e) {} };

  /* ---------- 建立覆蓋層（首次啟動時） ---------- */
  function build() {
    if (root) return;
    root = el('div', 'cgame'); root.id = 'catchGame'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', '台味接接樂');

    const panel = el('div', 'cgame__panel');

    const bar = el('div', 'cgame__bar');
    const title = el('div', 'cgame__title'); title.textContent = '台味接接樂';
    const scoreWrap = el('div', 'cgame__score');
    scoreWrap.append(txt('分數 '));
    scoreEl = el('b'); scoreEl.textContent = '0'; scoreWrap.append(scoreEl, txt(' / ' + WIN_SCORE));
    bar.append(title, scoreWrap);

    field = el('div', 'cgame__field'); field.id = 'cgField';
    basket = el('div', 'cgame__basket'); basket.textContent = '🧺'; basket.setAttribute('aria-hidden', 'true');
    field.append(basket);

    hintEl = el('p', 'cgame__hint');
    hintEl.textContent = '移動籃子接住「台灣美食」，接錯不扣分。滿 ' + WIN_SCORE + ' 分解鎖網站。';

    // intro
    introEl = el('div', 'cgame__overlayscreen');
    const i1 = el('h2'); i1.textContent = '🍽️ 你離開太久了！';
    const i2 = el('p'); i2.textContent = '玩個「台味接接樂」醒醒腦——各國美食掉下來，只接「台灣味」，每對 +10 分，滿 50 分回到網站。';
    const iBtn = el('button', 'cgame__btn'); iBtn.type = 'button'; iBtn.textContent = '開始遊戲';
    iBtn.addEventListener('click', startPlay);
    introEl.append(i1, i2, iBtn);

    // win
    winEl = el('div', 'cgame__overlayscreen'); winEl.hidden = true;
    const w1 = el('h2'); w1.textContent = '🎉 恭喜過關！';
    const w2 = el('p'); w2.textContent = '';
    winScoreEl = w2;
    const w3 = el('p'); w3.textContent = '你證明了你真的懂台灣味。';
    const wBtn = el('button', 'cgame__btn'); wBtn.type = 'button'; wBtn.textContent = '恢復正常使用 →';
    wBtn.addEventListener('click', () => { setPassed(); close(); });
    winEl.append(w1, w2, w3, wBtn);

    const skip = el('button', 'cgame__skip'); skip.type = 'button'; skip.textContent = '略過遊戲';
    skip.addEventListener('click', () => { setPassed(); close(); });

    panel.append(bar, field, hintEl, introEl, winEl, skip);
    root.append(panel);
    document.body.append(root);

    // 控制：指標 / 觸控 / 鍵盤
    field.addEventListener('pointermove', onPointer, { passive: true });
    field.addEventListener('touchmove', (e) => { if (e.touches[0]) moveBasket(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('keydown', onKey);
  }

  function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function txt(s) { return document.createTextNode(s); }

  /* ---------- 開關 ---------- */
  function launch() {
    if (open) return;
    build();
    open = true;
    score = 0; items = [];
    root.hidden = false;
    document.body.style.overflow = 'hidden';
    introEl.hidden = false; winEl.hidden = true;
    // 籃子置中
    requestAnimationFrame(() => { BW = basket.offsetWidth || 110; basketX = (field.clientWidth - BW) / 2; placeBasket(); });
  }
  function close() {
    open = false; playing = false;
    if (raf) cancelAnimationFrame(raf), raf = 0;
    items.forEach(it => it.el.remove()); items = [];
    if (root) root.hidden = true;
    document.body.style.overflow = '';
    resetIdle();
  }

  function startPlay() {
    introEl.hidden = true;
    score = 0; updateScore();
    playing = true;
    BW = basket.offsetWidth || 110;
    basketX = (field.clientWidth - BW) / 2; placeBasket();
    lastTs = 0; lastSpawn = 0;
    raf = requestAnimationFrame(loop);
  }

  function win() {
    playing = false;
    if (raf) cancelAnimationFrame(raf), raf = 0;
    items.forEach(it => it.el.remove()); items = [];
    winScoreEl.textContent = `最終分數：${score} 分`;
    winEl.hidden = false;
  }

  /* ---------- 主迴圈 ---------- */
  function loop(ts) {
    if (!playing) return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05); // 夾住，避免分頁切回大跳
    lastTs = ts;

    // 生成（隨分數略加速、間隔略縮短）
    const interval = Math.max(700, 1150 - score * 6);
    if (ts - lastSpawn > interval) { lastSpawn = ts; spawn(); }

    const fw = field.clientWidth, fh = field.clientHeight;
    const speed = 175 + score * 2.2;          // px/s，越接近過關越快
    const basketTop = fh - BH - 8;

    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.y += speed * dt;
      it.el.style.transform = `translate(${it.x}px, ${it.y}px)`;

      // 碰撞（矩形重疊：到籃子高度 + x 範圍）
      if (it.y + it.h >= basketTop && it.y <= basketTop + BH &&
          it.x + it.w > basketX + 8 && it.x < basketX + BW - 8) {
        catchItem(it, i);
        continue;
      }
      // 掉出底部 → 移除（漏接無事）
      if (it.y > fh) { it.el.remove(); items.splice(i, 1); }
    }
    raf = requestAnimationFrame(loop);
  }

  function spawn() {
    const fw = field.clientWidth;
    const isTW = Math.random() < 0.5;
    const data = (isTW ? TW : FOREIGN)[Math.floor(Math.random() * (isTW ? TW.length : FOREIGN.length))];
    const card = el('div', 'cgame__item');
    const em = el('span', 'cgame__item-e'); em.textContent = data.e;
    const nm = el('span', 'cgame__item-n'); nm.textContent = data.n;
    card.append(em, nm);
    field.append(card);
    const w = card.offsetWidth || 84, h = card.offsetHeight || 84;
    const it = { el: card, x: rand(0, Math.max(0, fw - w)), y: -h, w, h, isTW };
    card.style.transform = `translate(${it.x}px, ${it.y}px)`;
    items.push(it);
  }

  function catchItem(it, idx) {
    it.el.remove(); items.splice(idx, 1);
    if (it.isTW) {
      score += HIT_POINTS; updateScore();
      flash('✓ 台灣味 +' + HIT_POINTS, true, it.x, it.y);
      if (score >= WIN_SCORE) { score = WIN_SCORE; updateScore(); win(); }
    } else {
      flash('✗ 這不是台灣味', false, it.x, it.y);
    }
  }

  function flash(text, good, x, y) {
    const f = el('div', 'cgame__flash' + (good ? ' is-good' : ' is-bad'));
    f.textContent = text;
    f.style.left = x + 'px';
    f.style.top = (field.clientHeight - BH - 40) + 'px';
    field.append(f);
    setTimeout(() => f.remove(), 700);
  }

  function updateScore() {
    if (scoreEl) scoreEl.textContent = String(score);
  }

  /* ---------- 控制 ---------- */
  function onPointer(e) { moveBasket(e.clientX); }
  function moveBasket(clientX) {
    const r = field.getBoundingClientRect();
    basketX = clamp(clientX - r.left - BW / 2, 0, field.clientWidth - BW);
    placeBasket();
  }
  function onKey(e) {
    if (!open) return;
    if (e.key === 'ArrowLeft') { basketX = clamp(basketX - 40, 0, field.clientWidth - BW); placeBasket(); }
    else if (e.key === 'ArrowRight') { basketX = clamp(basketX + 40, 0, field.clientWidth - BW); placeBasket(); }
  }
  function placeBasket() { if (basket) basket.style.transform = `translateX(${basketX}px)`; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- 閒置偵測 ---------- */
  function resetIdle() {
    clearTimeout(idleTimer);
    if (open || passed()) return;
    idleTimer = setTimeout(launch, IDLE_MS);
  }
  ['mousemove', 'keydown', 'scroll', 'click', 'touchstart', 'wheel', 'pointerdown'].forEach(ev =>
    window.addEventListener(ev, resetIdle, { passive: true }));
  resetIdle();

  // 手動開（index footer 連結）；也方便測試
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-play-game]');
    if (t) { e.preventDefault(); launch(); }
  });

  // 對外測試掛點（可在 console 用 window.TAIGAME.launch() / setIdle(ms)）
  window.TAIGAME = { launch, close, get score() { return score; } };
})();
