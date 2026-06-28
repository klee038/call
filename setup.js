// =========================================
// 設定・名前入力・フロー管理 (setup.js)
// =========================================

// アプリ全体のデフォルト設定（localStorageに保存）
let defaultSettings = {
  isDouble: true,
  maxGames: 3,
  maxPoints: 15,
  hasCE: true,
  hasInterval: true,
  hasSetting: true,
  hasCourtSelect: true, 
  wakeLockMinutes: 3
};

let flowStep = 1;
let flowIsDouble = true;
let flowMaxGames = 3;
let flowMaxPoints = 15;
let flowHasCE = true;
let flowHasInterval = true;
let flowHasSetting = true;
let flowHasCourtSelect = true;

let txtTL = ""; let txtTR = "";
let txtPL1 = ""; let txtPL2 = "";
let txtPR1 = ""; let txtPR2 = "";

function loadDefaultSettings() {
  let saved = localStorage.getItem('call_default_settings');
  if (saved) {
    try {
      let parsed = JSON.parse(saved);
      defaultSettings = { ...defaultSettings, ...parsed };
    } catch (e) {}
  }
  flowIsDouble = defaultSettings.isDouble;
  flowMaxGames = defaultSettings.maxGames;
  flowMaxPoints = defaultSettings.maxPoints;
  flowHasCE = defaultSettings.hasCE;
  flowHasInterval = defaultSettings.hasInterval;
  flowHasSetting = defaultSettings.hasSetting;
  flowHasCourtSelect = defaultSettings.hasCourtSelect !== undefined ? defaultSettings.hasCourtSelect : true;
}
loadDefaultSettings();

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

  let leftHeaderActions = `
    <div style="display: flex; gap: 15px; align-items: center;">
      <button class="setting-icon-btn" onclick="openQRScannerModal()">
        <svg viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v4h-2v-4zm3 3h3v2h-3v-2z"/></svg>
      </button>
      <button class="setting-icon-btn" onclick="openRosterModal()">
        <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
      </button>
    </div>
  `;

  if (flowStep === 2) {
    leftHeaderActions = `
      <div style="display: flex; gap: 15px; align-items: center;">
        <button class="setting-icon-btn" onclick="openQRScannerModal()">
          <svg viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v4h-2v-4zm3 3h3v2h-3v-2z"/></svg>
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
  }

  const headerActionsHtml = `
    <div class="flow-header-actions">
      ${leftHeaderActions}
      <div style="display: flex; gap: 15px;">
        <button class="setting-icon-btn" onclick="openHistoryModal()">
          <svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
        </button>
        <button class="setting-icon-btn" onclick="openSettingModal()">
          <svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
        </button>
      </div>
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
      
      <!-- ★大改修：一番下のボタンを「QR発行(本部用)」と「NEXT」に分割配置 -->
      <div style="display: flex; justify-content: space-between; gap: 15px; margin-top: 25px;">
        <button class="action-btn" style="flex: 1; min-width: 0; background: #8B5CF6 !important; border-color: #8B5CF6;" onclick="previewAndGenerateStartQR()">GENERATE QR</button>
        <button class="action-btn" style="flex: 1; min-width: 0; margin-top: 0 !important;" onclick="flowNext()">NEXT</button>
      </div>
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

function swapPlayersSides() {
  const tlEl = document.getElementById("input-tl");
  const trEl = document.getElementById("input-tr");
  const pl1El = document.getElementById("input-pl1");
  const pr1El = document.getElementById("input-pr1");
  
  if (tlEl && trEl) {
    let temp = tlEl.value; tlEl.value = trEl.value; trEl.value = temp;
    txtTL = tlEl.value; txtTR = trEl.value;
  }
  if (pl1El && pr1El) {
    let temp = pl1El.value; pl1El.value = pr1El.value; pr1El.value = temp;
    txtPL1 = pl1El.value; txtPR1 = pr1El.value;
  }
  
  if (flowIsDouble) {
    const pl2El = document.getElementById("input-pl2");
    const pr2El = document.getElementById("input-pr2");
    if (pl2El && pr2El) {
      let temp = pl2El.value; pl2El.value = pr2El.value; pr2El.value = temp;
      txtPL2 = pl2El.value; txtPR2 = pr2El.value;
    }
  }
}

function saveCurrentPlayersToRoster() {
  let rosterData = [];
  try {
    let saved = localStorage.getItem('call_player_roster');
    if (saved) rosterData = JSON.parse(saved);
  } catch(e) {}

  let addedCount = 0;
  let defaultNames = ["PlayerA1", "PlayerA2", "PlayerB1", "PlayerB2"];
  
  const addIfValid = (nameId, teamId) => {
    const nameEl = document.getElementById(nameId);
    const teamEl = document.getElementById(teamId);
    if (!nameEl) return;
    
    let nameVal = nameEl.value.trim();
    let teamVal = teamEl ? teamEl.value.trim() : "";
    
    if (!nameVal || defaultNames.includes(nameVal)) return;
    
    if (!rosterData.some(r => r.name === nameVal && (r.team || "") === teamVal)) {
      rosterData.push({
        name: nameVal,
        team: teamVal
      });
      addedCount++;
    }
  };

  addIfValid("input-pl1", "input-tl");
  addIfValid("input-pr1", "input-tr");
  if (flowIsDouble) {
    addIfValid("input-pl2", "input-tl");
    addIfValid("input-pr2", "input-tr");
  }

  if (addedCount > 0) {
    try { localStorage.setItem('call_player_roster', JSON.stringify(rosterData)); } catch(e) {}
    if (typeof renderRosterList === 'function') renderRosterList();
    alert(`${addedCount}名のプレイヤーを名簿に登録しました！`);
  } else {
    alert("新しく登録できるプレイヤーがいません。\n（入力が空欄、初期値のまま、または既に同じ内容で登録済です）");
  }
}

function setDouble(val) { flowIsDouble = val; renderFlow(); }
function setMaxGames(val) { flowMaxGames = val; renderFlow(); }
function setMaxPoints(val) { flowMaxPoints = val; renderFlow(); }
function setCE(val) { flowHasCE = val; renderFlow(); }
function setIntervalOption(val) { flowHasInterval = val; renderFlow(); }
function setSettingOpt(val) { flowHasSetting = val; renderFlow(); }
function setCourtSelect(val) { flowHasCourtSelect = val; renderFlow(); }

// =========================================
// ★新設：送信側（本部）の確認ダイアログとQR発行処理
// =========================================
function previewAndGenerateStartQR() {
  let tLVal = document.getElementById("input-tl").value.trim();
  let tRVal = document.getElementById("input-tr").value.trim();
  let pL1Val = document.getElementById("input-pl1").value.trim() || "PlayerA1";
  let pR1Val = document.getElementById("input-pr1").value.trim() || "PlayerB1";
  let pL2Val = document.getElementById("input-pl2") ? document.getElementById("input-pl2").value.trim() || "PlayerA2" : "";
  let pR2Val = document.getElementById("input-pr2") ? document.getElementById("input-pr2").value.trim() || "PlayerB2" : "";

  let typeStr = flowIsDouble ? "ダブルス" : "シングルス";
  let ruleStr = `${typeStr} / ${flowMaxGames}G / ${flowMaxPoints}pt`;
  let leftTeamStr = tLVal ? `[${tLVal}] ` : "";
  let rightTeamStr = tRVal ? `[${tRVal}] ` : "";
  let leftPlayers = flowIsDouble ? `${pL1Val} & ${pL2Val}` : pL1Val;
  let rightPlayers = flowIsDouble ? `${pR1Val} & ${pR2Val}` : pR1Val;

  let confirmMsg = `以下の情報で開始QRを発行しますか？\n\n` +
                   `【ルール】${ruleStr}\n\n` +
                   `【LEFT】${leftTeamStr}${leftPlayers}\n` +
                   `【RIGHT】${rightTeamStr}${rightPlayers}`;

  if (confirm(confirmMsg)) {
    // 承認されたら、入力中の情報をオブジェクトに組み立てて ui.js のQR生成関数に直接投げる
    let matchData = {
      flowIsDouble: flowIsDouble,
      flowMaxGames: flowMaxGames,
      flowMaxPoints: flowMaxPoints,
      flowHasCE: flowHasCE,
      flowHasInterval: flowHasInterval,
      flowHasSetting: flowHasSetting,
      flowHasCourtSelect: flowHasCourtSelect,
      tL: tLVal,
      tR: tRVal,
      n: [pL1Val, pL2Val, pR1Val, pR2Val]
    };
    if (typeof generateStartMatchQR === 'function') {
      generateStartMatchQR(matchData);
    }
  }
}


function flowNext() {
  if (flowStep === 1) {
    flowStep = 2;
    renderFlow();
  } else if (flowStep === 2) {
    let tLVal = document.getElementById("input-tl").value.trim();
    let tRVal = document.getElementById("input-tr").value.trim();
    let pL1Val = document.getElementById("input-pl1").value.trim();
    let pR1Val = document.getElementById("input-pr1").value.trim();
    let pL2Val = document.getElementById("input-pl2") ? document.getElementById("input-pl2").value.trim() : "";
    let pR2Val = document.getElementById("input-pr2") ? document.getElementById("input-pr2").value.trim() : "";

    txtTL = tLVal;
    txtTR = tRVal;

    txtPL1 = pL1Val ? pL1Val : "PlayerA1";
    txtPR1 = pR1Val ? pR1Val : "PlayerB1";
    if (document.getElementById("input-pl2")) txtPL2 = pL2Val ? pL2Val : "PlayerA2";
    if (document.getElementById("input-pr2")) txtPR2 = pR2Val ? pR2Val : "PlayerB2";

    flowStep = 3;
    renderFlow();
  }
}

function flowPrev() {
  document.getElementById("role-selection-overlay").style.display = "none";
  document.getElementById("board-ui").style.display = "none";
  document.getElementById("game-flow-container").style.display = "flex";
  flowStep = 3;
  renderFlow();
}

function flowBack() {
  if (flowStep > 1) {
    flowStep--;
    renderFlow();
  }
}

let tempSettings = {};

function openSettingModal() {
  const overlay = document.getElementById("setting-overlay");
  if (!overlay) return;
  tempSettings = { ...defaultSettings };
  overlay.style.display = "flex";
  renderSettingModal();
}

function closeSettingModal() {
  const overlay = document.getElementById("setting-overlay");
  if (overlay) overlay.style.display = "none";
}

function updateTempSetting(key, value) {
  tempSettings[key] = value;
  renderSettingModal();
}

function applySettings() {
  defaultSettings = { ...tempSettings };
  localStorage.setItem('call_default_settings', JSON.stringify(defaultSettings));

  flowIsDouble = defaultSettings.isDouble;
  flowMaxGames = defaultSettings.maxGames;
  flowMaxPoints = defaultSettings.maxPoints;
  flowHasCE = defaultSettings.hasCE;
  flowHasInterval = defaultSettings.hasInterval;
  flowHasSetting = defaultSettings.hasSetting;
  flowHasCourtSelect = defaultSettings.hasCourtSelect !== undefined ? defaultSettings.hasCourtSelect : false;

  resetWakeLockTimer();
  renderFlow();
  updateBoardFormatInfo();

  if (typeof saveActiveBackup === 'function') saveActiveBackup();
  
  closeSettingModal();
}

function renderSettingModal() {
  const content = document.getElementById("setting-modal-content");
  if (!content) return;

  content.innerHTML = `
    <div style="overflow-y: auto; max-height: 50vh; display: flex; flex-direction: column; gap: 5px; width: 100%; padding-right: 4px; box-sizing: border-box;">
      <div class="setting-row">
        <div class="setting-label">種目</div>
        <div class="toggle-group">
          <button class="toggle-item ${!tempSettings.isDouble ? 'selected' : ''}" onclick="updateTempSetting('isDouble', false)">SINGLES</button>
          <button class="toggle-item ${tempSettings.isDouble ? 'selected' : ''}" onclick="updateTempSetting('isDouble', true)">DOUBLES</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">ゲーム数</div>
        <div class="toggle-group">
          <button class="toggle-item ${tempSettings.maxGames === 1 ? 'selected' : ''}" onclick="updateTempSetting('maxGames', 1)">1G</button>
          <button class="toggle-item ${tempSettings.maxGames === 3 ? 'selected' : ''}" onclick="updateTempSetting('maxGames', 3)">3G</button>
          <button class="toggle-item ${tempSettings.maxGames === 5 ? 'selected' : ''}" onclick="updateTempSetting('maxGames', 5)">5G</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">点数</div>
        <div class="toggle-group">
          <button class="toggle-item ${tempSettings.maxPoints === 11 ? 'selected' : ''}" onclick="updateTempSetting('maxPoints', 11)">11pt</button>
          <button class="toggle-item ${tempSettings.maxPoints === 15 ? 'selected' : ''}" onclick="updateTempSetting('maxPoints', 15)">15pt</button>
          <button class="toggle-item ${tempSettings.maxPoints === 21 ? 'selected' : ''}" onclick="updateTempSetting('maxPoints', 21)">21pt</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">デュース</div>
        <div class="toggle-group">
          <button class="toggle-item ${!tempSettings.hasSetting ? 'selected' : ''}" onclick="updateTempSetting('hasSetting', false)">なし</button>
          <button class="toggle-item ${tempSettings.hasSetting ? 'selected' : ''}" onclick="updateTempSetting('hasSetting', true)">あり</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">チェンジエンズ</div>
        <div class="toggle-group">
          <button class="toggle-item ${!tempSettings.hasCE ? 'selected' : ''}" onclick="updateTempSetting('hasCE', false)">なし</button>
          <button class="toggle-item ${tempSettings.hasCE ? 'selected' : ''}" onclick="updateTempSetting('hasCE', true)">あり</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">インターバル</div>
        <div class="toggle-group">
          <button class="toggle-item ${!tempSettings.hasInterval ? 'selected' : ''}" onclick="updateTempSetting('hasInterval', false)">なし</button>
          <button class="toggle-item ${tempSettings.hasInterval ? 'selected' : ''}" onclick="updateTempSetting('hasInterval', true)">あり</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">コート選択</div>
        <div class="toggle-group">
          <button class="toggle-item ${!tempSettings.hasCourtSelect ? 'selected' : ''}" onclick="updateTempSetting('hasCourtSelect', false)">なし</button>
          <button class="toggle-item ${tempSettings.hasCourtSelect ? 'selected' : ''}" onclick="updateTempSetting('hasCourtSelect', true)">あり</button>
        </div>
      </div>
      <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div class="setting-label" style="margin-bottom: 5px;">画面スリープ防止（Wake Lock）</div>
        <div class="toggle-group" style="width: 100%;">
          <button class="toggle-item ${tempSettings.wakeLockMinutes === 0 ? 'selected' : ''}" onclick="updateTempSetting('wakeLockMinutes', 0)" style="flex:1; padding: 8px 0; font-size: 13px;">端末設定</button>
          <button class="toggle-item ${tempSettings.wakeLockMinutes === 3 ? 'selected' : ''}" onclick="updateTempSetting('wakeLockMinutes', 3)" style="flex:1; padding: 8px 0; font-size: 13px;">3分</button>
          <button class="toggle-item ${tempSettings.wakeLockMinutes === 5 ? 'selected' : ''}" onclick="updateTempSetting('wakeLockMinutes', 5)" style="flex:1; padding: 8px 0; font-size: 13px;">5分</button>
          <button class="toggle-item ${tempSettings.wakeLockMinutes === 10 ? 'selected' : ''}" onclick="updateTempSetting('wakeLockMinutes', 10)" style="flex:1; padding: 8px 0; font-size: 13px;">10分</button>
        </div>
      </div>
      <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 10px; border-bottom: none; padding-top: 15px;">
        <div class="setting-label" style="color: #EF4444; font-size: 14px;">データリセット (危険)</div>
        <div style="display: flex; gap: 8px; width: 100%;">
          <button class="roster-delete-btn" style="flex: 1; padding: 10px 0; font-size: 12px; color: #EF4444; border-color: #EF4444;" onclick="clearAllHistory()">履歴の全削除</button>
          <button class="roster-delete-btn" style="flex: 1; padding: 10px 0; font-size: 12px; color: #EF4444; border-color: #EF4444;" onclick="clearAllRoster()">名簿の全削除</button>
        </div>
        <button class="roster-delete-btn" style="width: 100%; padding: 10px 0; font-size: 12px; background: rgba(239,68,68,0.1); color: #EF4444; border-color: #EF4444;" onclick="factoryResetApp()">アプリの初期化 (全データ削除)</button>
      </div>
    </div>
    <button class="action-btn" style="width: 100%; background: #333333 !important; margin-top: 20px !important;" onclick="applySettings()">APPLY</button>
  `;
}

function clearAllHistory() {
  if (confirm("試合履歴を全て削除します。\n（元には戻せません）よろしいですか？")) {
    localStorage.removeItem('call_match_history');
    alert("試合履歴を全件削除しました。");
  }
}

function factoryResetApp() {
  if (confirm("アプリの全てのデータ（履歴、名簿、設定、現在進行中の試合）を削除し、初期状態に戻します。\n本当によろしいですか？")) {
    localStorage.clear();
    alert("アプリを初期化しました。画面を再読み込みします。");
    location.reload();
  }
}

let wakeLock = null;
let wakeLockTimer = null;

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      if (wakeLock !== null) return;
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
      });
    } catch (err) {
      console.warn('Wake Lock API がサポートされていないか、ブロックされました:', err);
    }
  }
}

function releaseWakeLock() {
  if (wakeLock !== null) {
    wakeLock.release().then(() => { wakeLock = null; });
  }
}

function resetWakeLockTimer() {
  if (defaultSettings.wakeLockMinutes <= 0) {
    releaseWakeLock();
    return;
  }
  requestWakeLock();
  if (wakeLockTimer !== null) {
    clearTimeout(wakeLockTimer);
  }
  wakeLockTimer = setTimeout(() => {
    releaseWakeLock();
  }, defaultSettings.wakeLockMinutes * 60 * 1000);
}

document.addEventListener('touchstart', resetWakeLockTimer, {passive: true});
document.addEventListener('click', resetWakeLockTimer, {passive: true});


// =========================================
// QRスキャンデータの受け取りと自動ワープ処理
// =========================================

function checkScannedQRDataOnLoad() {
  let scannedDataString = sessionStorage.getItem('call_qr_scanned_data');
  if (scannedDataString) {
    try {
      let binaryString = atob(scannedDataString);
      let charArray = binaryString.split('').map(c => c.charCodeAt(0));
      let uint8Array = new Uint8Array(charArray);
      let decompressedUint8 = pako.inflate(uint8Array);
      let decompressedText = new TextDecoder().decode(decompressedUint8);
      let matchData = JSON.parse(decompressedText);

      sessionStorage.removeItem('call_qr_scanned_data');

      let isMatchInProgress = (matchData.sL > 0 || matchData.sR > 0 || matchData.gL > 0 || matchData.gR > 0);

      if (isMatchInProgress) {
        if (typeof resumeMatchFromState === 'function') {
          setTimeout(() => { resumeMatchFromState(matchData); }, 100);
        }
      } else {
        setTimeout(() => { applyScannedMatchData(matchData); }, 100);
      }

    } catch (e) {
      console.error("QRデータの復元に失敗しました", e);
      sessionStorage.removeItem('call_qr_scanned_data');
    }
  }
}
checkScannedQRDataOnLoad();


// =========================================
// ★改修：受信側（主審）の確認ダイアログとフロー振り分け
// =========================================
function processScannedData(data) {
  if (!data || typeof data !== 'object') {
    alert("無効なデータ形式です。");
    return;
  }

  if (data.isOver) {
    try {
      let historyList = [];
      let saved = localStorage.getItem('call_match_history');
      if (saved) historyList = JSON.parse(saved);

      let now = new Date();
      let dateStr = now.getFullYear() + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + ('0' + now.getDate()).slice(-2) + ' ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);

      let teamLName = data.tL ? data.tL : (data.flowIsDouble ? `${data.nL1} & ${data.nL2}` : data.nL1);
      let teamRName = data.tR ? data.tR : (data.flowIsDouble ? `${data.nR1} & ${data.nR2}` : data.nR1);
      let matchTitle = `${teamLName} vs ${teamRName}`;

      let matchScoreStr = `${data.gL} - ${data.gR}`;
      let gameDetails = (data.matchScoreHistory || []).map(g => `${g.a}-${g.b}`).join(', ');

      let newItem = {
        id: now.getTime().toString(),
        date: dateStr,
        title: matchTitle,
        status: "FINISHED",
        score: matchScoreStr,
        details: gameDetails,
        state: data 
      };

      historyList.unshift(newItem);
      localStorage.setItem('call_match_history', JSON.stringify(historyList));
      
      alert("終了済みの試合データを受信し、履歴（MATCH HISTORY）に追加しました。");
      
      if (typeof renderHistoryList === 'function') {
        renderHistoryList();
      }
      return; 

    } catch (e) {
      alert("履歴への保存に失敗しました。");
      console.error(e);
      return;
    }
  }

  let isInterruptedMatch = false;
  if (data.recorderData && Array.isArray(data.recorderData.timeline) && data.recorderData.timeline.length > 0) {
    isInterruptedMatch = true;
  }

  if (isInterruptedMatch) {
    if (typeof resumeMatchFromState === 'function') {
      resumeMatchFromState(data);
    }
  } else {
    // 【本部からの初期データ受信時の確認ダイアログ】
    let isD = (data.flowIsDouble !== undefined) ? data.flowIsDouble : (data.d !== undefined ? data.d : true);
    let names = Array.isArray(data.n) ? data.n : [];
    let l1 = data.nL1 || names[0] || "PlayerA1";
    let l2 = isD ? (data.nL2 || names[1] || "PlayerA2") : "";
    let r1 = data.nR1 || names[2] || "PlayerB1";
    let r2 = isD ? (data.nR2 || names[3] || "PlayerB2") : "";
    
    let lTeam = data.tL ? `[${data.tL}] ` : "";
    let rTeam = data.tR ? `[${data.tR}] ` : "";
    
    let lPlayers = isD ? `${l1} & ${l2}` : l1;
    let rPlayers = isD ? `${r1} & ${r2}` : r1;
    
    let confirmMsg = `以下の試合データを受信しました。\nこの試合を開始（トス画面へ移動）しますか？\n\n` +
                     `【LEFT】${lTeam}${lPlayers}\n` +
                     `【RIGHT】${rTeam}${rPlayers}`;

    // ★ OK が押された場合のみ代入してトス画面へ進む
    if (confirm(confirmMsg)) {
      flowIsDouble = isD;
      flowMaxGames = (data.flowMaxGames !== undefined) ? data.flowMaxGames : (data.g !== undefined ? data.g : 3);
      flowMaxPoints = (data.flowMaxPoints !== undefined) ? data.flowMaxPoints : (data.p !== undefined ? data.p : 15);
      flowHasSetting = (data.flowHasSetting !== undefined) ? data.flowHasSetting : (data.s !== undefined ? data.s : true);
      flowHasCourtSelect = (data.flowHasCourtSelect !== undefined) ? data.flowHasCourtSelect : (data.hc !== undefined ? data.hc : true);
      
      txtTL = data.tL || "";
      txtTR = data.tR || "";
      txtPL1 = data.nL1 || names[0] || "";
      txtPL2 = isD ? (data.nL2 || names[1] || "") : "";
      txtPR1 = data.nR1 || names[2] || "";
      txtPR2 = isD ? (data.nR2 || names[3] || "") : "";

      if (flowHasCourtSelect) {
        flowStep = 3;
      } else {
        flowStep = 1; // コート選択なしは通常あり得ないが安全のため
      }
      renderFlow();
    } else {
      // CANCEL された場合は何事もなかったかのように元の画面を描画し直す
      renderFlow();
    }
  }
}