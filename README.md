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

### 時間（日時）の同期
日時情報を持つWebアプリケーションの場合、グローバルなメソッドとして下記に示すSTARScontroller_getDate関数とSTARScontroller_setDate関数を実装して下さい。Webアプリケーションが日時情報を持たない場合は実装不要です。

### STARScontroller_getDate関数
STARScontrollerがWebアプリケーションの現在日時情報を取得するため定期的にコールします。戻り値としてWebアプリケーションの現在日時情報を返して下さい。

<table>
      <tbody>
        <tr>
          <td>構文</td>
          <td>STARScontroller_getDate()</td>
        </tr>
        <tr>
          <td>引数</td>
          <td>無し</td>
        </tr>
        <tr>
          <td>戻り値</td>
          <td>
            Webアプリケーションの現在日時情報を保持するJSONオブジェクト
            <table style="width: 97%">
              <tbody>
                <tr>
                  <th>名前</th>
                  <th>型</th>
                  <th>備考</th>
                </tr>
                <tr>
                  <td>currentDate</td>
                  <td>Date</td>
                  <td>現在日時</td>
                </tr>
                <tr>
                  <td>startDate</td>
                  <td>Date</td>
                  <td>開始日時。例えば画面上に横方向の時間軸バー等を持つWebアプリケーションなら左端の日時。</td>
                </tr>
                <tr>
                  <td>endDate</td>
                  <td>Date</td>
                  <td>終了日時。例えば画面上に横方向の時間軸バー等を持つWebアプリケーションなら右端の日時。</td>
                </tr>
              </tbody>
            </table>

            <table style="width: 97%">
              <tbody>
                <tr>
                  <th style="text-align: left">例</th>
                </tr>
                <tr>
                  <td class="code">

                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td>実装例</td>
          <td class="code">
            <pre>  function STARScontroller_getDate()
  {
    var date={};
    date.currentDate=現在日時;
    date.startDate=時間軸バー左端日時;
    date.endDate=時間軸バー右端日時;
    return date;
  }</pre>
          </td>
        </tr>
      </tbody>
    </table>


### 導入方法

1. ライブラリをダウンロードする。
2. jquery（Ver3.4.1以上）とダウンロードしたライブラリをHTMLファイルへ組み込む。
3. windowオブジェクトのload完了後、タイル画像を組み込みたい要素へ実装する。


