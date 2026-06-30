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
  isTeamMatch: false,
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
let flowIsTeamMatch = false;

let txtTL1 = ""; let txtTL2 = "";
let txtTR1 = ""; let txtTR2 = "";
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
function setTeamMatch(val) { flowIsTeamMatch = val; renderFlow(); }

// チーム1が入力された時、チーム2が空欄なら自動コピーする魔法の機能
function autoCopyTeam(side) {
  if (!flowIsDouble) return;
  if (side === 'L') {
    let t1 = document.getElementById("input-tl1");
    let t2 = document.getElementById("input-tl2");
    if (t1 && t2 && t1.value.trim() !== "" && t2.value.trim() === "") {
      t2.value = t1.value;
    }
  } else if (side === 'R') {
    let t1 = document.getElementById("input-tr1");
    let t2 = document.getElementById("input-tr2");
    if (t1 && t2 && t1.value.trim() !== "" && t2.value.trim() === "") {
      t2.value = t1.value;
    }
  }
}

function flowNext() {
  if (flowStep === 1) {
    flowStep = 2;
    renderFlow();
  } else if (flowStep === 2) {
    let tL1Val = document.getElementById("input-tl1").value.trim();
    let tR1Val = document.getElementById("input-tr1").value.trim();
    let pL1Val = document.getElementById("input-pl1").value.trim();
    let pR1Val = document.getElementById("input-pr1").value.trim();
    
    let tL2Val = document.getElementById("input-tl2") ? document.getElementById("input-tl2").value.trim() : "";
    let tR2Val = document.getElementById("input-tr2") ? document.getElementById("input-tr2").value.trim() : "";
    let pL2Val = document.getElementById("input-pl2") ? document.getElementById("input-pl2").value.trim() : "";
    let pR2Val = document.getElementById("input-pr2") ? document.getElementById("input-pr2").value.trim() : "";

    txtTL1 = tL1Val;
    txtTR1 = tR1Val;
    txtTL2 = tL2Val;
    txtTR2 = tR2Val;

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
  const tl1El = document.getElementById("input-tl1");
  const tr1El = document.getElementById("input-tr1");
  const pl1El = document.getElementById("input-pl1");
  const pr1El = document.getElementById("input-pr1");
  
  if (tl1El && tr1El) {
    let temp = tl1El.value; tl1El.value = tr1El.value; tr1El.value = temp;
    txtTL1 = tl1El.value; txtTR1 = tr1El.value;
  }
  if (pl1El && pr1El) {
    let temp = pl1El.value; pl1El.value = pr1El.value; pr1El.value = temp;
    txtPL1 = pl1El.value; txtPR1 = pr1El.value;
  }
  
  if (flowIsDouble) {
    const tl2El = document.getElementById("input-tl2");
    const tr2El = document.getElementById("input-tr2");
    const pl2El = document.getElementById("input-pl2");
    const pr2El = document.getElementById("input-pr2");
    
    if (tl2El && tr2El) {
      let temp = tl2El.value; tl2El.value = tr2El.value; tr2El.value = temp;
      txtTL2 = tl2El.value; txtTR2 = tr2El.value;
    }
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

  addIfValid("input-pl1", "input-tl1");
  addIfValid("input-pr1", "input-tr1");
  if (flowIsDouble) {
    addIfValid("input-pl2", "input-tl2");
    addIfValid("input-pr2", "input-tr2");
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
  let tL1Val = document.getElementById("input-tl1").value.trim();
  let tR1Val = document.getElementById("input-tr1").value.trim();
  let pL1Val = document.getElementById("input-pl1").value.trim() || "PlayerA1";
  let pR1Val = document.getElementById("input-pr1").value.trim() || "PlayerB1";
  
  let tL2Val = document.getElementById("input-tl2") ? document.getElementById("input-tl2").value.trim() : "";
  let tR2Val = document.getElementById("input-tr2") ? document.getElementById("input-tr2").value.trim() : "";
  let pL2Val = document.getElementById("input-pl2") ? document.getElementById("input-pl2").value.trim() || "PlayerA2" : "";
  let pR2Val = document.getElementById("input-pr2") ? document.getElementById("input-pr2").value.trim() || "PlayerB2" : "";

  let typeStr = flowIsDouble ? "ダブルス" : "シングルス";
  let gameStr = `${flowMaxGames}G`;
  let ptStr = `${flowMaxPoints}pt`;
  let deuceLimit = (flowMaxPoints === 21) ? 30 : ((flowMaxPoints === 15) ? 21 : 15);
  let settingStr = flowHasSetting ? `デュースあり(${deuceLimit})` : "デュースなし";
  
  let ruleStr = `${typeStr} / ${gameStr} / ${ptStr} / ${settingStr}`;
  let matchTypeLabel = flowIsTeamMatch ? "団体戦" : "個人戦";
  
  let leftTeamStr1 = tL1Val ? `[${tL1Val}] ` : "";
  let rightTeamStr1 = tR1Val ? `[${tR1Val}] ` : "";
  let leftTeamStr2 = tL2Val ? `[${tL2Val}] ` : "";
  let rightTeamStr2 = tR2Val ? `[${tR2Val}] ` : "";

  let leftPlayers = flowIsDouble ? `${leftTeamStr1}${pL1Val} & ${leftTeamStr2}${pL2Val}` : `${leftTeamStr1}${pL1Val}`;
  let rightPlayers = flowIsDouble ? `${rightTeamStr1}${pR1Val} & ${rightTeamStr2}${pR2Val}` : `${rightTeamStr1}${pR1Val}`;

  let confirmMsg = `以下の情報で本部用(開始)QRを発行しますか？\n\n` +
                   `【ルール】\n${matchTypeLabel} / ${ruleStr}\n\n` +
                   `【LEFT】\n${leftPlayers}\n\n` +
                   `【RIGHT】\n${rightPlayers}`;

  if (confirm(confirmMsg)) {
    let matchData = {
      flowIsDouble: flowIsDouble,
      flowMaxGames: flowMaxGames,
      flowMaxPoints: flowMaxPoints,
      flowHasCE: flowHasCE,
      flowHasInterval: flowHasInterval,
      flowHasSetting: flowHasSetting,
      flowHasCourtSelect: flowHasCourtSelect,
      flowIsTeamMatch: flowIsTeamMatch,
      tL1: tL1Val,
      tL2: tL2Val,
      tR1: tR1Val,
      tR2: tR2Val,
      n: [pL1Val, pL2Val, pR1Val, pR2Val]
    };
    if (typeof generateStartMatchQR === 'function') {
      generateStartMatchQR(matchData);
    }
  }
}