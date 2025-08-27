# 请柬文案生成器 · 唯美散文短句

本项目是一个纯前端的请柬文案生成小工具，支持姓名、日期、地点与主题意象输入，生成唯美、散文风、短句形式的中文邀请文案。无需外网和账号。

## 使用方法

1. 直接双击打开 `index.html`。
2. 填写新郎/新娘姓名、日期、地点（可选）。
3. 输入主题/意象（可选，使用中文逗号或英文逗号分隔）。
4. 选择语气浓度与句数。
5. 点击“生成文案”或“换一版”。
6. 可一键复制或下载为 TXT 文件。

### 使用 DeepSeek AI 生成（可选）

1. 在“AI 生成”选择 DeepSeek。
2. 保持模型为 `deepseek-chat`（或选择 `deepseek-reasoner`）。
3. 填写 API Key（仅保存在本地，不会上传）。
4. 点击“AI 生成”按钮。

调用说明参考官方文档：[DeepSeek 多轮对话（/chat/completions）](https://api-docs.deepseek.com/zh-cn/guides/multi_round_chat)。

### 配置文件避免硬编码 API Key（推荐）

1. 复制根目录下的 `config.example.js` 为 `config.js`。
2. 在 `config.js` 中填写你的 `apiKey`（也可配置默认 `model` 与 `temperature`）。
3. `index.html` 会优先加载 `config.js`，前端会使用其中的默认值；页面输入框仍可覆盖这些值。
4. 注意不要将包含真实 Key 的 `config.js` 提交到代码仓库。

## 功能特性

- 唯美散文短句风格语料，随机组合，可复现种子。
- 支持主题意象注入：如“秋光、星辉、山风”等。
- 可调语气浓度：清浅 / 适中 / 浓郁。
- 可选随机种子，确保多端一致复现。
- 结果可在页面中直接编辑微调。

## 文件说明

- `index.html`：页面结构与表单。
- `style.css`：样式与排版。
- `script.js`：生成逻辑与交互。

## 自定义

可在 `script.js` 中扩充 `LEXICON` 词库或模板以形成不同风格。

若要自定义提示词或模型参数，查看 `buildPrompt()` 与 `callDeepseek()`。

## 许可证

MIT


