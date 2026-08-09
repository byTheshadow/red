/**
 * 创作脑洞工坊 - 核心控制器
 * 纯本地运行，零依赖，零网络请求
 */
(function () {
  'use strict';

  // ========== 全局状态 ==========
  const state = {
    isDualMode: true,
    charA: "",
    charB: "",

    theater: {
      currentIndex: -1,
      currentItem: null,
      isRolling: false
    },

    locks: {
      paro: false,
      identity: false,
      chance: false,
      tension: false,
      tone: false,
      rule: false,
      cost: false,
      crisis: false
    },

    current: {
      paro: "",
      identityA: "",
      identityB: "",
      chance: "",
      tension: "",
      tone: "",
      rule: "",
      cost: "",
      crisis: "",
      openingScenario: ""
    }
  };

  // ========== DOM 缓存 ==========
  const dom = {
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),

    btnToggleMode: document.getElementById('btn-toggle-mode'),
    modeText: document.getElementById('mode-text'),
    charAInput: document.getElementById('char-a-name'),
    charBInput: document.getElementById('char-b-name'),
    charBContainer: document.getElementById('char-b-container'),
    labelRoleA: document.getElementById('label-role-a'),
    labelRoleB: document.getElementById('label-role-b'),
    rowIdentityB: document.getElementById('row-identity-b'),
    titleIdentity: document.getElementById('title-identity'),

    valParo: document.getElementById('val-paro'),
    valIdentityA: document.getElementById('val-identity-a'),
    valIdentityB: document.getElementById('val-identity-b'),
    valChance: document.getElementById('val-chance'),
    valTension: document.getElementById('val-tension'),
    btnRollParo: document.getElementById('btn-roll-paro'),

    valTone: document.getElementById('val-tone'),
    valRule: document.getElementById('val-rule'),
    valCost: document.getElementById('val-cost'),
    valCrisis: document.getElementById('val-crisis'),
    btnRollWorld: document.getElementById('btn-roll-world'),

    promptOutput: document.getElementById('prompt-output'),
    btnCopyPrompt: document.getElementById('btn-copy-prompt'),
    toast: document.getElementById('toast'),

    lockButtons: document.querySelectorAll('.lock-btn'),

    rollingParo: document.getElementById('rolling-paro'),
    rollingWorld: document.getElementById('rolling-world'),
    rollingTextParo: document.getElementById('rolling-text-paro'),
    rollingTextWorld: document.getElementById('rolling-text-world'),

    // 小剧场元素
    theaterName: document.getElementById('theater-name'),
    theaterDesc: document.getElementById('theater-desc'),
    theaterPromptOutput: document.getElementById('theater-prompt-output'),
    btnRollTheater: document.getElementById('btn-roll-theater'),
    btnCopyTheater: document.getElementById('btn-copy-theater'),
    rollingTheater: document.getElementById('rolling-theater'),
    rollingTextTheater: document.getElementById('rolling-text-theater'),
    theaterDisplay: document.querySelector('.theater-display'),
    theaterPromptContainer: document.querySelector('.theater-prompt-container')
  };

  // ========== 工具函数 ==========
  function random(arr) {
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomExclude(arr, exclude) {
    if (!arr || arr.length <= 1) return random(arr);
    let result;
    let attempts = 0;
    do {
      result = random(arr);
      attempts++;
    } while (result === exclude && attempts < 20);
    return result;
  }

  function showToast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    clearTimeout(dom.toast._t);
    dom.toast._t = setTimeout(() => dom.toast.classList.remove('show'), 2400);
  }

  // ========== 掷骰动画控制 ==========
  function showRolling(target, textEl) {
    textEl.textContent = random(CREATIVE_DATABASE.rollingTextPool);
    target.classList.add('active');
  }

  function hideRolling(target) {
    target.classList.remove('active');
  }

  // ========== 数据抽取 ==========
  function rollParo() {
    if (!state.locks.paro) {
      const obj = random(CREATIVE_DATABASE.paroPool);
      state.current.paro = obj ? obj.name : "";
    }
    if (!state.locks.identity) {
      state.current.identityA = random(CREATIVE_DATABASE.identityPool);
      if (state.isDualMode) {
        state.current.identityB = randomExclude(CREATIVE_DATABASE.identityPool, state.current.identityA);
      }
    }
    if (!state.locks.chance) {
      state.current.chance = random(CREATIVE_DATABASE.chancePool);
    }
    if (!state.locks.tension) {
      state.current.tension = random(CREATIVE_DATABASE.tensionPool);
    }
  }

  function rollWorld() {
    if (!state.locks.tone) {
      state.current.tone = random(CREATIVE_DATABASE.worldPool.tones);
    }
    if (!state.locks.rule) {
      state.current.rule = random(CREATIVE_DATABASE.worldPool.rules);
    }
    if (!state.locks.cost) {
      state.current.cost = random(CREATIVE_DATABASE.worldPool.costs);
    }
    if (!state.locks.crisis) {
      state.current.crisis = random(CREATIVE_DATABASE.worldPool.crises);
    }
  }

  function rollOpening() {
    state.current.openingScenario = random(CREATIVE_DATABASE.openingScenarioPool);
  }

  // ========== 渲染 ==========
  function renderParo() {
    const nameA = state.charA || "{{user}}";
    const nameB = state.charB || "{{char}}";

    dom.valParo.textContent = state.current.paro;
    dom.valIdentityA.textContent = state.current.identityA;
    dom.valIdentityB.textContent = state.current.identityB;
    dom.valChance.textContent = state.current.chance;
    dom.valTension.textContent = state.current.tension;

    dom.labelRoleA.textContent = nameA + "：";
    dom.labelRoleB.textContent = nameB + "：";
  }

  function renderWorld() {
    dom.valTone.textContent = state.current.tone;
    dom.valRule.textContent = state.current.rule;
    dom.valCost.textContent = state.current.cost;
    dom.valCrisis.textContent = state.current.crisis;
  }

  // ========== 带动画的掷骰 ==========
  function animatedRollParo() {
    showRolling(dom.rollingParo, dom.rollingTextParo);
    setTimeout(() => {
      rollParo();
      renderParo();
      hideRolling(dom.rollingParo);
      reanimateDimensions('paro-results');
    }, 900);
  }

  function animatedRollWorld() {
    showRolling(dom.rollingWorld, dom.rollingTextWorld);
    setTimeout(() => {
      rollWorld();
      renderWorld();
      hideRolling(dom.rollingWorld);
      reanimateDimensions('world-results');
    }, 900);
  }

  function reanimateDimensions(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const items = container.querySelectorAll('.dimension-item');
    items.forEach((item, i) => {
      item.style.animation = 'none';
      item.offsetHeight; // 触发 reflow
      item.style.animation = '';
      item.style.animationDelay = (i * 0.06) + 's';
    });
  }

  // ========== 生成 AI RP Prompt ==========
  function generatePrompt() {
    const nameA = state.charA || "{{user}}";
    const nameB = state.charB || "{{char}}";

    // 组装世界观/背景信息
    const bgParts = [
      state.current.paro ? "Paro/AU 设定: " + state.current.paro : "",
      state.current.tone ? "世界基调: " + state.current.tone : "",
      state.current.rule ? "核心法则: " + state.current.rule : "",
      state.current.cost ? "代价机制: " + state.current.cost : "",
      state.current.crisis ? "世界危机: " + state.current.crisis : ""
    ].filter(Boolean).join("\n  ");

    let prompt = "";

    if (state.isDualMode) {
      prompt = `[系统指令：请作为一位沉浸式角色扮演引擎与前端开发者，为以下设定生成一段"互动式角色扮演小剧场"。请使用HTML、内联CSS和JavaScript输出，确保代码封装在一个html代码块中可直接渲染。所有样式必须为内联或内部style标签，禁止外部依赖。]

【背景与世界观设定】
  ${bgParts || "（暂未指定具体背景）"}

【角色设定】
- {{user}} 角色：${nameA}，身份是「${state.current.identityA}」
- {{char}} 角色：${nameB}，身份是「${state.current.identityB}」
- 相遇契机：${state.current.chance}
- 核心张力/冲突：${state.current.tension}

【输出规则】
1. 请严格保持角色人设，{{char}}不可替{{user}}做决定或代说台词。
2. 以第三人称叙事视角展开，对话使用引号标注，动作与心理描写使用叙述体。
3. 开篇以符合上述氛围的场景描写切入，自然引出两人的首次正面交锋或互动。
4. 总字数控制在约1500字左右，节奏张弛有度，结尾留下悬念或选择分支供{{user}}回应。
5. UI设计需精致美观，配色与排版需贴合世界观氛围（如暗色系用于悬疑，暖色用于奇幻等）。
6. JavaScript部分需实现至少一个互动元素（如选择分支、状态切换、或氛围音效按钮等）。

【开局氛围参考】
${state.current.openingScenario || "在命运交错的节点上，两道轨迹终于不可避免地碰撞在一起。"}

请直接输出完整的HTML代码块：`;
    } else {
      prompt = `[系统指令：请作为沉浸式角色扮演引擎与前端开发者，为以下设定生成一段"单人沉浸式叙事小剧场"。请使用HTML、内联CSS和JavaScript输出，确保代码封装在一个html代码块中可直接渲染。所有样式必须为内联或内部style标签，禁止外部依赖。]

【背景与世界观设定】
  ${bgParts || "（暂未指定具体背景）"}

【角色设定】
- {{user}} 角色：${nameA}，身份是「${state.current.identityA}」
- 叙事模式：第二人称沉浸视角（"你"），由系统作为DM/叙述者推进世界
- 当前事件契机：${state.current.chance}
- 核心矛盾冲突：${state.current.tension}

【输出规则】
1. 不可代替{{user}}做出关键决定，需在关键节点提供2-3个行动选项。
2. 以沉浸式第二人称叙事展开（"你听见..."、"你注意到..."），营造强代入感。
3. 环境描写细腻，善用五感（视觉、听觉、触觉、嗅觉、直觉）构建氛围。
4. 总字数控制在约1500字左右，节奏紧凑，结尾以选择分支收束。
5. UI设计需精致美观，使用符合世界观的主题配色与排版。
6. JavaScript部分需实现互动选择分支功能，点击不同选项展示不同后续文本。

【开局氛围参考】
${state.current.openingScenario || "四周的空气骤然凝滞，属于你的故事线正式被激活。"}

请直接输出完整的HTML代码块：`;
    }

    dom.promptOutput.textContent = prompt;
    return prompt;
  }

  // ========== 小剧场功能 ==========
  function getTheaterPool() {
    if (typeof THEATER_DATABASE === 'undefined' || !Array.isArray(THEATER_DATABASE.theaterPool)) {
      return [];
    }
    return THEATER_DATABASE.theaterPool;
  }

  function getRandomTheater(previousIndex) {
    const pool = getTheaterPool();

    if (pool.length === 0) {
      return {
        index: -1,
        item: {
          name: "暂无小剧场",
          description: "请先在 data-theater.js 中添加小剧场模板。",
          prompt: "暂无可用的小剧场 Prompt。"
        }
      };
    }

    if (pool.length === 1) {
      return { index: 0, item: pool[0] };
    }

    let nextIndex = Math.floor(Math.random() * pool.length);
    let attempts = 0;
    while (nextIndex === previousIndex && attempts < 20) {
      nextIndex = Math.floor(Math.random() * pool.length);
      attempts++;
    }

    return { index: nextIndex, item: pool[nextIndex] };
  }

  function renderTheater() {
    const theater = state.theater.currentItem;

    if (!theater) {
      dom.theaterName.textContent = "尚未抽取小剧场";
      dom.theaterDesc.textContent = "点击下方按钮开始抽取";
      dom.theaterPromptOutput.textContent = "";
      return;
    }

    dom.theaterName.textContent = theater.name || "未命名小剧场";
    dom.theaterDesc.textContent = theater.description || "暂无小剧场简介";
    dom.theaterPromptOutput.textContent = theater.prompt || "暂无小剧场 Prompt。";
  }

  function animateTheaterContent() {
    const targets = [dom.theaterDisplay, dom.theaterPromptContainer];
    targets.forEach(element => {
      if (!element) return;
      element.classList.remove('is-changing');
      void element.offsetWidth; // 强制 reflow
      element.classList.add('is-changing');
    });
  }

  function showTheaterRolling() {
    if (!dom.rollingTheater) return;
    const textPool = (typeof CREATIVE_DATABASE !== 'undefined' && Array.isArray(CREATIVE_DATABASE.rollingTextPool))
      ? CREATIVE_DATABASE.rollingTextPool
      : ["正在寻找新的小剧场..."];
    dom.rollingTextTheater.textContent = random(textPool);
    dom.rollingTheater.classList.add('active');
  }

  function hideTheaterRolling() {
    if (!dom.rollingTheater) return;
    dom.rollingTheater.classList.remove('active');
  }

  function rollTheater() {
    const result = getRandomTheater(state.theater.currentIndex);
    state.theater.currentIndex = result.index;
    state.theater.currentItem = result.item;
    renderTheater();
    animateTheaterContent();
  }

  function animatedRollTheater() {
    if (!dom.rollingTheater) {
      rollTheater();
      return;
    }

    if (state.theater.isRolling) return;
    state.theater.isRolling = true;
    showTheaterRolling();

    setTimeout(() => {
      rollTheater();
      hideTheaterRolling();
      state.theater.isRolling = false;
    }, 850);
  }

  function copyTheaterPrompt() {
    const theater = state.theater.currentItem;
    if (!theater || !theater.prompt) {
      showToast("当前没有可复制的小剧场 Prompt");
      return;
    }
    copyText(theater.prompt);
  }

  // ========== 锁定系统 ==========
  function toggleLock(key, btn) {
    state.locks[key] = !state.locks[key];
    const locked = state.locks[key];
    const useEl = btn.querySelector('use');

    if (locked) {
      btn.classList.add('locked');
      useEl.setAttribute('href', '#icon-lock');
    } else {
      btn.classList.remove('locked');
      useEl.setAttribute('href', '#icon-unlock');
    }
  }

  // ========== 模式切换 ==========
  function toggleMode() {
    state.isDualMode = !state.isDualMode;
    const modeIcon = dom.btnToggleMode.querySelector('use');

    if (state.isDualMode) {
      dom.modeText.textContent = "双人模式";
      modeIcon.setAttribute('href', '#icon-users');
      dom.charBContainer.style.display = "flex";
      dom.rowIdentityB.style.display = "flex";
      dom.titleIdentity.textContent = "角色身份";
    } else {
      dom.modeText.textContent = "单人模式";
      modeIcon.setAttribute('href', '#icon-user');
      dom.charBContainer.style.display = "none";
      dom.rowIdentityB.style.display = "none";
      dom.titleIdentity.textContent = "角色身份";
    }

    if (!state.locks.identity) {
      rollParo();
    }
    renderParo();
  }

  // ========== 剪贴板 ==========
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast("复制成功，可直接发送给 AI 开启对话");
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast("复制成功，可直接发送给 AI 开启对话");
    } catch (e) {
      showToast("复制失败，请手动长按复制");
    }
    document.body.removeChild(ta);
  }

  // ========== 事件绑定 ==========
  function bindEvents() {
    // Tab 切换
    dom.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-tab');
        dom.navTabs.forEach(t => t.classList.remove('active'));
        dom.tabPanes.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const pane = document.getElementById(targetId);
        if (pane) pane.classList.add('active');

        // 切到 Prompt 页自动刷新
        if (targetId === 'tab-prompt') {
          rollOpening();
          generatePrompt();
        }

        // 切到小剧场页，首次自动抽取
        if (targetId === 'tab-theater') {
          if (!state.theater.currentItem) {
            rollTheater();
          }
        }
      });
    });

    // 角色名输入
    dom.charAInput.addEventListener('input', (e) => {
      state.charA = e.target.value.trim();
      renderParo();
    });

    dom.charBInput.addEventListener('input', (e) => {
      state.charB = e.target.value.trim();
      renderParo();
    });

    // 模式切换
    dom.btnToggleMode.addEventListener('click', toggleMode);

    // 掷骰
    dom.btnRollParo.addEventListener('click', animatedRollParo);
    dom.btnRollWorld.addEventListener('click', animatedRollWorld);

    // 锁定按钮
    dom.lockButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-lock');
        if (key) toggleLock(key, btn);
      });
    });

    // 复制 Prompt
    dom.btnCopyPrompt.addEventListener('click', () => {
      const prompt = generatePrompt();
      copyText(prompt);
    });

    // 小剧场抽取
    if (dom.btnRollTheater) {
      dom.btnRollTheater.addEventListener('click', animatedRollTheater);
    }

    // 小剧场 Prompt 复制
    if (dom.btnCopyTheater) {
      dom.btnCopyTheater.addEventListener('click', copyTheaterPrompt);
    }
  }

  // ========== 初始化 ==========
  function init() {
    rollParo();
    rollWorld();
    rollOpening();

    renderParo();
    renderWorld();
    generatePrompt();

    // 初始化小剧场
    rollTheater();

    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

