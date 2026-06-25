// =========================================
// PDF出力・A4フォーマット生成ロジック (pdf.js)
// =========================================

/**
 * 試合データを受け取り、裏側で一時的にA4の表を作成してPDFをプレビューする共通関数
 */
function generatePDF(state) {
  let container = document.createElement('div');
  container.id = 'pdf-export-container';
  
  let isDouble = state.flowIsDouble;
  let matchTypeStr = isDouble ? "ダブルス" : "シングルス";
  let tLName = state.initialTL || state.tL || "";
  let tRName = state.initialTR || state.tR || "";
  
  // ★修正箇所：常に「試合開始時の初期配置の選手名」を利用する
  let nL1 = state.initialNL1 || state.nL1 || "";
  let nL2 = isDouble ? (state.initialNL2 || state.nL2 || "") : "";
  let nR1 = state.initialNR1 || state.nR1 || "";
  let nR2 = isDouble ? (state.initialNR2 || state.nR2 || "") : "";

  let histStrs = state.matchScoreHistory || [];
  let g1Score = histStrs[0] ? `${histStrs[0].a} － ${histStrs[0].b}` : "  －  ";
  let g2Score = histStrs[1] ? `${histStrs[1].a} － ${histStrs[1].b}` : "  －  ";
  let g3Score = histStrs[2] ? `${histStrs[2].a} － ${histStrs[2].b}` : "  －  ";

  let totalMatchScoreL = 0;
  let totalMatchScoreR = 0;
  histStrs.forEach(game => {
    if (game.a > game.b) totalMatchScoreL++;
    else if (game.b > game.a) totalMatchScoreR++;
  });
  let displayTotalL = (histStrs.length > 0) ? totalMatchScoreL : "";
  let displayTotalR = (histStrs.length > 0) ? totalMatchScoreR : "";

  let matchDate = state.date ? state.date.split(' ')[0] : "";

  // 1ゲーム分の行(tr)のHTMLを生成するヘルパー関数
  const getGameRowsHTML = (gameIndex, gameLabelStr) => {
    let tableData = [];
    if (typeof Recorder !== 'undefined' && state.recorderData) {
        tableData = Recorder.generateTableData(state.recorderData, gameIndex);
    } else {
        tableData = Array.from({length: 4}, () => new Array(68).fill("")); // ★修正：60マスから68マスへ拡張
    }

    let label = gameLabelStr === "1" ? "第<br>一<br>ゲ<br>｜<br>ム" : gameLabelStr === "2" ? "第<br>二<br>ゲ<br>｜<br>ム" : "第<br>三<br>ゲ<br>｜<br>ム";
    let rowsHtml = "";
    let players = [nL1, nL2, nR1, nR2];

    for (let r = 0; r < 8; r++) {
      let isUpper = (r < 4); 
      let playerRowIndex = r % 4; 
      
      // ゲーム同士の境界線を引くためのクラス
      let rowClass = "";
      if (r === 3) rowClass = ' class="upper-last-row"';
      if (r === 7) rowClass = ' class="game-last-row"';

      rowsHtml += `<tr${rowClass}>`;

      // 左側の処理（凹の形を作るため、下段は枠なし結合セルにする）
      if (isUpper) {
        if (r === 0) {
          rowsHtml += `<td rowspan="4" class="game-label-col">${label}</td>`;
        }
        rowsHtml += `<td class="player-row-col">${players[playerRowIndex]}</td>`;
        let srVal = tableData[playerRowIndex] && tableData[playerRowIndex][0] ? tableData[playerRowIndex][0] : "";
        rowsHtml += `<td class="serve-col">${srVal}</td>`;
      } else {
        if (r === 4) {
          // 下段左側は3列分を1つに結合して枠線を消す（凹の切り欠き部分）
          rowsHtml += `<td colspan="3" rowspan="4" class="lower-blank-area"></td>`;
        }
      }

      // ラリー得点セル
      let startCol = isUpper ? 1 : 34; // ★修正：4マス増えたので下段の開始位置を30から34へシフト
      for (let c = 0; c < 33; c++) { // ★修正：29マスから33マスへ追加
        let cellVal = tableData[playerRowIndex] && tableData[playerRowIndex][startCol + c] ? tableData[playerRowIndex][startCol + c] : "";
        
        // 勝者の最終スコア（W_ が付いている場合）の処理：単に文字だけにする
        if (typeof cellVal === 'string' && cellVal.startsWith("W_")) {
            cellVal = cellVal.replace("W_", "");
        }
        
        rowsHtml += `<td class="rally-cell">${cellVal}</td>`;
      }

      rowsHtml += `</tr>`;
    }

    return rowsHtml;
  };

  // 1つのテーブルとして3ゲーム分をまとめる
  let allGamesHTML = `
    <div class="game-section">
      <table class="game-table">
        <colgroup>
          <col style="width: 2.5%;"> <col style="width: 14%;">  <col style="width: 2.5%;"> ${Array(33).fill('<col style="width: 2.454%;">').join('')} </colgroup>
        <tbody>
          ${getGameRowsHTML(0, "1")}
          ${getGameRowsHTML(1, "2")}
          ${getGameRowsHTML(2, "3")}
        </tbody>
      </table>
    </div>
  `;

  // A4サイズのHTMLを組み立て
  container.innerHTML = `
    <div id="score-sheet-a4" class="score-sheet-page">
      
      <div class="sheet-title" style="color: #000; margin-top: 10px;">ス コ ア シ ー ト <span style="font-size:14px; letter-spacing: 2px;">(得点用紙)</span></div>
      
      <div class="sheet-header" style="color: #000;">
        <div class="header-side">
          <div class="header-line">大会名：<span class="line-blank"></span></div>
          <div class="header-line">大会種別：<span class="line-blank"></span></div>
          <div class="header-line">開催場所：<span class="line-blank"></span></div>
          <div class="header-line">大会期日：<span class="line-blank">${matchDate}</span></div>
        </div>
        
        <div class="header-center">
          <table class="match-score-table">
            <colgroup>
              <col style="width: 4%;">
              <col style="width: 32%;">
              <col style="width: 5%;">
              <col style="width: 18%;">
              <col style="width: 5%;">
              <col style="width: 32%;">
              <col style="width: 4%;">
            </colgroup>
            <thead>
              <tr>
                <th colspan="2" class="col-player">選 手 名 ・ 所 属</th>
                <th colspan="3" class="col-game-score">ス コ ア</th>
                <th colspan="2" class="col-player">選 手 名 ・ 所 属</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th rowspan="3" class="lr-label">L<br>・<br>R</th>
                <td class="player-name-cell">${nL1}</td>
                <td rowspan="3" class="match-score-cell">${displayTotalL}</td>
                <td class="game-score-cell">${g1Score}</td>
                <td rowspan="3" class="match-score-cell">${displayTotalR}</td>
                <td class="player-name-cell">${nR1}</td>
                <th rowspan="3" class="lr-label">L<br>・<br>R</th>
              </tr>
              <tr>
                <td class="player-name-cell">${nL2}</td>
                <td class="game-score-cell">${g2Score}</td>
                <td class="player-name-cell">${nR2}</td>
              </tr>
              <tr>
                <td class="team-name-cell">${tLName ? tLName : ''}</td>
                <td class="game-score-cell">${g3Score}</td>
                <td class="team-name-cell">${tRName ? tRName : ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="header-side">
          <div class="header-line">種目：<span class="line-blank">${matchTypeStr}</span></div>
          <div class="header-line">試合番号：<span class="line-blank"></span></div>
          <div class="header-line">コート：<span class="line-blank"></span></div>
          <div class="header-line">コール時刻：<span class="line-blank"></span></div>
        </div>
      </div>

      ${allGamesHTML}

      <div class="sheet-footer" style="color: #000;">
        <div class="footer-row">
          <div class="footer-sign-box">勝者署名<span class="sign-line"></span></div>
          <div class="footer-sign-box">レフェリー署名<span class="sign-line"></span></div>
          <div class="footer-sign-box">主審署名<span class="sign-line"></span></div>
        </div>
        <div class="footer-row">
          <div class="footer-time-box">開始時刻：<span class="time-line"></span></div>
          <div class="footer-time-box">終了時刻：<span class="time-line"></span></div>
          <div class="footer-time-box">試合時間：<span class="time-line"></span></div>
          <div class="footer-time-box">使用シャトル数：<span class="time-line"></span></div>
        </div>
      </div>
      
    </div>
  `;

  document.body.appendChild(container);

  // ファイル名の自動生成と html2pdf の呼び出し
  let element = document.getElementById('score-sheet-a4');
  let now = new Date();
  let dateStrPDF = now.getFullYear() + ('0'+(now.getMonth()+1)).slice(-2) + ('0'+now.getDate()).slice(-2) + "_" + ('0'+now.getHours()).slice(-2) + ('0'+now.getMinutes()).slice(-2);
  let safeTL = (tLName || "TeamL").replace(/\s+/g, '_');
  let safeTR = (tRName || "TeamR").replace(/\s+/g, '_');
  let filename = `${dateStrPDF}_${safeTL}_vs_${safeTR}.pdf`;

  let opt = {
    margin:       0,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(element).output('bloburl').then(function(pdfUrl) {
       showPDFPreview(pdfUrl, filename);
       document.body.removeChild(container); 
    }).catch(err => {
       console.error("PDF生成エラー:", err);
       alert("PDFの生成に失敗しました。");
       if (document.body.contains(container)) document.body.removeChild(container);
    });
  } else {
    alert("PDF生成エンジンが読み込まれていません。通信環境を確認するか、ページをリロードしてください。");
    document.body.removeChild(container);
  }
}

function showPDFPreview(pdfUrl, filename) {
  let overlay = document.createElement('div');
  overlay.id = 'pdf-preview-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = '#000000';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  
  let header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.padding = '10px 15px';
  header.style.backgroundColor = '#1C1C1E';
  header.style.borderBottom = '1px solid #333333';

  let closeBtn = document.createElement('button');
  closeBtn.innerText = '閉じる';
  closeBtn.style.padding = '8px 16px';
  closeBtn.style.backgroundColor = 'transparent';
  closeBtn.style.color = '#A1A1AA';
  closeBtn.style.border = '1px solid #48484A';
  closeBtn.style.borderRadius = '6px';
  closeBtn.style.fontSize = '14px';
  closeBtn.style.fontWeight = 'bold';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => {
    document.body.removeChild(overlay);
    URL.revokeObjectURL(pdfUrl); 
  };

  let dlBtn = document.createElement('a');
  dlBtn.innerText = '↓ 本体に保存';
  dlBtn.href = pdfUrl;
  dlBtn.download = filename;
  dlBtn.style.padding = '8px 16px';
  dlBtn.style.backgroundColor = '#3B82F6';
  dlBtn.style.color = '#FFFFFF';
  dlBtn.style.textDecoration = 'none';
  dlBtn.style.borderRadius = '6px';
  dlBtn.style.fontSize = '14px';
  dlBtn.style.fontWeight = 'bold';
  dlBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.5)';

  header.appendChild(closeBtn);
  header.appendChild(dlBtn);

  let iframe = document.createElement('iframe');
  iframe.src = pdfUrl;
  iframe.style.width = '100%';
  iframe.style.flex = '1';
  iframe.style.border = 'none';
  iframe.style.backgroundColor = '#E2E8F0';

  overlay.appendChild(header);
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);
}