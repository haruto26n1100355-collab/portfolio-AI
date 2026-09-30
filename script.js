// ---------- スクロールでふわっと表示(画面に入るたびに毎回) ----------
  // 画面に入ったら .in を付けて表示、画面から完全に出たら .in を外してリセット
  const revealEls = document.querySelectorAll(
    '#view-portfolio .hero > *, ' +
    '#view-portfolio .section-head, ' +
    '#view-portfolio .avatar-blob, ' +
    '#view-portfolio .about-text, ' +
    '#view-portfolio .board > .card, ' +
    '#view-portfolio footer'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    let n = 0;
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.intersectionRatio >= 0.15){
        // 同時に見えた要素は少しずつ時間差をつけて表示
        el.style.setProperty('--d', (n++ * 100) + 'ms');
        el.classList.add('in');
      } else if (!entry.isIntersecting){
        // 完全に画面外に出たらリセット(次に入ったときまた動く)
        el.style.setProperty('--d', '0ms');
        el.classList.remove('in');
      }
    });
  }, { threshold: [0, 0.15], rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  // ---------- Blender works summary: 同じリンク内での画面切り替え ----------
  // data-tag="blender" が付いたカードを #blenderSource（非表示）から集めて、
  // Blenderまとめ画面にだけ複製表示します。成果物セクションには一切表示されません。
  const blenderBoard = document.getElementById('blenderBoard');
  const viewPortfolio = document.getElementById('view-portfolio');
  const viewBlender = document.getElementById('view-blender');

  function buildBlenderBoard(){
    blenderBoard.innerHTML = '';
    const blenderCards = document.querySelectorAll('#blenderSource > .card[data-tag="blender" i]');

    if (blenderCards.length === 0){
      blenderBoard.innerHTML = '<p class="blender-empty">まだBlender作品が登録されていません。</p>';
      return;
    }

    blenderCards.forEach((card) => {
      const clone = card.cloneNode(true);
      if (!clone.classList.contains('card-intro')){
        clone.addEventListener('click', () => openWorkModal(clone));
      }
      blenderBoard.appendChild(clone);
    });
  }

  // ---------- Work modal: 作品タイトルを押すと詳細をポップアップ表示 ----------
  const workModalBackdrop = document.getElementById('workModalBackdrop');
  const workModalTitle = document.getElementById('workModalTitle');
  const workModalImage = document.getElementById('workModalImage');
  const workModalVideo = document.getElementById('workModalVideo');
  const workModalDifficult = document.getElementById('workModalDifficult');
  const workModalFavorite = document.getElementById('workModalFavorite');
  const workModalCount = document.getElementById('workModalCount');
  const workModalBox = document.getElementById('workModal');
  const workModalPrev = document.getElementById('workModalPrev');
  const workModalNext = document.getElementById('workModalNext');
  let modalCards = [];   // ポップアップで行き来できる作品の一覧(Blenderまとめ画面のカード)
  let modalIndex = -1;   // いま開いている作品の番号

  function openWorkModal(card){
    // 前後移動のために、いま画面に並んでいる作品の一覧と、開いた作品の位置を控えておく
    modalCards = Array.from(blenderBoard.querySelectorAll('.card:not(.card-intro)'));
    modalIndex = modalCards.indexOf(card);
    const title = card.querySelector('.card-title')?.textContent || '';
    workModalTitle.textContent = title;

    const cardVideo = card.querySelector('.card-thumb video');
    const cardImg = card.querySelector('.card-thumb img');

    if (cardVideo){
      workModalVideo.src = cardVideo.src;
      workModalVideo.hidden = false;
      workModalImage.hidden = true;
      workModalImage.src = '';
      workModalVideo.play().catch(() => {});
    } else if (cardImg){
      workModalImage.src = cardImg.src;
      workModalImage.alt = cardImg.alt || title;
      workModalImage.hidden = false;
      workModalVideo.hidden = true;
      workModalVideo.removeAttribute('src');
    } else {
      workModalImage.src = '';
      workModalImage.hidden = true;
      workModalVideo.hidden = true;
      workModalVideo.removeAttribute('src');
    }

    workModalDifficult.textContent = card.dataset.difficult || '';
    workModalFavorite.textContent = card.dataset.favorite || '';
    const many = modalCards.length > 1 && modalIndex >= 0;
    workModalCount.textContent = many ? (modalIndex + 1) + ' / ' + modalCards.length : '';
    workModalPrev.hidden = !many;
    workModalNext.hidden = !many;
    workModalBox.scrollTop = 0;
    workModalBackdrop.classList.add('is-open');
  }

  // 前(-1)/次(+1)の作品へ。端まで行ったら反対側にぐるっと回る
  function stepWorkModal(dir, event){
    if (event) event.stopPropagation();
    if (modalCards.length < 2 || modalIndex < 0) return;
    const next = (modalIndex + dir + modalCards.length) % modalCards.length;
    openWorkModal(modalCards[next]);
  }

  function closeWorkModal(event){
    if (event) event.stopPropagation();
    workModalBackdrop.classList.remove('is-open');
    workModalVideo.pause();
    workModalVideo.removeAttribute('src');
    workModalVideo.load();
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeWorkModal();
    // ポップアップを開いている間だけ ← → で前後の作品へ(動画を操作中は動画に任せる)
    if (workModalBackdrop.classList.contains('is-open') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')){
      if (e.target && e.target.tagName === 'VIDEO') return;
      e.preventDefault();
      stepWorkModal(e.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  // ---------- Website case study: 作品ごとのケーススタディページ ----------
  // ★ サイトが増えたら、このオブジェクトに項目を追加するだけでOKです。
  const websiteData = {
    vscode: {
      title: 'ガチャ記録サイト',
      tagline: 'ClaudeというAIを主に使って作成したサイト',
      heroImage: '',
      intro: [
        '',
        'ゼンゼロのガチャの記録をするサイトを作りました！使いやすさや見やすさを意識して制作しました！'
      ],
      features: [
        'すり抜け率や最高ランクの平均連数を%やグラフで見れる',
        '見やすいようにバージョンを分けて保存できます!(メモも残せるよ!)',
        '天井ガイドといって天井やキャラ、武器の確率などの細かな詳細が書いてあるよ!'
      ],
      tech: ['HTML', 'CSS', 'JavaScript', 'JSON', 'Ruby'],
      url: 'https://zzz-gacha-tracker.web.app'
    }
  };

  const viewWebsite = document.getElementById('view-website');
  const websiteTitle = document.getElementById('websiteTitle');
  const websiteTagline = document.getElementById('websiteTagline');
  const websiteHero = document.getElementById('websiteHero');
  const websiteIntro = document.getElementById('websiteIntro');
  const websiteFeatureList = document.getElementById('websiteFeatureList');
  const websiteTechList = document.getElementById('websiteTechList');
  const websiteVisitBtn = document.getElementById('websiteVisitBtn');

  function showWebsiteView(id, instant){
    const data = websiteData[id];
    if (!data) return;
    // カードを押して開くときは「ピットイン中…」を挟む(戻る/進むボタンや直接アクセスのときは挟まない)
    if (!instant && window.pitRun){ window.pitRun(() => showWebsiteView(id, true)); return; }

    websiteTitle.textContent = data.title;
    websiteTagline.textContent = data.tagline || '';

    if (data.heroImage){
      websiteHero.src = data.heroImage;
      websiteHero.alt = data.title;
      websiteHero.hidden = false;
    } else {
      websiteHero.hidden = true;
    }

    websiteIntro.innerHTML = '';
    (data.intro || []).forEach((p) => {
      const el = document.createElement('p');
      el.textContent = p;
      websiteIntro.appendChild(el);
    });

    websiteFeatureList.innerHTML = '';
    (data.features || []).forEach((f) => {
      const li = document.createElement('li');
      li.textContent = f;
      websiteFeatureList.appendChild(li);
    });

    websiteTechList.innerHTML = '';
    (data.tech || []).forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      websiteTechList.appendChild(li);
    });

    websiteVisitBtn.href = data.url || '#';

    viewPortfolio.style.display = 'none';
    viewBlender.style.display = 'none';
    viewWebsite.style.display = 'block';
    window.scrollTo(0, 0);
    history.pushState({ view: 'website', id }, '', '#website-' + id);
  }

  function showBlenderView(instant){
    if (!instant && window.pitRun){ window.pitRun(() => showBlenderView(true)); return; }
    buildBlenderBoard();
    viewPortfolio.style.display = 'none';
    viewWebsite.style.display = 'none';
    viewBlender.style.display = 'block';
    window.scrollTo(0, 0);
    history.pushState({ view: 'blender' }, '', '#blender-page');
  }

  function showPortfolioView(instant){
    // Blender/サイト紹介の画面から戻るときだけ「ピットイン中…」を挟む(About などのページ内リンクでは出さない)
    if (!instant && viewPortfolio.style.display === 'none' && window.pitRun){
      window.pitRun(() => showPortfolioView(true));
      return;
    }
    viewBlender.style.display = 'none';
    viewWebsite.style.display = 'none';
    viewPortfolio.style.display = 'block';
    window.scrollTo(0, 0);
    history.pushState({ view: 'portfolio' }, '', window.location.pathname + window.location.search);
  }

  // URLに #blender-page や #website-xxx が付いた状態で開かれた場合は、最初からその画面を表示
  if (window.location.hash === '#blender-page'){
    showBlenderView(true);
  } else if (window.location.hash.startsWith('#website-')){
    showWebsiteView(window.location.hash.replace('#website-', ''), true);
  }

  // ブラウザの「戻る/進む」ボタンにも対応
  window.addEventListener('popstate', () => {
    if (window.location.hash === '#blender-page'){
      showBlenderView(true);
    } else if (window.location.hash.startsWith('#website-')){
      showWebsiteView(window.location.hash.replace('#website-', ''), true);
    } else {
      showPortfolioView();
    }
  });

  // ---------- タイヤのカーソル ----------
  // ・マウスを動かしても、タイヤは回らない。速く動かすと進行方向に少し伸びる
  // ・速く動かすと、うしろにタイヤ痕がうっすら残って消える
  // ・リンクやカードの上に乗ると、ひと回り大きくなって、黄色→赤(ソフトタイヤ)に変わり、十字が「×」に回る
  // ・クリックすると、ぎゅっと縮んで、リング状の波紋が広がる
  // ・長押し: だんだん速く回る + 火花 + 白煙 + 熱で赤く光る(離すと勢いが残って止まる)
  // ・反応するのは「マウス」だけ。スマホやタッチでは何もせず、いつもの標準カーソルのままです
  // ・当たり判定は十字の真ん中。文字入力欄の上では、自動で標準の文字カーソルに戻ります
  (function(){
    const SPIN = {
      delay: 0.18,      // 長押しと判定するまでの時間(秒)。ふつうのクリックでは動かない
      rampTime: 3.5,    // 最高速度に達するまでの時間(秒)
      maxSpeed: 2400,   // 最高速度(度/秒)。2400 ≒ 1秒に6.7回転
      curve: 1.4,       // 大きいほど「最初はゆっくり、あとでぐんぐん速く」
      friction: 1.6,    // 離したあとの減速の強さ(大きいほど早く止まる)
      sparkRate: 80,    // 最高速度のときの火花の数(個/秒)
      sparkMinSpeed: 200,// この速さ(度/秒)を超えたら火花が出はじめる
      dragCancel: 8     // 押してすぐ(長押しの前に)これ以上(px)動かしたら「ふつうの範囲選択」とみなして、回さない
    };
    const FX = {
      radius: 24,        // タイヤの半径(px)。転がる回転量の計算に使う
      stretchMax: 0.15,  // 速く動かしたときの伸び(0.15 = 最大15%)
      trailSpeed: 380,   // この速さ(px/秒)を超えるとタイヤ痕が出る
      trailLife: 0.7,    // タイヤ痕が消えるまでの時間(秒)
      trailGap: 7,       // タイヤ痕の左右の間隔(px)
      trailAlpha: 0.2,   // タイヤ痕の濃さ(0〜1)
      smokeSpeed: 500,   // この回転の速さ(度/秒)を超えると白煙が出る
      smokeRate: 90,     // 最高速度のときの白煙の数(個/秒)
      smokeMax: 160      // 白煙の最大数
    };
    const RING = 21;    // 火花・白煙が出る位置(タイヤの外周の半径 px)
    const CLICKABLE = 'a, button, [role="button"], summary, label, .card.is-linked, .work-modal-close, .blender-page #blenderBoard .card:not(.card-intro)';
    const TEXTY = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

    // ---- タイヤ本体(DOM) ----
    const cur = document.createElement('div');
    cur.className = 'tire-cursor';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="tire-stretch"><div class="tire-scale">' +
      '<svg class="tire-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19.75" fill="none" stroke="#0a0909" stroke-width="8.5"/> <circle cx="24" cy="24" r="22.7" fill="none" stroke="#2b2522" stroke-width="2.3" stroke-dasharray="3 1.754"/> <circle cx="24" cy="24" r="20.9" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="0.7"/> <circle class="tire-arc" cx="24" cy="24" r="20.17" fill="none" style="stroke:var(--compound,#ecd63f)" stroke-width="1.93" stroke-dasharray="31.13 32.24" stroke-miterlimit="1.2"/> <circle cx="24" cy="24" r="17.6" fill="none" stroke="rgba(255,244,224,0.2)" stroke-width="1" stroke-dasharray="7.2 1.6 2.2 1.6 3.6 2.23"/> <circle cx="24" cy="24" r="15.2" fill="none" stroke="#8b8178" stroke-width="0.9"/> <circle cx="24" cy="24" r="14.4" fill="none" stroke="rgba(0,0,0,0.55)" stroke-width="0.8"/> <circle cx="24" cy="24" r="13.3" fill="none" stroke="rgba(255,244,224,0.55)" stroke-width="1.3" stroke-dasharray="0.9 6.064"/></svg>' + '<svg class="tire-shine" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="tsg" gradientUnits="userSpaceOnUse" x1="3.9" y1="16.7" x2="16.7" y2="3.9"><stop offset="0" stop-color="#fff" stop-opacity="0.04"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.34"/><stop offset="1" stop-color="#fff" stop-opacity="0.04"/></linearGradient></defs> <path d="M3.9 16.7 A21.4 21.4 0 0 1 16.7 3.9" fill="none" stroke="url(#tsg)" stroke-width="1.8" stroke-linecap="round"/></svg>' + '<svg class="tire-cross" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="tcg" gradientUnits="userSpaceOnUse" x1="16.46" y1="31.18" x2="31.54" y2="16.1"><stop offset="0" stop-color="#ec6419"/><stop offset="1" stop-color="#b64d98"/></linearGradient></defs> <g fill="url(#tcg)" stroke="rgba(0,0,0,0.45)" stroke-width="0.6"><rect x="22.54" y="16.1" width="2.93" height="15.08"/><rect x="16.46" y="22.53" width="15.08" height="2.93"/></g></svg>' + '</div></div>';
    document.body.appendChild(cur);
    const stretchEl = cur.querySelector('.tire-stretch');
    const ringEl = cur.querySelector('.tire-ring');

    // ---- 火花・白煙・タイヤ痕を描くキャンバス ----
    const cv = document.createElement('canvas');
    cv.className = 'spark-canvas';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    function fitCanvas(){
      const dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fitCanvas();
    window.addEventListener('resize', fitCanvas);

    let mx = -100, my = -100, px = -100, py = -100;   // いまの位置 / 前のフレームの位置
    let seen = false, inside = true, target = null, recheck = false;
    let pressed = false, active = false, looping = false;
    let holdStart = 0, last = 0;
    let startX = 0, startY = 0, cancelled = false;   // cancelled: この押下は「ふつうのドラッグ」なので回さない
    let angle = 0, omega = 0;
    let speedS = 0, stretchK = 0, dirX = 1, dirY = 0, lastHeat = -1;
    let sparks = [], smoke = [], trail = [];

    function updateState(){
      const t = target;
      const texty = !!(t && t.closest && t.closest(TEXTY));
      cur.classList.toggle('on', seen && inside && !texty);
      cur.classList.toggle('is-hover', !!(t && t.closest && t.closest(CLICKABLE)));
    }

    function setPointer(e){
      mx = e.clientX; my = e.clientY;
      target = e.target;
      inside = true;
      if (!seen){
        seen = true;
        px = mx; py = my;
        document.documentElement.classList.add('cursor-js');   // ここから標準カーソルを消して、タイヤに切り替える
      }
      cur.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';   // 位置だけは、遅れないようイベント内で直接動かす
      updateState();
    }

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      setPointer(e);
      startLoop();
      // 左ボタンがもう押されていないのに「押している」扱いなら解除(ボタンを離したのを取りこぼした場合の保険)
      if (pressed && (e.buttons & 1) === 0) release();
      // 長押しになる前に大きく動かした = 文字の範囲選択などふつうのドラッグ。回転はさせない
      if (pressed && !active && !cancelled &&
          Math.hypot(e.clientX - startX, e.clientY - startY) > SPIN.dragCancel) cancelled = true;
    }, { passive: true });
    // ブラウザ標準のドラッグ(画像やリンクのドラッグなど)中は pointermove が止まるので、こちらで位置を追う
    window.addEventListener('dragover', (e) => {
      mx = e.clientX; my = e.clientY;
      cur.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    }, { passive: true });
    // ウィンドウの外に出たらタイヤを隠す / スクロールしたら、指している場所を調べ直す
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget){ inside = false; updateState(); } });
    window.addEventListener('scroll', () => { if (seen){ recheck = true; startLoop(); } }, { passive: true, capture: true });

    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      setPointer(e);
      if (active) deactivate();   // 止まりかけの回転が残っていたら、すぐ戻してから新しく数え直す
      pressed = true;
      cancelled = false;
      startX = e.clientX; startY = e.clientY;
      holdStart = performance.now();
      cur.classList.add('is-press');
      ping();
      startLoop();
    }, { passive: true });

    function release(){ pressed = false; cur.classList.remove('is-press'); }
    // ブラウザが途中でドラッグ操作を横取りした場合(pointercancel)は、固まって見えないよう、すぐ回転を止める
    function abort(){ release(); if (active) deactivate(); }
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('mouseup', release, { passive: true });
    window.addEventListener('pointercancel', abort, { passive: true });
    window.addEventListener('blur', abort);
    window.addEventListener('contextmenu', abort);
    document.addEventListener('visibilitychange', () => { if (document.hidden) abort(); });

    // 回っている間は、文字の範囲選択と、画像・リンクのドラッグを起こさない
    document.addEventListener('selectstart', (e) => { if (active) e.preventDefault(); });
    document.addEventListener('dragstart', (e) => { if (active) e.preventDefault(); });

    // クリックの波紋(リンクの上なら赤、それ以外は黄色)
    function ping(){
      const p = document.createElement('div');
      p.className = 'tire-ping' + (cur.classList.contains('is-hover') ? ' hot' : '');
      p.style.left = mx + 'px';
      p.style.top = my + 'px';
      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }

    function startLoop(){
      if (looping) return;
      looping = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }

    // ---- 火花(長押しで回転が速いとき) ----
    function emitSparks(dt){
      const k = Math.min(1, omega / SPIN.maxSpeed);
      if (omega < SPIN.sparkMinSpeed) return;
      let n = Math.pow(k, 1.2) * SPIN.sparkRate * dt;   // 1フレームに出す数(小数は確率で切り上げ)
      let count = Math.floor(n);
      if (Math.random() < n - count) count++;
      const wRad = omega * Math.PI / 180;
      for (let i = 0; i < count && sparks.length < 260; i++){
        const a = Math.random() * Math.PI * 2;
        const tangent = wRad * RING * 0.28 * (0.6 + Math.random() * 0.8);   // 回転方向(時計回り)に飛ぶ
        const radial = 20 + Math.random() * 70;
        sparks.push({
          x: mx + Math.cos(a) * RING,
          y: my + Math.sin(a) * RING,
          vx: -Math.sin(a) * tangent + Math.cos(a) * radial,
          vy:  Math.cos(a) * tangent + Math.sin(a) * radial,
          life: 0,
          max: 0.35 + Math.random() * 0.45
        });
      }
    }
    function drawSparks(dt){
      if (!sparks.length) return;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      const drag = Math.exp(-2.2 * dt);
      for (let i = sparks.length - 1; i >= 0; i--){
        const s = sparks[i];
        s.life += dt;
        if (s.life >= s.max){ sparks.splice(i, 1); continue; }
        const qx = s.x, qy = s.y;
        s.vx *= drag; s.vy = s.vy * drag + 700 * dt;   // 空気抵抗 + 重力
        s.x += s.vx * dt; s.y += s.vy * dt;
        const u = s.life / s.max;                      // 0(出た瞬間) → 1(消える)
        ctx.strokeStyle = 'hsla(' + (52 - u * 46) + ',100%,' + (88 - u * 34) + '%,' + (1 - u) + ')';
        ctx.lineWidth = 2 - u * 1.2;
        ctx.beginPath();
        ctx.moveTo(qx, qy);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // ---- 白煙(長押しで回転が速いとき。タイヤの下からもわっと上がる) ----
    function emitSmoke(dt){
      if (omega < FX.smokeSpeed) return;
      const k = Math.min(1, omega / SPIN.maxSpeed);
      let n = k * FX.smokeRate * dt;
      let count = Math.floor(n);
      if (Math.random() < n - count) count++;
      for (let i = 0; i < count && smoke.length < FX.smokeMax; i++){
        smoke.push({
          x: mx + (Math.random() - 0.5) * 26,
          y: my + RING * 0.85,
          vx: (Math.random() - 0.5) * 60,
          vy: -(18 + Math.random() * 50),
          r: 7 + Math.random() * 5,
          life: 0,
          max: 0.9 + Math.random() * 0.8
        });
      }
    }
    function drawSmoke(dt){
      for (let i = smoke.length - 1; i >= 0; i--){
        const s = smoke[i];
        s.life += dt;
        if (s.life >= s.max){ smoke.splice(i, 1); continue; }
        s.x += s.vx * dt; s.y += s.vy * dt;
        s.vx *= Math.exp(-0.8 * dt);
        const u = s.life / s.max;
        const r = s.r + u * 34;
        const a = Math.pow(1 - u, 1.5) * 0.5;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
        g.addColorStop(0, 'rgba(232,226,220,' + a.toFixed(3) + ')');
        g.addColorStop(1, 'rgba(232,226,220,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ---- タイヤ痕(速く動かしたとき、うしろに左右2本のラインがうっすら残る) ----
    function drawTrail(now){
      while (trail.length && (now - trail[0].t) / 1000 > FX.trailLife) trail.shift();
      if (trail.length < 2) return;
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
      for (let i = 1; i < trail.length; i++){
        const a = trail[i - 1], b = trail[i];
        if (Math.hypot(b.x - a.x, b.y - a.y) > 60) continue;   // 大きく飛んだところはつながない
        const age = (now - b.t) / 1000 / FX.trailLife;
        const al = (1 - age) * FX.trailAlpha * b.a;
        if (al < 0.004) continue;
        ctx.strokeStyle = 'rgba(255,244,224,' + al.toFixed(3) + ')';
        for (let s = -1; s <= 1; s += 2){
          ctx.beginPath();
          ctx.moveTo(a.x - a.dy * FX.trailGap * s, a.y + a.dx * FX.trailGap * s);
          ctx.lineTo(b.x - b.dy * FX.trailGap * s, b.y + b.dx * FX.trailGap * s);
          ctx.stroke();
        }
      }
    }

    function activate(){
      active = true;
      const sel = window.getSelection && window.getSelection();
      if (sel && sel.removeAllRanges) sel.removeAllRanges();   // すでに選ばれている文字があれば解除(文字のドラッグが始まるのを防ぐ)
      document.documentElement.classList.add('cursor-spin');   // 回っている間は文字を選択できなくする
    }
    function deactivate(){
      active = false;
      omega = 0;
      document.documentElement.classList.remove('cursor-spin');
    }

    function frame(now){
      const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));   // 動きが重い環境でも、時間どおりに進める
      last = now;
      const hold = (now - holdStart) / 1000;

      if (recheck){   // スクロールで下の要素が変わったときの、ホバー表示の更新
        recheck = false;
        const el = document.elementFromPoint(mx, my);
        if (el){ target = el; updateState(); }
      }

      // 動いた距離 → 転がる回転 / 進む速さ / 進む向き
      const dx = mx - px, dy = my - py;
      px = mx; py = my;
      const dist = Math.hypot(dx, dy);
      speedS += (dist / dt - speedS) * Math.min(1, dt * 14);
      if (dist > 0.5){
        dirX += (dx / dist - dirX) * 0.35;
        dirY += (dy / dist - dirY) * 0.35;
        const n = Math.hypot(dirX, dirY) || 1;
        dirX /= n; dirY /= n;
      }

      // 長押しの回転
      if (!(pressed && cancelled && !active)){   // ふつうのドラッグ中は回さない
        if (pressed){
          if (!active && !cancelled && hold > SPIN.delay) activate();
          if (active){
            const t = Math.min(1, (hold - SPIN.delay) / SPIN.rampTime);
            omega = SPIN.maxSpeed * Math.pow(t, SPIN.curve);
          }
        } else if (active){
          omega *= Math.exp(-SPIN.friction * dt);      // 勢いが残って止まっていく
        }
      }
      if (!pressed && active && omega < 25) deactivate();

      // タイヤの回転 = 長押しの回転のみ(マウスを動かしても回らない)
      angle = (angle + omega * dt) % 360;
      ringEl.style.transform = 'rotate(' + angle.toFixed(2) + 'deg)';

      // 速いほど進行方向にむにっと伸びる
      const kTarget = Math.min(FX.stretchMax, speedS / 10000);
      stretchK += (kTarget - stretchK) * Math.min(1, dt * 12);
      if (stretchK > 0.004){
        const ang = Math.atan2(dirY, dirX) * 57.2958;
        stretchEl.style.transform = 'rotate(' + ang.toFixed(1) + 'deg) scale(' + (1 + stretchK).toFixed(3) + ',' + (1 - stretchK * 0.6).toFixed(3) + ') rotate(' + (-ang).toFixed(1) + 'deg)';
      } else if (stretchEl.style.transform){
        stretchEl.style.transform = '';
      }

      // 熱(長押しで速く回るほど、赤く光る)
      const heat = Math.pow(Math.min(1, omega / SPIN.maxSpeed), 1.1);
      if (Math.abs(heat - lastHeat) > 0.01){
        lastHeat = heat;
        cur.style.setProperty('--heat', heat.toFixed(3));
        cur.classList.toggle('hot', heat > 0.03);
      }

      // タイヤ痕の点を追加
      if (seen && inside && speedS > FX.trailSpeed && dist > 1){
        trail.push({ x: mx, y: my, t: now, dx: dirX, dy: dirY, a: Math.min(1, speedS / 1400) });
        if (trail.length > 160) trail.shift();
      }

      if (active) { emitSparks(dt); emitSmoke(dt); }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawSmoke(dt);
      drawTrail(now);
      drawSparks(dt);

      // なにも動いていなければ、ループを止める(次にマウスを動かしたら自動で再開)
      if (!pressed && !active && speedS < 5 && stretchK < 0.004 && !recheck &&
          !sparks.length && !smoke.length && !trail.length){
        looping = false;
        return;
      }
      requestAnimationFrame(frame);
    }
  })();

  // ---------- スクロール進捗バー(セクションごとに LAP が進む) ----------
  // ・Home(最初のページ)= LAP 1、About = LAP 2、Works = LAP 3。一番下まで来ると「FINISH 🏁」
  // ・周回を増やしたいときは、下の SECTION_IDS にセクションの id を足すだけ(HTML側の id は既存のものを使用)
  // ・車は上端のコースを、スクロール量に合わせて左から右へ走る
  (function(){
    const bar = document.getElementById('lapBar');
    const tag = document.getElementById('lapTag');
    const num = document.getElementById('lapNum');
    const car = document.getElementById('lapCar');
    const track = bar && bar.querySelector('.lap-track');
    if (!bar || !tag || !num || !car || !track) return;

    // ヒーローの車と同じ絵を使う(左向きに反転させているだけなので、そのまま右向きで使える)
    const heroCar = document.querySelector('#view-portfolio .hero-car');
    if (heroCar && heroCar.src) car.src = heroCar.src; else car.style.display = 'none';

    const SECTION_IDS = ['top', 'about', 'works'];   // 上から順に LAP 1, 2, 3
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    const LAPS = sections.length;
    const TRIGGER = 0.4;   // 画面の上から40%の位置を、セクションが越えたら次の周回

    let tops = [];         // 各セクションの、ページ上端からの位置(px)
    let ticking = false;

    // セクションの位置を測り直し、周回の区切り(目印)をコースに並べる
    function layout(){
      tops = sections.map((el) => el.getBoundingClientRect().top + window.scrollY);
      track.querySelectorAll('.lap-tick').forEach((t) => t.remove());
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      for (let i = 1; i < LAPS; i++){
        const at = Math.min(1, Math.max(0, (tops[i] - window.innerHeight * TRIGGER) / max));
        const tick = document.createElement('i');
        tick.className = 'lap-tick';
        tick.style.left = (at * 100).toFixed(2) + '%';
        track.appendChild(tick);
      }
    }

    function update(){
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.setProperty('--p', p.toFixed(4));

      const finished = p >= 0.995;
      bar.classList.toggle('is-finish', finished);
      if (finished){
        tag.textContent = 'FINISH';
        num.textContent = '\u{1F3C1}';
        return;
      }
      const ref = window.scrollY + window.innerHeight * TRIGGER;
      let lap = 1;
      for (let i = 0; i < LAPS; i++){ if (tops[i] <= ref) lap = i + 1; }
      tag.textContent = 'LAP';
      num.textContent = lap + '/' + LAPS;
    }
    function onScroll(){
      if (!ticking){ ticking = true; requestAnimationFrame(update); }
    }
    function relayout(){ layout(); onScroll(); }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', relayout);
    window.addEventListener('load', relayout);   // 画像や文字の読み込みで高さが変わるので、終わったら測り直す
    relayout();
  })();

  // ---------- 読み込み中の「ピットイン中…」画面(円形の進捗バー) ----------
  // ・読み込みの進み具合(画像を読み終えた数)に合わせて、円形のバーが伸びる(0→100%は約0.2秒)
  // ・ページ全体の読み込みが終わると100%になって、「ピットアウト！」に変わり、画面が消える
  // ・読み込みが長引いても、最大 MAX_WAIT ミリ秒で必ず消える(style.css 側にも保険あり)
  (function(){
    const loader = document.getElementById('pitLoader');
    const text = document.getElementById('pitLoaderText');
    const ring = document.getElementById('pitRingFg');
    if (!loader || !text || !ring) return;

    const C = 2 * Math.PI * 26;   // 円周(style.css の stroke-dasharray と同じ値)
    const FILL = 200;             // バーが0→100%になるまでの時間(ms)。style.css の transition と合わせる
    const HOLD = 100;             // 100%になってから消し始めるまでの間(ms)
    const MAX_WAIT = 5000;        // これ以上は待たずに消す(ms)

    function setProgress(p){ ring.style.strokeDashoffset = (C * (1 - p)).toFixed(2); }

    // 進み具合 = (読み終えた画像 + ページ全体の読み込み完了) / (画像の数 + 1)。完了するまでは90%止まり
    const imgs = Array.from(document.images);
    const total = imgs.length + 1;
    let loadedCount = 0, pageLoaded = false, done = false, finishing = false, shown = 0;

    function update(){
      if (done) return;
      const p = pageLoaded ? 1 : Math.min(0.9, loadedCount / total);
      if (p > shown){ shown = p; setProgress(p); }
      if (pageLoaded && !finishing){ finishing = true; setTimeout(finish, FILL + HOLD); }
    }
    imgs.forEach((img) => {
      if (img.complete) { loadedCount++; return; }
      const fin = () => { loadedCount++; update(); };
      img.addEventListener('load', fin, { once: true });
      img.addEventListener('error', fin, { once: true });
    });
    window.addEventListener('load', () => { pageLoaded = true; update(); }, { once: true });
    if (document.readyState === 'complete') pageLoaded = true;

    function finish(){
      if (done) return;
      done = true;
      setProgress(1);
      loader.style.animation = 'none';   // CSSの保険アニメを止める(あとで再表示できるように)
      text.textContent = 'ピットアウト！🏁';
      loader.classList.add('is-out');
      setTimeout(() => { loader.classList.add('is-gone'); }, 700);
    }

    // 最初の表示(少しだけ伸ばしておく) → 読み込みの進み具合に合わせて伸びる
    requestAnimationFrame(update);
    setTimeout(finish, MAX_WAIT);

    // ---- 画面切り替え用: Blenderまとめ / サイト紹介 / 戻る のときに、同じ画面を短く挟む ----
    // pitRun(処理) … 「ピットイン中…」で画面を覆う → 処理(画面の切り替え)を実行 → 「ピットアウト！」で開ける
    // 実際の読み込みを待っているわけではなく、切り替えを演出するための短い時間です(バーは約0.2秒で一周)
    const T_IN = 150;    // 画面を覆うまでの時間(ms)
    const T_OUT = 320;   // 「ピットアウト！」に変えるまでの時間(ms)
    let busy = false;
    window.pitRun = function(action){
      if (busy || !done) { action(); return; }   // 最初の読み込み画面がまだ出ている間は、そのまま切り替える
      busy = true;
      loader.style.animation = 'none';
      // バーを0%に戻す(戻る動きは見せない)
      ring.style.transition = 'none';
      setProgress(0);
      loader.classList.add('is-fast', 'is-out');
      loader.classList.remove('is-gone');
      text.textContent = 'ピットイン中…🏁';
      void loader.offsetWidth;                 // いったん透明で配置してから、ふわっと出す
      ring.style.transition = '';
      loader.classList.remove('is-out');
      setProgress(1);                          // 0 → 100% を約0.2秒で
      setTimeout(action, T_IN);
      setTimeout(() => {
        text.textContent = 'ピットアウト！🏁';
        loader.classList.add('is-out');
        setTimeout(() => {
          loader.classList.add('is-gone');
          loader.classList.remove('is-fast');
          busy = false;
        }, 250);
      }, T_OUT);
    };
  })();