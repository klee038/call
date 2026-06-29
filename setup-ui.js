// =========================================
// 試合準備画面のUI描画処理 (setup-ui.js)
// =========================================

function updateBoardFormatInfo() {
  const infoEl = document.getElementById("board-format-info");
  if (!infoEl) return;
  
  let typeStr = flowIsDouble ? "DOUBLES" : "SINGLES";
  let gameStr = `${flowMaxGames}G`;
  let ptStr = `${flowMaxPoints}pt`;
  let deuceLimit = (flowMaxPoints === 21) ? 30 : ((flowMaxPoints === 15) ? 21 : 15);
  let settingStr = flowHasSetting ? `デュースあり (${deuceLimit})` : "デュースなし";
  
  infoEl.innerText = `${typeStr} / ${gameStr} / ${ptStr} / ${settingStr}`;
}

function renderFlow() {
  const contentArea = document.getElementById("flow-content-area");
  const backBar = document.getElementById("back-nav-bar");
  if (!contentArea) return;
  
  if (flowStep > 1) { if (backBar) backBar.style.display = "block"; } else { if (backBar) backBar.style.display = "none"; }

  updateBoardFormatInfo();

  const scanSvg = `<svg viewBox="0 0 24 24"><path d="M4 4h4v2H6v2H4V4zm16 0h-4v2h2v2h2V4zM4 20h4v-2H6v-2H4v4zm16 0h-4v-2h2v-2h2v4zM9 9h6v6H9V9z"/></svg>`;
  const qrGenSvg = `<svg viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v4h-2v-4zm3 3h3v2h-3v-2z"/></svg>`;

  let leftHeaderActions = `
    <div style="display: flex; gap: 15px; align-items: center;">
      <button class="setting-icon-btn" onclick="openQRScannerModal()">
        ${scanSvg}
      </button>
      <button class="setting-icon-btn" onclick="openRosterModal()">
        <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
      </button>
    </div>
  `;

  let rightHeaderActions = `
    <div style="display: flex; gap: 15px;">
      <button class="setting-icon-btn" onclick="openHistoryModal()">
        <svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
      </button>
      <button class="setting-icon-btn" onclick="openSettingModal()">
        <svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
      </button>
    </div>
  `;

  if (flowStep === 2) {
    leftHeaderActions = `
      <div style="display: flex; gap: 15px; align-items: center;">
        <button class="setting-icon-btn" onclick="openQRScannerModal()">
          ${scanSvg}
        </button>
        <button class="setting-icon-btn" onclick="openRosterModal()">
          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
        </button>
        <button class="setting-icon-btn" onclick="saveCurrentPlayersToRoster()">
          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4z"/></svg>
        </button>
        ${!flowHasCourtSelect ? `
        <button class="swap-sides-btn" onclick="swapPlayersSides()">
          <svg viewBox="0 0 24 24"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>
          入替
        </button>
        ` : ''}
      </div>
    `;

    rightHeaderActions = `
      <div style="display: flex; gap: 15px;">
        <button class="setting-icon-btn" onclick="previewAndGenerateStartQR()">
          ${qrGenSvg}
        </button>
        <button class="setting-icon-btn" onclick="openHistoryModal()">
          <svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
        </button>
        <button class="setting-icon-btn" onclick="openSettingModal()">
          <svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
        </button>
      </div>
    `;
  }

  const headerActionsHtml = `
    <div class="flow-header-actions">
      ${leftHeaderActions}
      ${rightHeaderActions}
    </div>
  `;

  if (flowStep === 1) {
    contentArea.innerHTML = `
      <div class="flow-title">MATCH FORMAT</div>
      ${headerActionsHtml}
      <div class="setting-row">
        <div class="setting-label">種目</div>
        <div class="toggle-group">
          <button class="toggle-item ${!flowIsDouble ? 'selected' : ''}" onclick="setDouble(false)">SINGLES</button>
          <button class="toggle-item ${flowIsDouble ? 'selected' : ''}" onclick="setDouble(true)">DOUBLES</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">ゲーム数</div>
        <div class="toggle-group">
          <button class="toggle-item ${flowMaxGames === 1 ? 'selected' : ''}" onclick="setMaxGames(1)">1G</button>
          <button class="toggle-item ${flowMaxGames === 3 ? 'selected' : ''}" onclick="setMaxGames(3)">3G</button>
          <button class="toggle-item ${flowMaxGames === 5 ? 'selected' : ''}" onclick="setMaxGames(5)">5G</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">点数</div>
        <div class="toggle-group">
          <button class="toggle-item ${flowMaxPoints === 11 ? 'selected' : ''}" onclick="setMaxPoints(11)">11pt</button>
          <button class="toggle-item ${flowMaxPoints === 15 ? 'selected' : ''}" onclick="setMaxPoints(15)">15pt</button>
          <button class="toggle-item ${flowMaxPoints === 21 ? 'selected' : ''}" onclick="setMaxPoints(21)">21pt</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">デュース</div>
        <div class="toggle-group">
          <button class="toggle-item ${!flowHasSetting ? 'selected' : ''}" onclick="setSettingOpt(false)">なし</button>
          <button class="toggle-item ${flowHasSetting ? 'selected' : ''}" onclick="setSettingOpt(true)">あり</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">チェンジエンズ</div>
        <div class="toggle-group">
          <button class="toggle-item ${!flowHasCE ? 'selected' : ''}" onclick="setCE(false)">なし</button>
          <button class="toggle-item ${flowHasCE ? 'selected' : ''}" onclick="setCE(true)">あり</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">インターバル</div>
        <div class="toggle-group">
          <button class="toggle-item ${!flowHasInterval ? 'selected' : ''}" onclick="setIntervalOption(false)">なし</button>
          <button class="toggle-item ${flowHasInterval ? 'selected' : ''}" onclick="setIntervalOption(true)">あり</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">コート選択</div>
        <div class="toggle-group">
          <button class="toggle-item ${!flowHasCourtSelect ? 'selected' : ''}" onclick="setCourtSelect(false)">なし</button>
          <button class="toggle-item ${flowHasCourtSelect ? 'selected' : ''}" onclick="setCourtSelect(true)">あり</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">開始コール</div>
        <div class="toggle-group">
          <button class="toggle-item ${!flowIsOfficialCall ? 'selected' : ''}" onclick="setOfficialCall(false)">なし</button>
          <button class="toggle-item ${flowIsOfficialCall ? 'selected' : ''}" onclick="setOfficialCall(true)">あり</button>
        </div>
      </div>
      <button class="action-btn" onclick="flowNext()">NEXT</button>
    `;
  } 
  else if (flowStep === 2) {
    const selectIconSvg = `<svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>`;

    let dispPL1 = (txtPL1 === "PlayerA1") ? "" : txtPL1;
    let dispPR1 = (txtPR1 === "PlayerB1") ? "" : txtPR1;
    let dispPL2 = (txtPL2 === "PlayerA2") ? "" : txtPL2;
    let dispPR2 = (txtPR2 === "PlayerB2") ? "" : txtPR2;

    contentArea.innerHTML = `
      <div class="flow-title">PLAYERS</div>
      ${headerActionsHtml}
      <div class="names-container">
        <div class="names-column">
          <div class="column-title" style="color: #FFFFFF;">LEFT</div>
          <div class="input-field-group">
            <label>Team</label>
            <input type="text" class="smart-field" id="input-tl" value="${txtTL}" placeholder="チーム名 (任意)">
            <button class="select-icon-btn" onclick="openTeamSelectModal('input-tl')">${selectIconSvg}</button>
          </div>
          <div class="input-field-group">
            <label>Player 1</label>
            <input type="text" class="smart-field" id="input-pl1" value="${dispPL1}" placeholder="PlayerA1">
            <button class="select-icon-btn" onclick="openPlayerSelectModal('input-pl1')">${selectIconSvg}</button>
          </div>
          ${flowIsDouble ? `
          <div class="input-field-group">
            <label>Player 2</label>
            <input type="text" class="smart-field" id="input-pl2" value="${dispPL2}" placeholder="PlayerA2">
            <button class="select-icon-btn" onclick="openPlayerSelectModal('input-pl2')">${selectIconSvg}</button>
          </div>` : ''}
        </div>
        <div class="names-column">
          <div class="column-title" style="color: #FFFFFF;">RIGHT</div>
          <div class="input-field-group">
            <label>Team</label>
            <input type="text" class="smart-field" id="input-tr" value="${txtTR}" placeholder="チーム名 (任意)">
            <button class="select-icon-btn" onclick="openTeamSelectModal('input-tr')">${selectIconSvg}</button>
          </div>
          <div class="input-field-group">
            <label>Player 1</label>
            <input type="text" class="smart-field" id="input-pr1" value="${dispPR1}" placeholder="PlayerB1">
            <button class="select-icon-btn" onclick="openPlayerSelectModal('input-pr1')">${selectIconSvg}</button>
          </div>
          ${flowIsDouble ? `
          <div class="input-field-group">
            <label>Player 2</label>
            <input type="text" class="smart-field" id="input-pr2" value="${dispPR2}" placeholder="PlayerB2">
            <button class="select-icon-btn" onclick="openPlayerSelectModal('input-pr2')">${selectIconSvg}</button>
          </div>` : ''}
        </div>
      </div>
      
      <button class="action-btn" onclick="flowNext()">NEXT</button>
    `;
  } 
  else if (flowStep === 3) {
    let nameL = getTossName(txtTL, txtPL1, txtPL2);
    let nameR = getTossName(txtTR, txtPR1, txtPR2);

    let html = `
      <div class="flow-title">TOSS</div>
      <div class="flow-title step3">TOSS WINNER</div>
      <div class="toss-row">
        <button class="toss-btn ${tossWinner === 'L' ? 'selected' : ''}" onclick="setTossWinner('L')">${nameL}</button>
        <button class="toss-btn ${tossWinner === 'R' ? 'selected' : ''}" onclick="setTossWinner('R')">${nameR}</button>
      </div>
    `;

    if (tossWinner !== null) {
      let actualWinnerName = (tossWinner === 'L') ? nameL : nameR;
      
      html += `
        <div class="flow-title step3">WINNER CHOOSES</div>
        <div class="toss-name-label">${actualWinnerName}</div>
        <div class="choice-box">
          <div class="choice-grid">
            <button class="choice-btn ${winnerChoice === 'SERVICE' ? 'selected' : ''}" onclick="setWinnerChoice('SERVICE')">SERVICE</button>
            <button class="choice-btn ${winnerChoice === 'RECEIVE' ? 'selected' : ''}" onclick="setWinnerChoice('RECEIVE')">RECEIVE</button>
          </div>
      `;
      if (flowHasCourtSelect) {
        html += `
          <div class="choice-grid">
            <button class="choice-btn ${winnerChoice === 'LEFT' ? 'selected' : ''}" onclick="setWinnerChoice('LEFT')">LEFT</button>
            <button class="choice-btn ${winnerChoice === 'RIGHT' ? 'selected' : ''}" onclick="setWinnerChoice('RIGHT')">RIGHT</button>
          </div>
        `;
      }
      html += `</div>`;
    }

    if (winnerChoice !== null) {
      if (!flowHasCourtSelect) {
        html += `<button class="action-btn" onclick="finalizeAndStart()">START MATCH</button>`;
      } else {
        let actualLoserName = (tossWinner === 'L') ? nameR : nameL;
        
        html += `
          <div class="flow-title step3">LOSER CHOOSES</div>
          <div class="toss-name-label">${actualLoserName}</div>
          <div class="choice-box">
        `;
        if (winnerChoice === 'SERVICE' || winnerChoice === 'RECEIVE') {
          html += `
            <div class="choice-grid">
              <button class="choice-btn ${loserChoice === 'LEFT' ? 'selected' : ''}" onclick="setLoserChoice('LEFT')">LEFT</button>
              <button class="choice-btn ${loserChoice === 'RIGHT' ? 'selected' : ''}" onclick="setLoserChoice('RIGHT')">RIGHT</button>
            </div>
          `;
        } else {
          html += `
            <div class="choice-grid">
              <button class="choice-btn ${loserChoice === 'SERVICE' ? 'selected' : ''}" onclick="setLoserChoice('SERVICE')">SERVICE</button>
              <button class="choice-btn ${loserChoice === 'RECEIVE' ? 'selected' : ''}" onclick="setLoserChoice('RECEIVE')">RECEIVE</button>
            </div>
          `;
        }
        html += `</div>`;
        
        if (loserChoice !== null) {
          html += `<button class="action-btn" onclick="finalizeAndStart()">START MATCH</button>`;
        }
      }
    }

    contentArea.innerHTML = html;
  }
}