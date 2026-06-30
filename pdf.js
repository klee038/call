// =========================================
// PDFスコアシート生成処理 (pdf.js)
// =========================================

function generatePDF(state) {
  let container = document.createElement('div');
  container.id = 'pdf-export-container';
  
  let isDouble = state.flowIsDouble;
  let typeStr = isDouble ? "ダブルス" : "シングルス";
  let games = state.flowMaxGames || 3;
  let points = state.flowMaxPoints || 21;
  let hasSetting = state.flowHasSetting !== undefined ? state.flowHasSetting : true;
  let isTeamMatch = state.flowIsTeamMatch !== undefined ? state.flowIsTeamMatch : false;
  
  // ★ 5ゲームマッチかどうかを判定
  let is5Games = (games >= 5);
  
  let matchTypeStr = `${typeStr} ${games}G ${points}pt`;
  if (hasSetting) {
      let deuceLimit = (points === 21) ? 30 : ((points === 15) ? 21 : 15);
      matchTypeStr += ` (${deuceLimit})`;
  }
  
  let tournamentTypeLabel = isTeamMatch ? "団体戦" : "個人戦";

  // ★ 新しいチーム変数を結合して旧仕様（1枠表示）に合わせる
  let combTL = (state.initialTL1 === state.initialTL2 || !state.initialTL2) ? state.initialTL1 : `${state.initialTL1} / ${state.initialTL2}`;
  let combTR = (state.initialTR1 === state.initialTR2 || !state.initialTR2) ? state.initialTR1 : `${state.initialTR1} / ${state.initialTR2}`;

  let tLName = combTL || state.initialTL || state.tL || "";
  let tRName = combTR || state.initialTR || state.tR || "";

  let nL1 = state.initialNL1 || state.nL1 || "";
  let nL2 = isDouble ? (state.initialNL2 || state.nL2 || "") : "";
  let nR1 = state.initialNR1 || state.nR1 || "";
  let nR2 = isDouble ? (state.initialNR2 || state.nR2 || "") : "";

  let histStrs = state.matchScoreHistory || [];
  let g1Score = histStrs[0] ? `${histStrs[0].a} － ${histStrs[0].b}` : "  －  ";
  let g2Score = histStrs[1] ? `${histStrs[1].a} － ${histStrs[1].b}` : "  －  ";
  let g3Score = histStrs[2] ? `${histStrs[2].a} － ${histStrs[2].b}` : "  －  ";
  let g4Score = histStrs[3] ? `${histStrs[3].a} － ${histStrs[3].b}` : "  －  ";
  let g5Score = histStrs[4] ? `${histStrs[4].a} － ${histStrs[4].b}` : "  －  ";

  let totalMatchScoreL = 0;
  let totalMatchScoreR = 0;
  histStrs.forEach(game => {
    if (game.a > game.b) totalMatchScoreL++;
    else if (game.b > game.a) totalMatchScoreR++;
  });
  let displayTotalL = (histStrs.length > 0) ? totalMatchScoreL : "";
  let displayTotalR = (histStrs.length > 0) ? totalMatchScoreR : "";
  let matchDate = state.date ? state.date.split(' ')[0] : "";

  const getGameRowsHTML = (gameIndex, gameLabelStr, isLastGame) => {
    let tableData = [];
    if (typeof Recorder !== 'undefined' && state.recorderData) {
        tableData = Recorder.generateTableData(state.recorderData, gameIndex, state.flowMaxPoints, state.flowHasSetting);
    } else {
        tableData = Array.from({length: 4}, () => new Array(68).fill("")); 
    }

    let label = "第<br>一<br>ゲ<br>｜<br>ム";
    if (gameLabelStr === "2") label = "第<br>二<br>ゲ<br>｜<br>ム";
    else if (gameLabelStr === "3") label = "第<br>三<br>ゲ<br>｜<br>ム";
    else if (gameLabelStr === "4") label = "第<br>四<br>ゲ<br>｜<br>ム";
    else if (gameLabelStr === "5") label = "第<br>五<br>ゲ<br>｜<br>ム";

    let rowsHtml = "";
    let players = [nL1, nL2, nR1, nR2];

    let gameFinalL = histStrs[gameIndex] ? histStrs[gameIndex].a : "";
    let gameFinalR = histStrs[gameIndex] ? histStrs[gameIndex].b : "";
    let limit = state.flowMaxPoints || 21;
    let deucePt = limit - 1;
    let localHasSetting = state.flowHasSetting !== undefined ? state.flowHasSetting : true;
    let displayFinalL = gameFinalL;
    let displayFinalR = gameFinalR;
    
    if (localHasSetting && gameFinalL !== "" && gameFinalR !== "") {
        if (gameFinalL >= deucePt && gameFinalR >= deucePt) {
            displayFinalL = `<span style="border-bottom: 1px solid #000000; padding-bottom: 2px; display: inline-block; line-height: 1;">${gameFinalL}</span>`;
            displayFinalR = `<span style="border-bottom: 1px solid #000000; padding-bottom: 2px; display: inline-block; line-height: 1;">${gameFinalR}</span>`;
        }
    }

    for (let r = 0; r < 8; r++) {
      let isUpper = (r < 4); 
      let playerRowIndex = r % 4; 
      let rowClass = "";
      if (r === 3) rowClass = ' class="upper-last-row"';
      if (r === 7) rowClass = ' class="game-last-row"';
      rowsHtml += `<tr${rowClass}>`;

      if (isUpper) {
        if (r === 0) rowsHtml += `<td rowspan="4" class="game-label-col">${label}</td>`;
        rowsHtml += `<td class="player-row-col">${players[playerRowIndex]}</td>`;
        let srVal = tableData[playerRowIndex] && tableData[playerRowIndex][0] ? tableData[playerRowIndex][0] : "";
        rowsHtml += `<td class="serve-col">${srVal}</td>`;
      } else {
        if (r === 4) {
          let blankClass = isLastGame ? "lower-blank-area last-game-blank" : "lower-blank-area";
          rowsHtml += `<td colspan="3" rowspan="4" class="${blankClass}"></td>`;
        }
      }

      let startCol = isUpper ? 1 : 34; 
      let rallyCellCount = isUpper ? 33 : 31;

      for (let c = 0; c < rallyCellCount; c++) { 
        let colIndex = startCol + c;
        let cellVal = tableData[playerRowIndex] && tableData[playerRowIndex][colIndex] ? tableData[playerRowIndex][colIndex] : "";
        if (typeof cellVal === 'string' && cellVal.startsWith("W_")) cellVal = cellVal.replace("W_", "");
        
        let contentHtml = cellVal;
        if (typeof cellVal === 'string' && cellVal.startsWith("U_")) {
            let actualNumber = cellVal.replace("U_", "");
            contentHtml = `<span style="border-bottom: 1px solid #000000; padding-bottom: 1px; display: inline-block; line-height: 1;">${actualNumber}</span>`;
        }
        let preFinalClass = (!isUpper && c === rallyCellCount - 1) ? " pre-final-score" : "";
        rowsHtml += `<td class="rally-cell${preFinalClass}">${contentHtml}</td>`;
      }

      if (!isUpper) {
          if (r === 4) rowsHtml += `<td rowspan="2" colspan="2" class="final-score-box final-score-top">${displayFinalL}</td>`;
          else if (r === 6) rowsHtml += `<td rowspan="2" colspan="2" class="final-score-box final-score-bottom">${displayFinalR}</td>`;
      }
      rowsHtml += `</tr>`;
    }
    return rowsHtml;
  };

  let gamesBlocks = "";
  let totalGamesToPrint = is5Games ? 5 : 3;
  for (let i = 0; i < totalGamesToPrint; i++) {
      let labelStr = (i + 1).toString();
      let isLast = (i === totalGamesToPrint - 1);
      gamesBlocks += getGameRowsHTML(i, labelStr, isLast);
  }

  let allGamesHTML = `
    <div class="game-section">
      <table class="game-table">
        <colgroup>
          <col style="width: 2.5%;"> <col style="width: 14%;">  <col style="width: 2.5%;"> ${Array(33).fill('<col style="width: 2.454%;">').join('')}
        </colgroup>
        <tbody>
          ${gamesBlocks}
        </tbody>
      </table>
    </div>
  `;

  // ★ 3ゲームか5ゲームかで上部スコア表の結合ロジックを分岐
  let summaryTbodyHTML = "";

  if (is5Games) {
    // 5行になるが、Player1(rowspan=2)・Player2(rowspan=2)・チーム名(rowspan=1)として結合する
    summaryTbodyHTML = `
      <tr>
        <th rowspan="5" class="lr-label">L<br>・<br>R</th>
        <td rowspan="2" class="player-name-cell">${nL1}</td>
        <td rowspan="5" class="match-score-cell">${displayTotalL}</td>
        <td class="game-score-cell">${g1Score}</td>
        <td rowspan="5" class="match-score-cell">${displayTotalR}</td>
        <td rowspan="2" class="player-name-cell">${nR1}</td>
        <th rowspan="5" class="lr-label">L<br>・<br>R</th>
      </tr>
      <tr>
        <td class="game-score-cell">${g2Score}</td>
      </tr>
      <tr>
        <td rowspan="2" class="player-name-cell">${nL2}</td>
        <td class="game-score-cell">${g3Score}</td>
        <td rowspan="2" class="player-name-cell">${nR2}</td>
      </tr>
      <tr>
        <td class="game-score-cell">${g4Score}</td>
      </tr>
      <tr>
        <td class="team-name-cell">${tLName ? tLName : ''}</td>
        <td class="game-score-cell">${g5Score}</td>
        <td class="team-name-cell">${tRName ? tRName : ''}</td>
      </tr>
    `;
  } else {
    // 従来の3ゲーム用（1行ずつ）
    summaryTbodyHTML = `
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
    `;
  }

  container.innerHTML = `
    <div id="score-sheet-a4" class="score-sheet-page ${is5Games ? 'portrait' : ''}">
      <div class="sheet-title" style="color: #000; margin-top: 10px;">ス コ ア シ ー ト <span style="font-size:14px; letter-spacing: 2px;">(得点用紙)</span></div>
      <div class="sheet-header" style="color: #000;">
        <div class="header-side">
          <div class="header-line">大会名：<span class="line-blank"></span></div>
          <div class="header-line">大会種別：<span class="line-blank" style="font-size: 11px;">${tournamentTypeLabel}</span></div>
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
              ${summaryTbodyHTML}
            </tbody>
          </table>
        </div>
        <div class="header-side">
          <div class="header-line">種目：<span class="line-blank" style="font-size: 11px;">${matchTypeStr}</span></div>
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
  let element = document.getElementById('score-sheet-a4');
  let now = new Date();
  let dateStrPDF = now.getFullYear() + ('0'+(now.getMonth()+1)).slice(-2) + ('0'+now.getDate()).slice(-2) + "_" + ('0'+now.getHours()).slice(-2) + ('0'+now.getMinutes()).slice(-2);
  let safeTL = (tLName || "TeamL").replace(/\s+/g, '_').replace(/\//g, '-');
  let safeTR = (tRName || "TeamR").replace(/\s+/g, '_').replace(/\//g, '-');
  let filename = `${dateStrPDF}_${safeTL}_vs_${safeTR}.pdf`;

  let opt = {
    margin:       0,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: is5Games ? 'portrait' : 'landscape' }
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