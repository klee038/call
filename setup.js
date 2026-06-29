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
  isOfficialCall: true, 
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
let flowIsOfficialCall = true; 

let txtTL = ""; let txtTR = "";
let txtPL1 = ""; let txtPL2 = "";
let txtPR1 = ""; let txtPR2 = "";

// 設定の一時保持用変数
let tempSettings = {};

function setDouble(val) { flowIsDouble = val; renderFlow(); }
function setMaxGames(val) { flowMaxGames = val; renderFlow(); }
function setMaxPoints(val) { flowMaxPoints = val; renderFlow(); }
function setCE(val) { flowHasCE = val; renderFlow(); }
function setIntervalOption(val) { flowHasInterval = val; renderFlow(); }
function setSettingOpt(val) { flowHasSetting = val; renderFlow(); }
function setCourtSelect(val) { flowHasCourtSelect = val; renderFlow(); }
function setOfficialCall(val) { flowIsOfficialCall = val; renderFlow(); } 

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

function previewAndGenerateStartQR() {
  let tLVal = document.getElementById("input-tl").value.trim();
  let tRVal = document.getElementById("input-tr").value.trim();
  let pL1Val = document.getElementById("input-pl1").value.trim() || "PlayerA1";
  let pR1Val = document.getElementById("input-pr1").value.trim() || "PlayerB1";
  let pL2Val = document.getElementById("input-pl2") ? document.getElementById("input-pl2").value.trim() || "PlayerA2" : "";
  let pR2Val = document.getElementById("input-pr2") ? document.getElementById("input-pr2").value.trim() || "PlayerB2" : "";

  let typeStr = flowIsDouble ? "ダブルス" : "シングルス";
  let gameStr = `${flowMaxGames}G`;
  let ptStr = `${flowMaxPoints}pt`;
  let deuceLimit = (flowMaxPoints === 21) ? 30 : ((flowMaxPoints === 15) ? 21 : 15);
  let settingStr = flowHasSetting ? `デュースあり(${deuceLimit})` : "デュースなし";
  
  let ruleStr = `${typeStr} / ${gameStr} / ${ptStr} / ${settingStr}`;
  let leftTeamStr = tLVal ? `[${tLVal}] ` : "";
  let rightTeamStr = tRVal ? `[${tRVal}] ` : "";
  let leftPlayers = flowIsDouble ? `${pL1Val} & ${pL2Val}` : pL1Val;
  let rightPlayers = flowIsDouble ? `${pR1Val} & ${pR2Val}` : pR1Val;

  let confirmMsg = `以下の情報で本部用(開始)QRを発行しますか？\n\n` +
                   `【ルール】\n${ruleStr}\n\n` +
                   `【LEFT】\n${leftTeamStr}${leftPlayers}\n\n` +
                   `【RIGHT】\n${rightTeamStr}${rightPlayers}`;

  if (confirm(confirmMsg)) {
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