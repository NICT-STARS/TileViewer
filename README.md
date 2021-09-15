# TileViewer
### 概要
Webページにタイル化された画像をスケーラブルに表示する機能を簡単に組み込む事が出来るjqueryプラグインです。

------------

### Webサイト
https://www.k2go.jp/public/TileViewer/

------------

### ライセンス

BSD2

------------

### 主な機能

- タイル画像なら何でも表示可能です。同じ構造のタイル画像なら複数を重ねて表示する事も可能です。
- 国土地理院やオープンストリートマップ等の標準的な地図画像の座標系（緯度経度による位置計算）に対応してます。その他、情報通信研究機構（NICT）が提供している気象衛星ひまわり8号タイル画像の座標系（緯度経度による位置計算）にも対応してます。
- マウスドラッグで上下左右に移動出来ます。
- タッチデバイスではスワイプで上下左右に移動出来ます。
- マウスの左ダブルクリックでズームイン、右ダブルクリックでズームアウト出来ます。
- マウスホイールでズームイン・アウト出来ます。
- タッチデバイスではピンチ操作でズームイン・アウト出来ます。
- 任意の要素（jqueryオブジェクト）を任意の位置にプロットする事が出来ます。

------------

### 導入方法

1. ライブラリをダウンロードする。
2. jquery（Ver3.4.1以上）とダウンロードしたライブラリをHTMLファイルへ組み込む。
3. windowオブジェクトのload完了後、タイル画像を組み込みたい要素へ実装する。
