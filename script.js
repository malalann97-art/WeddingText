/*
  请柬文案生成器 · 唯美散文短句
  - 纯前端随机生成，无需外网/账号
  - 支持姓名/日期/地点/主题/语气/句数/随机种子
*/

// —— 工具函数 ——
function createSeededRandom(seedNumber) {
  // 线性同余法，保证可复现
  let state = (seedNumber >>> 0) || Math.floor(Math.random() * 0xffffffff);
  return function random() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function pickOne(arr, rnd) {
  return arr[Math.floor(rnd() * arr.length)] || arr[0];
}

function maybeInsert(text, token) {
  return text.includes(token) ? text : text + token;
}

function joinNonEmpty(parts, sep = "") {
  return parts.filter(Boolean).join(sep);
}

// —— 文案语料 ——
const LEXICON = {
  openings: [
    "今日所邀的",
    "此刻所盼的",
    "向着温柔的方向",
    "我们轻轻地启程",
    "在时光的指尖",
    "沿着彼此的目光",
    "当晨光掠过心湖",
    "在万物苏醒的呼吸里",
    "循着季节的回响",
  ],
  people: [
    "皆是从生命不同经纬线走来的珍贵存在",
    "都是一路与光同行的温暖亲友",
    "是我们旅途中最亮的星群",
    "是见证爱缓缓生长的同行者",
    "皆是岁月珍藏的名字",
  ],
  vows: [
    "我们即将站在人生新的坐标点",
    "愿以一枚誓言，安放彼此前后的风景",
    "在眷恋里，为彼此点亮归途",
    "愿把一切山河，折叠进你的眼睛",
    "在你掌心，安放漂泊的星群",
  ],
  crowns: [
    "用爱为彼此加冕",
    "以温柔为彼此加冕",
    "让名字在此刻被光拥抱",
    "以长久的目光互为边界",
    "让诺言在心上落印",
  ],
  invite: [
    "诚盼您的赴约",
    "愿得您的见证",
    "期待在场的每一束目光",
    "敬请光临",
    "愿与您共享这份欢喜",
  ],
  motifFragments: [
    "在{motif}里",
    "向着{motif}而去",
    "与{motif}为邻",
    "借{motif}的清光",
    "把{motif}轻藏心底",
  ],
  closings: [
    "让您的目光，成为这场仪式里最珍贵的注脚",
    "盼您一诺，星河作证",
    "愿此夜灯火可亲，喜意抵达",
    "与您共饮一盏人间烟火",
    "携手把光，留在这日的页脚",
  ],
  softAdverbs: ["轻轻", "缓缓", "静静", "悄悄", "慢慢"],
  richAdverbs: ["深深", "炽热地", "郑重地", "沉默而笃定地", "滚烫地"],
  separators: ["，", "，", "，", "。"],
};

// —— 模板 ——
const TEMPLATES = [
  ["openings", "people"],
  ["vows"],
  ["crowns"],
  ["invite"],
  ["closings"],
];

function enrichWithContext({ groom, bride, date, venue }, rnd) {
  const names = joinNonEmpty([groom, bride], " 与 ");
  const dateLine = date ? `${date}` : "";
  const venueLine = venue ? `${venue}` : "";
  const header = joinNonEmpty([names, dateLine, venueLine], " · ");

  return header ? `${header}` : "";
}

function buildMotifPool(userMotifs) {
  const defaults = ["风", "星光", "山与海", "流年", "晨雾", "晚霞", "花事", "月色"];
  const extras = (userMotifs || "")
    .split(/[，,、\s]+/)
    .map(s => s.trim())
    .filter(Boolean);
  return extras.length ? extras.concat(defaults) : defaults;
}

function maybeAdverb(intensity, rnd) {
  if (intensity === "soft" && rnd() < 0.5) return pickOne(LEXICON.softAdverbs, rnd) + "";
  if (intensity === "rich") return pickOne(LEXICON.richAdverbs, rnd) + "";
  return "";
}

function realizeToken(tokenKey, { motifPool, intensity }, rnd) {
  const source = LEXICON[tokenKey];
  let line = pickOne(source, rnd);
  if (line.includes("{motif}")) {
    const m = pickOne(motifPool, rnd);
    line = line.replace("{motif}", m);
  }
  // 适度加入副词
  if (["vows", "crowns"].includes(tokenKey)) {
    const adv = maybeAdverb(intensity, rnd);
    if (adv) line = maybeInsert(line, "");
  }
  return line;
}

function composeLines(options, rnd) {
  const { lines: linesWanted, intensity } = options;
  const motifPool = buildMotifPool(options.motifs);
  const context = { motifPool, intensity };

  // 先生成核心模板段
  const core = TEMPLATES.flatMap(group => {
    return group.map(key => realizeToken(key, context, rnd));
  });

  // 随机补足到目标句数
  const allKeys = ["openings", "people", "vows", "crowns", "invite", "motifFragments", "closings"];
  const extra = [];
  while (core.length + extra.length < linesWanted) {
    const k = pickOne(allKeys, rnd);
    let line = realizeToken(k, context, rnd);
    if (k === "motifFragments") {
      // 主题碎片常作为过渡句，柔化语气
      line = maybeInsert(line, "。");
    }
    extra.push(line);
  }

  const lines = core.concat(extra).slice(0, linesWanted);

  // 句尾标点规范化：短句风格，多用顿号/逗号/句号穿插
  const puncts = LEXICON.separators;
  return lines.map((t, i) => {
    const trimmed = t.replace(/[。！？,.!?；;、]$/u, "");
    const end = i === lines.length - 1 ? "。" : pickOne(puncts, rnd);
    return trimmed + end;
  });
}

function generateCopy(options) {
  const seedValue = options.seed ? Number(options.seed) : undefined;
  const rnd = createSeededRandom(seedValue);
  const header = enrichWithContext(options, rnd);
  const lines = composeLines(options, rnd);
  const body = lines.join("\n");
  return header ? header + "\n\n" + body : body;
}

// —— 交互逻辑 ——
const $ = (id) => document.getElementById(id);

function readOptions() {
  return {
    groom: $("groom").value.trim(),
    bride: $("bride").value.trim(),
    date: $("date").value.trim(),
    venue: $("venue").value.trim(),
    motifs: $("motifs").value.trim(),
    intensity: $("intensity").value,
    lines: Math.max(4, Math.min(16, Number($("lines").value) || 8)),
    seed: $("seed").value,
    ai: {
      mode: $("aiMode")?.value || "off",
      model: "deepseek-chat", // 固定使用 deepseek-chat 模型
      temperature: Number($("aiTemperature")?.value || (window.DEEPSEEK_CONFIG?.temperature ?? 0.7)),
      apiKey: $("aiKey")?.value.trim() || (window.DEEPSEEK_CONFIG?.apiKey || ""),
    }
  };
}

function setResult(text) {
  $("result").textContent = text;
}

function generateAndRender() {
  const options = readOptions();
  const text = generateCopy(options);
  setResult(text);
}

function shuffleSeedAndRender() {
  $("seed").value = "";
  generateAndRender();
}

function copyToClipboard() {
  const text = $("result").textContent || "";
  if (!text.trim()) return;
  navigator.clipboard?.writeText(text).then(() => {
    toast("已复制到剪贴板");
  }).catch(() => {
    // 兼容旧浏览器
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); toast("已复制到剪贴板"); } catch(e) {}
    document.body.removeChild(textarea);
  });
}

function downloadTxt() {
  const text = $("result").textContent || "";
  if (!text.trim()) return;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = '请柬文案.txt';
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toast(message) {
  const t = document.createElement('div');
  t.textContent = message;
  t.style.position = 'fixed';
  t.style.left = '50%';
  t.style.bottom = '28px';
  t.style.transform = 'translateX(-50%)';
  t.style.background = 'rgba(0,0,0,0.74)';
  t.style.color = '#fff';
  t.style.padding = '8px 12px';
  t.style.borderRadius = '10px';
  t.style.fontSize = '14px';
  t.style.zIndex = '9999';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1400);
}

// 事件绑定
window.addEventListener('DOMContentLoaded', () => {
  $("generate").addEventListener('click', generateAndRender);
  $("shuffle").addEventListener('click', shuffleSeedAndRender);
  $("copy").addEventListener('click', copyToClipboard);
  $("download").addEventListener('click', downloadTxt);
  $("aiGenerate").addEventListener('click', aiGenerateHandler);

  // 首次自动生成一版
  generateAndRender();
});

// —— 提示词与 DeepSeek 调用 ——
function buildPrompt(options) {
  const header = enrichWithContext(options);
  const motifs = options.motifs || "";
  const intensityMap = { soft: "清浅", medium: "适中", rich: "浓郁" };
  const intensity = intensityMap[options.intensity] || "适中";
  const example = "今日所邀的\n皆是从生命不同经纬线走来的珍贵存在。\n我们即将站在人生新的坐标点，\n用爱为彼此加冕。\n诚盼您的赴约，\n让您的目光，\n成为这场仪式里最珍贵的注脚！";

  const system = `你是一位中文婚礼请柬文案作者，擅长唯美、散文风、短句表达。写作要求：
1) 句式短，换行分句；
2) 情感真挚但不过度堆叠辞藻；
3) 适度融入意象（若提供）；
4) 结尾自然收束，不要冗长；
5) 输出不包含额外说明、标题或标注。`;

  const user = `请基于以下信息，创作 ${options.lines} 行中文请柬邀请文案：
- 信息：${header || "(未提供姓名/日期/地点)"}
- 主题/意象：${motifs || "(未提供)"}
- 语气浓度：${intensity}
- 风格：唯美、散文风、短句
示例（风格参照，不必照抄）：
${example}
只输出文案正文，每行一句。`;

  return { system, user };
}

async function callDeepseek(options) {
  const { ai } = options;
  const { system, user } = buildPrompt(options);

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ai.model || 'deepseek-chat',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: isFinite(ai.temperature) ? ai.temperature : 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('模型未返回内容');
    return content;
  } catch (err) {
    console.error('API call failed:', err);
    throw new Error('生成失败: ' + err.message);
  }
}

async function aiGenerateHandler() {
  const options = readOptions();
  if (options.ai.mode !== 'deepseek') {
    generateAndRender();
    return;
  }
  try {
    setResult('AI 正在生成中，请稍候…');
    const text = await callDeepseek(options);
    setResult(text);
  } catch (err) {
    console.error(err);
    toast('AI 生成失败，已使用本地生成');
    const text = generateCopy(options);
    setResult(text);
  }
}


