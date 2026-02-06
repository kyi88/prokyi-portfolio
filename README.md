# prokyi — Portfolio

近未来ホログラフィックデザインのポートフォリオサイト。  
Canvas パーティクル、glassmorphism、スクロールリビールアニメーションを備えたプロ品質のシングルページ。

🌐 **公開URL**: [https://kyi88.github.io/prokyi-portfolio/](https://kyi88.github.io/prokyi-portfolio/)

---

## 特徴

- **ホログラフィック UI** — ダーク背景にシアン/アクアのアクセントカラー、カードグロー
- **Canvas パーティクルシステム** — 粒子間の接続線付きバックグラウンドアニメーション
- **glassmorphism ヘッダー** — `backdrop-filter` によるブラー効果の固定ヘッダー
- **スクロールリビール** — IntersectionObserver によるスタガード表示アニメーション
- **完全レスポンシブ** — デスクトップ・タブレット・モバイル対応、ハンバーガーメニュー
- **アクセスカウンター** — localStorage 永続保存、数値カウントアップアニメーション
- **アクセシビリティ対応** — skip-link、aria 属性、セマンティック HTML5

## 技術スタック

| 技術 | 用途 |
|------|------|
| HTML5 | セマンティックマークアップ、BEM 命名規則 |
| CSS3 | カスタムプロパティ、Grid/Flexbox、アニメーション |
| JavaScript (Vanilla) | Canvas 2D、IntersectionObserver、イベント処理 |
| Google Fonts | Inter / Noto Sans JP / JetBrains Mono |
| GitHub Pages | ホスティング |

## ファイル構成

```
prokyi-portfolio/
├── index.html      セマンティック HTML5 (192行)
├── style.css       ホログラフィック CSS (500行)
├── script.js       パーティクル・リビール・メニュー (200行)
├── avatar.jpg      プロフィールアバター
└── README.md       このファイル
```

## セクション構成

| # | セクション | 内容 |
|---|-----------|------|
| Hero | 自己紹介 | アバター、タグ、カウンター |
| 01 | 基本情報 | プロフィールグリッド |
| 02 | 学歴・経歴 | タイムライン + アルバイト経験 |
| 03 | 目標 | LLM / 自宅サーバー / 動画編集 / 3Dモデリング |
| 04 | リンク | GitHub / X (Twitter) |
| Side | サイドバー | ステータス / 更新情報 |

## ローカル実行

```bash
cd prokyi-portfolio
python3 -m http.server 8000
# http://localhost:8000 でアクセス
```

## ライセンス

© 2026 ぷろきぃ (prokyi)
