/* TAI FOOD · script.js（首頁互動）
 * 資料與共用函式在 data.js（先載入）：DISHES / RESTAURANTS / INGREDIENTS /
 * SYNONYMS / CAT_LABEL / escapeHtml / renderCard / dishCardHTML / storesForDish …
 */
(() => {
  'use strict';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- 0. 依 data.js 的 DISHES 產生菜卡（鹹點／飲品為格線；甜點為圓桌轉盤） ---------- */
  document.querySelectorAll('.dish-grid[data-cat]').forEach(grid => {
    const cat = grid.dataset.cat;
    grid.innerHTML = DISHES.filter(d => d.cat === cat).map(dishCardHTML).join('');
  });

  /* ---------- 0b. 甜點圓桌轉盤（釘住聚焦 + 滾動驅動旋轉） ---------- */
  (function buildTurntable() {
    const track = document.getElementById('sweetTrack');
    const wheel = document.getElementById('sweetTurntable');
    if (!track || !wheel) return;
    const sweets = DISHES.filter(d => d.cat === 'sweet');
    const N = sweets.length;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 減動：退化為一般卡片格線，不釘不轉
    if (reduce) {
      track.classList.add('is-static');
      track.innerHTML = `<div class="dish-grid" data-cat="sweet">${sweets.map(dishCardHTML).join('')}</div>`;
      return;
    }

    // 8 個盤子沿圓周均分，連到詳情頁
    const plates = sweets.map((d, i) => {
      const a = (360 / N) * i;
      const media = d.img
        ? `<span class="tt-plate__disc"><img src="${escapeHtml(d.img)}" alt="${escapeHtml(d.name)}" loading="lazy"/></span>`
        : `<span class="tt-plate__disc tt-plate__disc--emoji"><span aria-hidden="true">${escapeHtml(d.emoji)}</span></span>`;
      return `<a class="tt-plate" role="listitem" style="--a:${a}deg" href="dish.html?d=${encodeURIComponent(d.id)}" aria-label="${escapeHtml(d.name)}">
        <span class="tt-plate__inner">
          <span class="tt-plate__card">
            ${media}
            <span class="tt-plate__name">${escapeHtml(d.name)}</span>
            <span class="tt-plate__price">${escapeHtml(d.price)}</span>
          </span>
        </span>
      </a>`;
    }).join('');
    wheel.insertAdjacentHTML('beforeend', plates);

    const plateEls = [...wheel.querySelectorAll('.tt-plate')];
    const front = document.getElementById('ttFront');
    let raf = 0;

    function update() {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const scrollable = track.offsetHeight - window.innerHeight;
      const p = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;
      const spin = p * 360;
      wheel.style.setProperty('--spin', spin + 'deg');

      // 找出螢幕角最接近正上(0°)的盤 → 聚焦
      const dists = plateEls.map((el, i) => {
        const s = (((360 / N) * i + spin) % 360 + 360) % 360;
        return Math.min(s, 360 - s);
      });
      const best = dists.indexOf(Math.min(...dists));
      plateEls.forEach((el, i) => {
        const f = i === best;
        el.classList.toggle('is-front', f);
        el.style.setProperty('--s', f ? '1.28' : '0.82');
      });
      if (front) front.textContent = `${sweets[best].name}　${sweets[best].price}`;
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

  /* ---------- 0c. 飲品橫向展開手風琴（滑到／點選展開） ---------- */
  (function buildDrinkPanels() {
    const wrap = document.getElementById('drinkPanels');
    if (!wrap) return;
    const drinks = DISHES.filter(d => d.cat === 'drink');
    const decors = ['assets/7.png', 'assets/6.png', 'assets/4.png']; // 漣漪／祥雲底紋輪流

    wrap.innerHTML = drinks.map((d, i) => {
      // 有合成照片用照片（自帶水花，省去漣漪底紋）；無照片維持 emoji + 裝飾底紋
      const visual = d.img
        ? `<span class="panel__photo"><img src="${escapeHtml(d.img)}" alt="${escapeHtml(d.name)}" loading="lazy"/></span>`
        : `<span class="panel__decor" aria-hidden="true"><img src="${decors[i % decors.length]}" alt=""/></span>
           <span class="panel__emoji" aria-hidden="true">${escapeHtml(d.emoji)}</span>`;
      return `
      <div class="panel${d.img ? ' panel--photo' : ''}" role="listitem" data-i="${i}" style="--i:${i}">
        ${visual}
        <span class="panel__label">${escapeHtml(d.name)}</span>
        <div class="panel__body">
          <h3 class="panel__name">${escapeHtml(d.name)}</h3>
          <p class="panel__en">${escapeHtml(d.en)}</p>
          <p class="panel__desc">${escapeHtml(d.desc)}</p>
          <span class="panel__price">${escapeHtml(d.price)}</span>
          <a class="panel__cta" href="dish.html?d=${encodeURIComponent(d.id)}">看詳情 →</a>
        </div>
      </div>`;
    }).join('');

    const panels = [...wrap.querySelectorAll('.panel')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const setActive = (el) => panels.forEach(p => p.classList.toggle('is-active', p === el));
    setActive(panels[0]);

    panels.forEach(p => {
      p.addEventListener('click', () => setActive(p));
      if (!reduce && window.matchMedia('(hover:hover)').matches) {
        p.addEventListener('mouseenter', () => setActive(p));
      }
    });

    // 進場：整排由左到右 stagger 升起
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        es.forEach(e => { if (e.isIntersecting) { wrap.classList.add('is-in'); io.disconnect(); } });
      }, { threshold: 0.2 });
      io.observe(wrap);
    } else {
      wrap.classList.add('is-in');
    }
  })();

  /* ---------- 0d. 每日一食「今天吃啥?」（擲骰隨機 + 月曆 + 近三天不重複） ---------- */
  (function buildDaily() {
    const stage = document.getElementById('rollerStage');
    const rollBtn = document.getElementById('rollBtn');
    const calGrid = document.getElementById('calGrid');
    const calTitle = document.getElementById('calTitle');
    const calCaption = document.getElementById('calCaption');
    const rollerDate = document.getElementById('rollerDate');
    if (!stage || !calGrid || !rollBtn) return;

    const STORE = 'taifood_daily';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pool = DISHES;                       // 全部 33 道

    const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } };
    const save = (m) => { try { localStorage.setItem(STORE, JSON.stringify(m)); } catch (e) { /* 隱私模式：不持久 */ } };
    const stored = load();

    const pad = n => String(n).padStart(2, '0');
    const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayKey = key(today);
    const year = today.getFullYear(), month = today.getMonth();

    // FNV-1a：把日期字串轉成穩定數字（→ 確定性挑菜，重載不變）
    const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
    const dishById = (id) => pool.find(d => d.id === id);
    const pickForDate = (dateKey, recentIds) => {
      const cands = pool.filter(d => !recentIds.includes(d.id));
      return cands[hashStr(dateKey) % cands.length].id;
    };
    const recentBefore = (refKey, mapRef) => {
      const ref = new Date(refKey + 'T00:00:00');
      return [1, 2, 3].map(off => { const p = new Date(ref); p.setDate(ref.getDate() - off); return mapRef[key(p)]; }).filter(Boolean);
    };

    // 建「日期→dishId」：從月初前 3 天連算到今天（緩衝讓月初的三天規則正確）
    const map = {};
    const start = new Date(year, month, 1 - 3);
    for (let d = new Date(start); d < today; d.setDate(d.getDate() + 1)) {   // 過去：確定性填滿
      const k = key(d);
      map[k] = stored[k] || pickForDate(k, recentBefore(k, map));
    }
    if (stored[todayKey]) map[todayKey] = stored[todayKey];                  // 今天：擲過才有

    const visual = (d) => d.img
      ? `<img class="roller__img" src="${escapeHtml(d.img)}" alt="${escapeHtml(d.name)}"/>`
      : `<span class="roller__emoji">${escapeHtml(d.emoji)}</span>`;

    function renderResult(id) {
      const d = dishById(id); if (!d) return;
      stage.classList.add('has-result');
      const eaten = isEaten(d.id);
      stage.innerHTML = `
        <div class="roller__result">
          <a class="roller__link" href="dish.html?d=${encodeURIComponent(d.id)}">
            <span class="roller__media">${visual(d)}</span>
            <span class="roller__name">${escapeHtml(d.name)}</span>
            <span class="roller__sub">${escapeHtml(d.en)} · ${escapeHtml(d.price)}</span>
          </a>
          <div class="roller__actions">
            <a class="roller__cta" href="dish.html?d=${encodeURIComponent(d.id)}">看詳情 →</a>
            <button type="button" class="roller__stampbtn${eaten ? ' is-eaten' : ''}" data-id="${escapeHtml(d.id)}">${eaten ? '★ 已蓋章' : '＋ 蓋章 +10'}</button>
          </div>
        </div>`;
      const btn = stage.querySelector('.roller__stampbtn');
      btn.addEventListener('click', () => {
        const on = toggleEaten(d.id);
        btn.classList.toggle('is-eaten', on);
        btn.textContent = on ? '★ 已蓋章' : '＋ 蓋章 +10';
      });
    }
    function renderDice() {
      stage.classList.remove('has-result');
      stage.innerHTML = `<div class="dice" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>`;
    }

    function roll() {
      const exclude = new Set([...recentBefore(todayKey, map), map[todayKey]]);
      const cands = pool.filter(d => !exclude.has(d.id));
      const pick = cands[Math.floor(Math.random() * cands.length)];
      const finish = () => {
        map[todayKey] = pick.id; stored[todayKey] = pick.id; save(stored);
        renderResult(pick.id); updateTodayCell();
        rollBtn.textContent = '🎲 換一道';
      };
      if (reduce) { finish(); return; }
      rollBtn.disabled = true;
      let n = 0; const total = 12;
      const iv = setInterval(() => {
        const r = pool[Math.floor(Math.random() * pool.length)];
        stage.classList.remove('has-result');
        stage.innerHTML = `<span class="roller__media roller__media--spin">${visual(r)}</span>`;
        if (++n >= total) { clearInterval(iv); rollBtn.disabled = false; finish(); }
      }, 75);
    }

    function buildCalendar() {
      calTitle.textContent = `${year} 年 ${month + 1} 月`;
      const firstWeekday = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let html = '';
      for (let i = 0; i < firstWeekday; i++) html += `<span class="cal__cell cal__cell--empty"></span>`;
      for (let day = 1; day <= daysInMonth; day++) {
        const dk = key(new Date(year, month, day));
        const isToday = dk === todayKey;
        const isFuture = new Date(year, month, day) > today;
        const d = map[dk] ? dishById(map[dk]) : null;
        const thumb = d ? (d.img ? `<img src="${escapeHtml(d.img)}" alt="" loading="lazy"/>` : `<span class="cal__emoji">${escapeHtml(d.emoji)}</span>`)
                        : (isToday ? `<span class="cal__q">?</span>` : '');
        html += `<button type="button" class="cal__cell${isToday ? ' is-today' : ''}${isFuture ? ' cal__cell--future' : ''}" data-key="${dk}" ${d ? `data-dish="${escapeHtml(d.name)}"` : ''} ${isFuture ? 'disabled' : ''}>
          <span class="cal__day">${day}</span><span class="cal__thumb">${thumb}</span>
        </button>`;
      }
      calGrid.innerHTML = html;
      // 過去日格：點擊顯示那天吃啥；今天格：點擊＝擲骰
      calGrid.querySelectorAll('.cal__cell[data-dish]:not(.is-today)').forEach(c => {
        c.addEventListener('click', () => {
          const [, M, D] = c.dataset.key.split('-');
          calCaption.textContent = `${+M}/${+D} 吃了 · ${c.dataset.dish}`;
        });
      });
      const todayCell = calGrid.querySelector(`.cal__cell[data-key="${todayKey}"]`);
      if (todayCell) todayCell.addEventListener('click', () => roll());
    }
    function updateTodayCell() {
      const cell = calGrid.querySelector(`.cal__cell[data-key="${todayKey}"]`);
      const d = dishById(map[todayKey]); if (!cell || !d) return;
      cell.querySelector('.cal__thumb').innerHTML = d.img ? `<img src="${escapeHtml(d.img)}" alt=""/>` : `<span class="cal__emoji">${escapeHtml(d.emoji)}</span>`;
      cell.dataset.dish = d.name;
    }

    rollerDate.textContent = `${month + 1} 月 ${today.getDate()} 日（${'日一二三四五六'[today.getDay()]}）`;
    buildCalendar();
    if (stored[todayKey]) { renderResult(stored[todayKey]); rollBtn.textContent = '🎲 換一道'; }
    else { renderDice(); }
    rollBtn.addEventListener('click', roll);
  })();

  /* ---------- 0e. 美食護照集點（網格 + 統計 + 篩選 + 蓋章；跨元件同步） ---------- */
  (function buildPassport() {
    const grid = document.getElementById('pGrid');
    const pPoints = document.getElementById('pPoints');
    const pBarFill = document.getElementById('pBarFill');
    const pBarText = document.getElementById('pBarText');
    const filters = document.getElementById('pFilters');
    if (!grid) return;
    const TOTAL = DISHES.length;
    let filter = 'all';

    function cardHTML(d) {
      const eaten = isEaten(d.id);
      const media = d.img
        ? `<img src="${escapeHtml(d.img)}" alt="" loading="lazy"/>`
        : `<span class="pcard__emoji">${escapeHtml(d.emoji)}</span>`;
      return `<button type="button" class="pcard pcard--${d.cat}${eaten ? ' is-eaten' : ''}" data-id="${escapeHtml(d.id)}" data-cat="${d.cat}" aria-pressed="${eaten}" aria-label="${escapeHtml(d.name)}${eaten ? '，已蓋章' : '，點我蓋章'}">
        <span class="pcard__media">${media}</span>
        <span class="pcard__name">${escapeHtml(d.name)}</span>
        <span class="pcard__stamp" aria-hidden="true">吃過</span>
        <span class="pcard__hint" aria-hidden="true">點我蓋章</span>
      </button>`;
    }
    function applyFilter() {
      grid.querySelectorAll('.pcard').forEach(c => {
        c.style.display = (filter === 'all' || c.dataset.cat === filter) ? '' : 'none';
      });
    }
    function renderStats() {
      const n = passportCount();
      if (pPoints) pPoints.textContent = passportPoints();
      if (pBarText) pBarText.textContent = `已收集 ${n} / ${TOTAL}`;
      if (pBarFill) pBarFill.style.width = `${(n / TOTAL * 100).toFixed(1)}%`;
    }

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.pcard'); if (!card) return;
      toggleEaten(card.dataset.id);   // 寫入 + 廣播 passport:change（下方監聽負責刷新 UI）
    });
    if (filters) filters.addEventListener('click', (e) => {
      const b = e.target.closest('.pfilter'); if (!b) return;
      filter = b.dataset.filter;
      filters.querySelectorAll('.pfilter').forEach(x => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', String(on)); });
      applyFilter();
    });

    // 跨頁/跨元件同步：任一處蓋章 → 重繪統計 + 卡片狀態
    window.addEventListener('passport:change', () => {
      renderStats();
      grid.querySelectorAll('.pcard').forEach(c => {
        const e2 = isEaten(c.dataset.id);
        c.classList.toggle('is-eaten', e2);
        c.setAttribute('aria-pressed', String(e2));
      });
    });

    grid.innerHTML = DISHES.map(cardHTML).join('');
    applyFilter();
    renderStats();
  })();

  /* ---------- 1. Splash 任意點擊進入（fixed overlay，不影響下方 scroll） ---------- */
  const splash = document.getElementById('splash');
  function dismissSplash() {
    if (!splash || splash.classList.contains('is-leaving')) return;
    splash.classList.add('is-leaving');
    setTimeout(() => { splash.style.display = 'none'; }, 900);
  }
  if (splash) {
    splash.addEventListener('click', dismissSplash);
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) dismissSplash();
    }, { passive: true });
    document.addEventListener('keydown', (e) => {
      if (splash.classList.contains('is-leaving')) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') dismissSplash();
    });
  }

  /* ---------- 2. Navbar scroll 變色 + 區段高亮 ---------- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.navbar__menu a[href^="#"]');
  const sections = ['home', 'salty', 'sweet', 'drink', 'daily', 'passport', 'story', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 80) navbar.classList.add('is-solid');
    else navbar.classList.remove('is-solid');
    const y = window.scrollY + 120;
    let current = sections[0]?.id;
    for (const s of sections) {
      if (s.offsetTop <= y) current = s.id;
    }
    navLinks.forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === `#${current}`);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. 漢堡選單 ---------- */
  const toggle = document.getElementById('navToggle');
  if (toggle && navbar) {
    toggle.addEventListener('click', () => {
      const open = navbar.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    });
    document.querySelectorAll('.navbar__menu a').forEach(a => {
      a.addEventListener('click', () => {
        navbar.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 4. 搜尋功能（關鍵字 + 地點 → 店家結果卡；資料來自 data.js） ---------- */
  const kw = document.getElementById('searchKeyword');
  const locInput = document.getElementById('searchLocation');
  const searchForm = document.getElementById('searchForm');
  const searchOutput = document.getElementById('searchOutput');
  const resultsSection = document.getElementById('results');
  const resultsGrid = document.getElementById('resultsGrid');
  const resultsHead = document.getElementById('resultsHead');
  const resultsEmpty = document.getElementById('resultsEmpty');
  const resultsClear = document.getElementById('resultsClear');

  // 把查詢字展開成「原字 + 同義詞」
  function expandQuery(q) {
    const terms = [q];
    Object.keys(SYNONYMS).forEach(key => {
      if (q.includes(key)) terms.push(...SYNONYMS[key]);
    });
    return terms.map(t => t.toLowerCase());
  }

  function searchRestaurants(q, loc) {
    const needles = expandQuery(q);
    const locNeedle = loc.toLowerCase();
    return RESTAURANTS.filter(r => {
      const hayKw = (r.name + ' ' + r.dishes.join(' ') + ' ' + CAT_LABEL[r.category] + ' ' + r.note).toLowerCase();
      const hayLoc = (r.city + r.district).toLowerCase();
      const okKw = !q || needles.some(n => hayKw.includes(n));
      const okLoc = !loc || hayLoc.includes(locNeedle) || locNeedle.includes(r.city.toLowerCase()) || locNeedle.includes(r.district.toLowerCase());
      return okKw && okLoc;
    });
  }

  function runSearch(q, loc) {
    if (!resultsSection || !resultsGrid) return;
    if (!q && !loc) {
      if (searchOutput) {
        searchOutput.textContent = '請輸入美食關鍵字或地點。';
        searchOutput.style.color = '#ffb3a4';
      }
      return;
    }
    const hits = searchRestaurants(q, loc);
    const label = [q && `「${q}」`, loc && `${loc}`].filter(Boolean).join(' · ');

    resultsSection.hidden = false;
    resultsGrid.innerHTML = hits.map(renderCard).join('');

    if (hits.length === 0) {
      if (resultsHead) resultsHead.textContent = `找不到${label ? ` ${label} ` : ''}的店家`;
      if (resultsEmpty) {
        resultsEmpty.hidden = false;
        resultsEmpty.textContent = '換個關鍵字或地點試試，例如「牛肉麵」「珍奶」「信義」「台中」。';
      }
    } else {
      if (resultsHead) resultsHead.textContent = `找到 ${hits.length} 家${label ? ` ${label} ` : ''}的店家`;
      if (resultsEmpty) resultsEmpty.hidden = true;
    }
    if (searchOutput) {
      searchOutput.textContent = hits.length ? `已為你列出 ${hits.length} 家，往下看 ↓` : '';
      searchOutput.style.color = '';
    }
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      runSearch((kw?.value || '').trim(), (locInput?.value || '').trim());
    });
  }

  // 熱門標籤：填入關鍵字並直接送出搜尋
  document.querySelectorAll('.tags button[data-tag]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!kw) return;
      kw.value = btn.dataset.tag || '';
      runSearch(kw.value.trim(), (locInput?.value || '').trim());
    });
  });

  // 清除搜尋
  if (resultsClear) {
    resultsClear.addEventListener('click', () => {
      if (resultsSection) resultsSection.hidden = true;
      if (resultsGrid) resultsGrid.innerHTML = '';
      if (kw) kw.value = '';
      if (locInput) locInput.value = '';
      if (searchOutput) searchOutput.textContent = '';
      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- 5. Email 訂閱表單 ---------- */
  const contactForm = document.getElementById('contactForm');
  const contactOutput = document.getElementById('contactOutput');
  const contactEmail = document.getElementById('contactEmail');
  if (contactForm && contactOutput && contactEmail) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = contactEmail.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!v) {
        contactOutput.textContent = '請輸入 Email。';
        contactOutput.style.color = '#ffb3a4';
        return;
      }
      if (!ok) {
        contactOutput.textContent = `「${v}」不是合法的 Email 格式。`;
        contactOutput.style.color = '#ffb3a4';
        return;
      }
      contactOutput.textContent = `✓ 已將 ${v} 加入訂閱名單，下週見！`;
      contactOutput.style.color = '#d9a441';
      contactForm.reset();
    });
  }

  /* ---------- 6. Scroll reveal（菜卡已產生後才綁定） ---------- */
  const revealTargets = document.querySelectorAll(
    '.dish, .pillar, .story__copy, .story__visual, .cat__head, .contact__inner'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- 7. Hero 視差（滑鼠 + 滾動，圖層各跑各的速度） ---------- */
  const hero = document.querySelector('.hero');
  const parallaxEls = hero ? hero.querySelectorAll('[data-depth]') : [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const layerState = new Map();
  parallaxEls.forEach(el => {
    layerState.set(el, {
      depth: parseFloat(el.dataset.depth) || 0.05,
      mx: 0, my: 0, cx: 0, cy: 0, sy: 0,
    });
  });

  function applyLayerTransform(el) {
    const s = layerState.get(el);
    if (!s) return;
    el.style.setProperty('--px', `${s.cx.toFixed(2)}px`);
    el.style.setProperty('--py', `${(s.cy + s.sy).toFixed(2)}px`);
  }

  if (hero && parallaxEls.length && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    let mouseRaf = 0;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      parallaxEls.forEach(el => {
        const s = layerState.get(el);
        const range = s.depth * 220;
        s.mx = nx * range;
        s.my = ny * range;
      });
      if (!mouseRaf) mouseRaf = requestAnimationFrame(easeLoop);
    });
    hero.addEventListener('mouseleave', () => {
      parallaxEls.forEach(el => {
        const s = layerState.get(el);
        s.mx = 0; s.my = 0;
      });
      if (!mouseRaf) mouseRaf = requestAnimationFrame(easeLoop);
    });
    function easeLoop() {
      let stillMoving = false;
      parallaxEls.forEach(el => {
        const s = layerState.get(el);
        s.cx += (s.mx - s.cx) * 0.12;
        s.cy += (s.my - s.cy) * 0.12;
        if (Math.abs(s.mx - s.cx) > 0.1 || Math.abs(s.my - s.cy) > 0.1) stillMoving = true;
        applyLayerTransform(el);
      });
      mouseRaf = stillMoving ? requestAnimationFrame(easeLoop) : 0;
    }
  }

  if (hero && parallaxEls.length && !reduceMotion) {
    let scrollRaf = 0;
    const onParallaxScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          // clamp：Mac Safari 橡皮筋過捲時 r.top 會 > 0（progress 變負），不 clamp 圖層會跟著彈跳
          const progress = clamp(-r.top / window.innerHeight, 0, 1);
          parallaxEls.forEach(el => {
            const s = layerState.get(el);
            s.sy = -progress * s.depth * 400;
            applyLayerTransform(el);
          });
        }
        scrollRaf = 0;
      });
    };
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
    onParallaxScroll();
  }

  /* ---------- 8. 鍵盤無障礙：ESC 關閉漢堡選單 ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbar?.classList.contains('is-open')) {
      navbar.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  });
})();
