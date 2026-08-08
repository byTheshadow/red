/**
 * 同人/OC 随机创作脑洞工坊 - 核心控制器
 * 纯本地运行，不依赖任何第三方库及网络请求
 */

(function () {
  'use strict';

  // 1. 全局状态存储
  const state = {
    isDualMode: true,
    charA: "角色 A",
    charB: "角色 B",

    // 锁定状态 (true 为已锁定)
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

    // 当前抽中内容
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

  // 2. DOM 元素缓存
  const dom = {
    // 标签页
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),

    // 模式一元素
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

    // 模式二元素
    valTone: document.getElementById('val-tone'),
    valRule: document.getElementById('val-rule'),
    valCost: document.getElementById('val-cost'),
    valCrisis: document.getElementById('val-crisis'),
    btnRollWorld: document.getElementById('btn-roll-world'),

    // 模式三元素
    promptOutput: document.getElementById('prompt-output'),
    btnCopyPrompt: document.getElementById('btn-copy-prompt'),
    toast: document.getElementById('toast'),

    // 锁按钮
    lockButtons: document.querySelectorAll('.lock-btn')
  };

  // 3. 工具函数
  function getRandomItem(arr) {
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add('show');
    clearTimeout(dom.toast._timer);
    dom.toast._timer = setTimeout(() => {
      dom.toast.classList.remove('show');
    }, 2200);
  }

  // 4. 数据抽取逻辑
  function rollParoAU() {
    if (!state.locks.paro) {
      const paroObj = getRandomItem(CREATIVE_DATABASE.paroPool);
      state.current.paro = paroObj ? paroObj.name : "";
    }

    if (!state.locks.identity) {
      const pool = CREATIVE_DATABASE.identityPool;
      state.current.identityA = getRandomItem(pool);
      if (state.isDualMode) {
        let second = getRandomItem(pool);
        // 尽量避免抽到完全一样的身份
        if (pool.length > 1) {
          while (second === state.current.identityA) {
            second = getRandomItem(pool);
          }
        }
        state.current.identityB = second;
      }
    }

    if (!state.locks.chance) {
      state.current.chance = getRandomItem(CREATIVE_DATABASE.chancePool);
    }

    if (!state.locks.tension) {
      state.current.tension = getRandomItem(CREATIVE_DATABASE.tensionPool);
    }

    renderParoAU();
  }

  function rollWorld() {
    if (!state.locks.tone) {
      state.current.tone = getRandomItem(CREATIVE_DATABASE.worldPool.tones);
    }
    if (!state.locks.rule) {
      state.current.rule = getRandomItem(CREATIVE_DATABASE.worldPool.rules);
    }
    if (!state.locks.cost) {
      state.current.cost = getRandomItem(CREATIVE_DATABASE.worldPool.costs);
    }
    if (!state.locks.crisis) {
      state.current.crisis = getRandomItem(CREATIVE_DATABASE.worldPool.crises);
    }

    renderWorld();
  }

  function rollOpeningScenario() {
    state.current.openingScenario = getRandomItem(CREATIVE_DATABASE.openingScenarioPool);
  }

  // 5. 渲染视图
  function renderParoAU() {
    dom.valParo.textContent = state.current.paro;
    dom.valIdentityA.textContent = state.current.identityA;
    dom.valIdentityB.textContent = state.current.identityB;
    dom.valChance.textContent = state.current.chance;
    dom.valTension.textContent = state.current.tension;

    dom.labelRoleA.textContent = `${state.charA}：`;
    dom.labelRoleB.textContent = `${state.charB}：`;
  }

  function renderWorld() {
    dom.valTone.textContent = state.current.tone;
    dom.valRule.textContent = state.current.rule;
    dom.valCost.textContent = state.current.cost;
    dom.valCrisis.textContent = state.current.crisis;
  }

  // 6. 生成通用 AI RP 提示词
  function generatePrompt() {
    const bgWorld = [
      state.current.paro ? `Paro 背景: ${state.current.paro}` : "",
      state.current.tone ? `世界基调: ${state.current.tone}` : "",
      state.current.rule ? `法则: ${state.current.rule}` : "",
      state.current.cost ? `代价机制: ${state.current.cost}` : "",
      state.current.crisis ? `世界危机: ${state.current.crisis}` : ""
    ].filter(Boolean).join(" / ");

    let prompt = "";

    if (state.isDualMode) {
      prompt = `[System Instruction]
你现在将与我进行一段沉浸式的双人角色扮演互动。请严格遵守以下设定：
- 背景设定：${bgWorld || "暂无特定背景"}
- 我的角色（A）：${state.charA}，身份是 ${state.current.identityA}
- 你的角色（B）：${state.charB}，身份是 ${state.current.identityB}
- 相遇契机：${state.current.chance}
- 核心张力：${state.current.tension}

[Rules]
1. 保持角色人设，请勿跳出角色，请勿替我做决定或代说我的台词。
2. 你的第一回复需要以此情景的开局进行切入，字数控制在100字左右。

[Opening Scenario]
${state.current.openingScenario || "夜色渐深，你们在约定的地点相遇，视线在空气中交汇。"}`;
    } else {
      // 单人模式 Prompt 结构
      prompt = `[System Instruction]
你现在将作为叙述者与世界引导者（DM），为我进行一段沉浸式的单人角色扮演体验。请严格遵守以下设定：
- 背景设定：${bgWorld || "暂无特定背景"}
- 我的角色：${state.charA}，身份是 ${state.current.identityA}
- 当前事件契机：${state.current.chance}
- 核心冲突矛盾：${state.current.tension}

[Rules]
1. 请勿代为操控我的角色做决定或代说台词。
2. 推进情节，丰富周围环境细节与NPC互动，第一回复控制在100字左右。

[Opening Scenario]
${state.current.openingScenario || "四周的环境逐渐显现，属于你的故事正式拉开序幕。"}`;
    }

    dom.promptOutput.textContent = prompt;
    return prompt;
  }

  // 7. 切换锁定状态
  function toggleLock(key, btnElement) {
    state.locks[key] = !state.locks[key];
    const isLocked = state.locks[key];

    const iconUse = btnElement.querySelector('use');
    if (isLocked) {
      btnElement.classList.add('locked');
      iconUse.setAttribute('href', '#icon-lock');
    } else {
      btnElement.classList.remove('locked');
      iconUse.setAttribute('href', '#icon-unlock');
    }
  }

  // 8. 模式切换（单人/双人）
  function toggleDualMode() {
    state.isDualMode = !state.isDualMode;

    if (state.isDualMode) {
      dom.modeText.textContent = "双人模式";
      dom.charBContainer.style.display = "flex";
      dom.rowIdentityB.style.display = "block";
      dom.titleIdentity.textContent = "角色身份分配";
      dom.labelRoleA.textContent = `${state.charA}：`;
    } else {
      dom.modeText.textContent = "单人模式";
      dom.charBContainer.style.display = "none";
      dom.rowIdentityB.style.display = "none";
      dom.titleIdentity.textContent = "角色身份";
      dom.labelRoleA.textContent = "身份：";
    }

    // 重新根据模式生成一下未锁定的身份
    if (!state.locks.identity) {
      rollParoAU();
    } else {
      renderParoAU();
    }
  }

  // 9. 一键复制到剪贴板
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast("复制成功，可直接发送给 AI 开启对话");
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast("复制成功，可直接发送给 AI 开启对话");
    } catch (err) {
      showToast("复制失败，请手动长按复制");
    }
    document.body.removeChild(textArea);
  }

  // 10. 事件绑定
  function bindEvents() {
    // Tab 切换
    dom.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTabId = tab.getAttribute('data-tab');

        dom.navTabs.forEach(t => t.classList.remove('active'));
        dom.tabPanes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const activePane = document.getElementById(targetTabId);
        if (activePane) activePane.classList.add('active');

        // 切换到 Prompt 标签页时动态刷新 Prompt
        if (targetTabId === 'tab-prompt') {
          generatePrompt();
        }
      });
    });

    // 名字输入响应
    dom.charAInput.addEventListener('input', (e) => {
      state.charA = e.target.value.trim() || "角色 A";
      renderParoAU();
    });

    dom.charBInput.addEventListener('input', (e) => {
      state.charB = e.target.value.trim() || "角色 B";
      renderParoAU();
    });

    // 单双人模式切换
    dom.btnToggleMode.addEventListener('click', toggleDualMode);

    // 摇骰按钮
    dom.btnRollParo.addEventListener('click', () => {
      rollParoAU();
    });

    dom.btnRollWorld.addEventListener('click', () => {
      rollWorld();
    });

    // 锁定按钮点击
    dom.lockButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lockKey = btn.getAttribute('data-lock');
        if (lockKey) toggleLock(lockKey, btn);
      });
    });

    // 复制 Prompt 按钮
    dom.btnCopyPrompt.addEventListener('click', () => {
      const prompt = generatePrompt();
      copyToClipboard(prompt);
    });
  }

  // 11. 初始化启动
  function init() {
    rollParoAU();
    rollWorld();
    rollOpeningScenario();
    generatePrompt();
    bindEvents();
  }

  // DOM 就绪后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
