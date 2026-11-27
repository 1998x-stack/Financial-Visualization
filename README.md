# Financial Visualization · 财报可视化 Skill

把原始财报 PDF / 公告 / 财务数据转成**可核验、可交互、可离线阅读**的 HTML + SVG 研究报告。

本仓库的方法论继承并针对财报场景改造了 [Olah-style-posts](https://github.com/1998x-stack/Olah-style-posts) 的“证据 → 因果叙事 → 独立 SVG → 可执行验证 → 浏览器 QA”流程，但**不复制第三方插图、样式或内容**。

> 原则：**会计口径准确性 > 来源可追溯 > 因果解释 > 图形可读性 > 交互装饰**。所有演示数据均为合成数据，不应被当作上市公司真实披露。

## 在线演示 · GitHub Pages

**[打开完整的 16 种财报分析图表交互图鉴](https://1998x-stack.github.io/Financial-Visualization/)**

该站点直接基于 `financial_charts_16_HTML_SVG.zip` 发布，包含 16 个独立 HTML 页面、16 个 SVG、CSV 和总览画廊。所有数值均为**模拟教学数据**。发布源和自动化 QA 位于 [`site/`](site/) 及 [Pages workflow](.github/workflows/pages.yml)，与本仓库的 SKILL 示例分开维护。

## 入口

- [SKILL.md](skills/financial-visualization/SKILL.md)：可给 Agent 使用的完整执行规范
- [16 种图表选型](skills/financial-visualization/references/chart-catalog.md)
- [财务数据、溯源与勾稽](skills/financial-visualization/references/data-contract.md)
- [HTML/SVG 技术路线与 Package 选型](skills/financial-visualization/references/rendering-stack.md)
- [叙事与信息设计](skills/financial-visualization/references/storytelling.md)
- [浏览器与导出 QA](skills/financial-visualization/references/qa-and-publishing.md)
- [可运行示例](examples/demo/index.html) 与 [示例数据](examples/demo/financials.json)
- [财务校验器](skills/financial-visualization/scripts/validate_financials.py) 与 [全量 SVG 导出脚本](skills/financial-visualization/scripts/export_gallery_svgs.py)

## 快速开始

```bash
python skills/financial-visualization/scripts/validate_financials.py examples/demo/financials.json
python skills/financial-visualization/scripts/export_gallery_svgs.py examples/demo/index.html --out /tmp/financial-svg
python -m http.server 8000
# 浏览器打开 http://localhost:8000/examples/demo/
```

示例展示 16 种财报图表的基本视觉模式，以**原生 SVG** 保证开箱即用、离线可读。实际项目可用 Apache ECharts 的 SVG renderer 来绘制标准图，D3/d3-sankey 负责复杂路径和定制 SVG。不要把这个原生演示误称为 ECharts 或 D3 生成。

## 标准流程

1. 确认原始 PDF/公告版本、报表期、币种、单位、会计准则和披露主体；
2. 提取数据，记录每个数值的来源 URL、页码/表格、状态；
3. 验证资产负债表、分部总和、现金流、利润桥、同比环比和例外；
4. 为每幅图编写一个“读者问题 → 图形 → 数字证据 → 边界”的解读脚本；
5. 通过 SVG/HTML 做 16 种图表中的必要组合，不追求一次把全部图塞进报告；
6. 生成独立 SVG、表格、CSV/JSON 和离线 HTML；
7. 在桌面、平板、手机、打印和断网模式检查视觉与数据；
8. 提交代码和证据，检查远端版本、CI/发布结果，未验证的项必须说明。

## 依赖策略

**核心演示无 npm/CDN 依赖。** 正式项目可按需选用：

| 功能 | 推荐 |
|---|---|
| 大部分标准图 | Apache ECharts (SVG renderer) |
| 特殊桑基图、定制 SVG | D3.js、d3-sankey |
| 声明式统计图 | Observable Plot / Vega-Lite |
| React 应用 | Recharts |
| Python 分析与建模 | pandas、PyMuPDF、pdfplumber、Jinja2 |
| 财务明细表 | 原生 HTML table，复杂表可选 Tabulator / AG Grid |
| 浏览器质量检测 / PDF 导出 | Playwright |
| 单元/数据契约验证 | Python stdlib unittest（可选 pytest） |

本项目不默认加载外部字体、遥测、API 或网络 CDN。真实财报数据必须按许可和来源正确使用；许可不明确时不要复制源项目代码或素材。

## 目录

```text
AGENTS.md
README.md
skills/financial-visualization/
  SKILL.md
  references/
    chart-catalog.md
    data-contract.md
    rendering-stack.md
    storytelling.md
    qa-and-publishing.md
  scripts/validate_financials.py
examples/demo/
  financials.json
  index.html
  charts.js
  style.css
tests/test_financials.py
.github/workflows/validate.yml
```

## 许可与出处

设计方法受到 [Olah-style-posts](https://github.com/1998x-stack/Olah-style-posts) 启发。此处代码/示例独立构建；源仓库未明确授权的代码、配图和样式不自动转移。新增仓库的整体许可需由仓库所有者确认后再添加。
