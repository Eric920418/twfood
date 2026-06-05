/* TAI FOOD · dish.js（詳情頁）
 * 讀網址 ?d=<id>，從 data.js 的 DISHES 找菜 → 組裝詳情排版（由上往下進場）。
 */
(() => {
  'use strict';

  /* 漢堡選單（與首頁一致） */
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  if (toggle && navbar) {
    toggle.addEventListener('click', () => {
      const open = navbar.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const root = document.getElementById('dishDetail');
  if (!root) return;

  const id = new URLSearchParams(location.search).get('d') || '';
  const dish = findDish(id);

  /* 找不到 → 友善錯誤頁 */
  if (!dish) {
    document.title = '找不到這道菜｜TAI FOOD';
    root.innerHTML = `
      <div class="ddetail__notfound">
        <p class="ddetail__notfound-emoji" aria-hidden="true">🍽️</p>
        <h1>找不到這道菜</h1>
        <p>網址中的「${escapeHtml(id || '（空白）')}」不在菜單裡，可能連結過期了。</p>
        <a class="ddetail__cta" href="index.html#top">← 回美食列表挑一道</a>
      </div>`;
    return;
  }

  document.title = `${dish.name}｜TAI FOOD`;

  const catLabel = CAT_LABEL[dish.cat] || '美食';
  let i = 0;

  /* 主視覺 + 基本資料 */
  const asm = (typeof ASSEMBLY !== 'undefined') ? ASSEMBLY[dish.id] : null;
  let media;
  if (asm) {
    // 特別組裝動畫：食材飛入聚攏 → 成品浮現
    const base = `assets/foods/salty/${encodeURIComponent(dish.id)}/`;
    const pieces = asm.pieces.map(p =>
      `<img class="assemble__piece" alt="" aria-hidden="true" loading="eager"
         style="--tx:${p.tx};--ty:${p.ty};--rot:${p.rot};--d:${p.d}ms"
         src="${base}${encodeURIComponent(p.file)}.png"/>`
    ).join('');
    media = `
      <div class="dhero__media dhero__media--assemble">
        <div class="assemble" id="assembleStage">
          <img class="assemble__result" src="${escapeHtml(asm.result)}" alt="${escapeHtml(dish.name)}（組裝完成）"/>
          ${pieces}
        </div>
        <button type="button" id="assembleReplay" class="assemble__replay">🍚 重新組裝</button>
      </div>`;
  } else if (dish.img) {
    media = `<div class="dhero__media"><img src="${escapeHtml(dish.img)}" alt="${escapeHtml(dish.name)}"/></div>`;
  } else {
    media = `<div class="dhero__media dhero__media--emoji"><span aria-hidden="true">${escapeHtml(dish.emoji)}</span></div>`;
  }

  const tagHtml = (dish.tags || []).slice(0, 8)
    .map(t => `<span class="dchip">${escapeHtml(t)}</span>`).join('');

  const hero = `
    <section class="dhero dhero--${escapeHtml(dish.cat)}" style="--i:${i++}">
      ${media}
      <div class="dhero__info">
        <p class="dhero__num">No.${escapeHtml(dish.num)}</p>
        <h1 class="dhero__name">${escapeHtml(dish.name)}</h1>
        <p class="dhero__en">${escapeHtml(dish.en)}</p>
        <p class="dhero__meta">
          <span class="dcat dcat--${escapeHtml(dish.cat)}">${escapeHtml(catLabel)}</span>
          <span class="dprice">${escapeHtml(dish.price)}</span>
        </p>
        <p class="dhero__desc">${escapeHtml(dish.desc)}</p>
        <div class="dhero__tags">${tagHtml}</div>
        <button type="button" id="eatBtn" class="dhero__eat${isEaten(dish.id) ? ' is-eaten' : ''}" aria-pressed="${isEaten(dish.id)}"></button>
      </div>
    </section>`;

  /* 食材拆解（僅鹹點且有分層） */
  const ings = dish.cat === 'salty' ? (INGREDIENTS[dish.id] || []) : [];
  const ingHtml = ings.length ? `
    <section class="dsec" style="--i:${i++}">
      <h2 class="dsec__h">食材拆解</h2>
      <ul class="ding__grid">
        ${ings.map(f => {
          const label = f.replace(/_\d+$/, '');
          const src = `assets/foods/salty/${encodeURIComponent(dish.id)}/${encodeURIComponent(f)}.png`;
          return `<li class="ding"><span class="ding__disc"><img src="${src}" alt="${escapeHtml(label)}" loading="lazy"/></span><span class="ding__label">${escapeHtml(label)}</span></li>`;
        }).join('')}
      </ul>
    </section>` : '';

  /* 哪裡吃得到（重用 data.js 的 renderCard） */
  const stores = storesForDish(dish.name);
  const storeHtml = `
    <section class="dsec" style="--i:${i++}">
      <h2 class="dsec__h">哪裡吃得到</h2>
      ${stores.length
        ? `<div class="dstores__grid">${stores.map(renderCard).join('')}</div>`
        : `<p class="dsec__empty">目前地圖上還沒有收錄賣「${escapeHtml(dish.name)}」的店家——之後會持續補上。</p>`}
    </section>`;

  /* 你可能也想吃（同類其他菜，最多 4 道） */
  const related = DISHES.filter(d => d.cat === dish.cat && d.id !== dish.id).slice(0, 4);
  const relatedHtml = related.length ? `
    <section class="dsec" style="--i:${i++}">
      <h2 class="dsec__h">你可能也想吃</h2>
      <div class="drel__grid">
        ${related.map(d => {
          const m = d.img
            ? `<img src="${escapeHtml(d.img)}" alt="${escapeHtml(d.name)}" loading="lazy"/>`
            : `<span class="drel__emoji" aria-hidden="true">${escapeHtml(d.emoji)}</span>`;
          return `<a class="drel" href="dish.html?d=${encodeURIComponent(d.id)}">
            <span class="drel__media">${m}</span>
            <span class="drel__name">${escapeHtml(d.name)}</span>
            <span class="drel__price">${escapeHtml(d.price)}</span>
          </a>`;
        }).join('')}
      </div>
    </section>` : '';

  root.innerHTML = hero + ingHtml + storeHtml + relatedHtml;

  /* 由上往下進場：下一幀加 is-in 觸發 stagger */
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-in')));

  /* 美食護照打卡：「我吃過了」按鈕 */
  const eatBtn = document.getElementById('eatBtn');
  if (eatBtn) {
    const sync = () => {
      const on = isEaten(dish.id);
      eatBtn.classList.toggle('is-eaten', on);
      eatBtn.setAttribute('aria-pressed', String(on));
      eatBtn.textContent = on ? '★ 已收藏 · 點此取消' : '✓ 我吃過了（+10 點）';
    };
    sync();
    eatBtn.addEventListener('click', () => { toggleEaten(dish.id); sync(); });
  }

  /* 組裝動畫：播放 / 重播 */
  const stage = document.getElementById('assembleStage');
  if (stage) {
    const play = () => {
      stage.classList.remove('is-playing');
      void stage.offsetWidth;          // 強制 reflow，讓動畫可重觸發
      stage.classList.add('is-playing');
    };
    // 進場後自動播一次
    setTimeout(play, 250);
    document.getElementById('assembleReplay')?.addEventListener('click', play);
  }
})();
