# 班級座號成績版

新增入口：[class-results.html](https://clive520.github.io/luyang-grade5-assessment-115/class-results.html)

原彙總版 `index.html`、`app.js`、`styles.css`、`data/assessment.json` 與原 README 均保留。本版使用獨立的 HTML、CSS、JavaScript 及資料檔，與彙總版各自呈現。

## 顯示內容

- 受測時班級、座號。
- 國語文、數學、英語文的整體答對率（%）及來源等級。
- 班級及座號查詢、科目切換、逐座號三科圖表、列印。

三科各 23 筆，合計 69 筆分科結果。資料來源為本機各科「答對率」Excel，直接採原始百分比與等級，不另算總分或排名。

## 資料範圍

`data/class-results.json` 以欄位白名單匯出，只包含班級、座號、各科答對率及等級，不含姓名、性別、PR 或個人逐題答案。新頁面與資料檔隨本公開 GitHub repository 及 Pages 發布，任何能開啟網址的人均可讀取班級座號成績。

未提供的座號不補造紀錄。若某科缺少成績，介面顯示「未提供」，不以 0 分代替。

## 本機預覽

在專案目錄執行 `python -m http.server 4173 --bind 127.0.0.1`，開啟 `http://127.0.0.1:4173/class-results.html`。
