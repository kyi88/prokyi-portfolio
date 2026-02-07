# prokyi — Cyberdeck Portfolio

サイバーパンク × RPGステータス画面をコンセプトにしたポートフォリオサイト。  
Three.js 3Dパーティクル背景、Framer Motionアニメーション、隠しイースターエッグ満載のインタラクティブ体験。

🌐 **公開URL**: [https://kyi88.github.io/prokyi-portfolio/](https://kyi88.github.io/prokyi-portfolio/)

---

## 特徴

- **Three.js 3D背景** — インタラクティブパーティクルシステム + グリッドフロア + クリックリップル
- **サイバーパンクUI** — グラスモーフィズム、グリッチテキスト、アニメーションボーダー、ホログラムシマー
- **RPGステータス画面** — 4タブ構成のキャラクターシート (STATS / DEBUFFS / HISTORY / INVENTORY)
- **ブートシーケンス** — ASCII アート + ビープ音付きシステム起動演出
- **パララックスフォグ** — スクロール連動の多層背景エフェクト
- **スキルレーダーチャート** — SVGベースのインタラクティブ六角形チャート
- **8つのイースターエッグ** — コナミコマンド、隠しターミナル、ミニゲーム2種、シークレットクリック等
- **完全レスポンシブ** — モバイル最適化（3Dパーティクル数自動調整）
- **アクセシビリティ** — skip-link、focus-visible、prefers-reduced-motion 対応

## 技術スタック

| 技術 | 用途 |
|------|------|
| React 19 | コンポーネントベース UI |
| Vite 6.4 | ビルドツール + HMR |
| Three.js + @react-three/fiber | 3D背景パーティクルシステム |
| Framer Motion 11 | スクロールアニメーション + パララックス |
| Web Audio API | ブートビープ + ゲーム効果音 |
| Canvas API | アニメーションファビコン + パーティクルトレイル |
| Google Fonts | Inter / Noto Sans JP / JetBrains Mono |
| GitHub Pages (gh-pages) | ホスティング + 自動デプロイ |

## プロジェクト構成

```
src/
├── main.jsx                 エントリーポイント
├── App.jsx                  レイアウト・ブート画面・パララックスフォグ
├── App.css                  レイアウト・ブート画面・スケルトン
├── index.css                グローバルスタイル・CSS変数
└── components/
    ├── Header.jsx/css        固定ヘッダー・スクロール進捗・セクション表示カウンター
    ├── Hero.jsx/css          ヒーローセクション・タイピングアニメ・XPバー・LED
    ├── Section.jsx/css       セクションカード・グリッチタイトル
    ├── Profile.jsx/css       基本情報グリッド・ツールチップ
    ├── Career.jsx/css        学歴タイムライン・詳細展開・バイト経験
    ├── Goals.jsx/css         目標カード・進捗バー・スポットライト
    ├── Gadgets.jsx/css       ガジェット一覧・3Dティルト・フィルタリング
    ├── Links.jsx/css         SNSリンク・プレビューカード
    ├── Sidebar.jsx/css       ステータス・スキルバー・レーダーチャート・セッションタイマー
    ├── Footer.jsx/css        マトリクスレイン・ライブクロック・ロード時間
    ├── StatusScreen.jsx/css  RPGステータス画面 (lazy-loaded)
    ├── CyberBackground.jsx   Three.js 3D背景 (lazy-loaded)
    ├── CyberTerminal.jsx/css ハッカーターミナル (` キー)
    ├── KeyboardGuide.jsx/css キーボードショートカット (? キー)
    ├── ScrollToTop.jsx/css   トップへ戻るボタン
    ├── EasterEggFab.jsx      イースターエッグメニュー + コナミコード
    ├── StomachGame.jsx/css   STOMACH DEFENSE ミニゲーム
    └── TypingGame.jsx/css    HACK_TYPING ミニゲーム
```

## イースターエッグ

| # | 名前 | トリガー |
|---|------|---------|
| 1 | レトロモード | コナミコマンド (↑↑↓↓←→←→BA) |
| 2 | サイバーターミナル | `` ` `` キー |
| 3 | キーボードガイド | `?` キー |
| 4 | アバター秘密クリック | アバター画像を7回クリック |
| 5 | STOMACH DEFENSE | FABメニューから起動 |
| 6 | HACK_TYPING | FABメニューから起動 |
| 7 | ターミナル secret コマンド | ターミナルで `secret` |
| 8 | ランダム豆知識 | ターミナルで `random` |

## ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# GitHub Pages へデプロイ
npx gh-pages -d dist -b master
```

## ビルド情報

- **チャンク数**: 8
- **コンポーネント数**: 18
- **改善ループ**: 18回
- **コード分割**: Three.js / Framer Motion / StatusScreen / CyberBackground を分離

## ライセンス

© 2026 ぷろきぃ (prokyi)
