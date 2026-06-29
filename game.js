// =========================================
// 試合進行・得点計算 (game.js)
// =========================================

// 試合全体のステータス変数（他ファイルからも参照されます）
let sL = 0, sR = 0;
let gL = 0, gR = 0;
let srvL = true;
let tL = "", tR = "", nL1 = "", nL2 = "", nR1 = "", nR2 = "";
let pL1IsRight = true, pR1IsRight = true;
let isOver = false, needsOverlay = false, ivDoneInThisGame = false, isSelectingRoles = true;
let overlayMsg = "", resultDetails = "", ceNotice = "", annL = "", annR = "";
let shownCountL = 0, shownCountR = 0;
let hist = []; 
let redoStack = []; 

let justAfterInterval = false;
let initialTL = "", initialTR = "";
let initialNL1 = "";
let initialNL2 = "", initialNR1 = "", initialNR2 = ""; 
let matchScoreHistory = [];
let matchDefaultRole = {};

// 一球ごとの得点経過を記録するタイムライン配列
let matchTimeline = [];

function resetNames() {
  flowStep = 1;
  tossWinner = null; winnerChoice = null; loserChoice = null;
  txtTL = ""; txtTR = "";
  txtPL1 = ""; txtPL2 = "";
  txtPR1 = ""; txtPR2 = "";
  initialTL = ""; initialTR = "";
  initialNL1 = "";
  initialNL2 = ""; initialNR1 = ""; initialNR2 = ""; 
  matchScoreHistory = [];
  matchDefaultRole = {};
  matchTimeline = [];
  justAfterInterval = false;
  sL = 0; sR = 0; gL = 0; gR = 0;
  isOver = false; needsOverlay = false; ivDoneInThisGame = false; isSelectingRoles = true;
  overlayMsg = ""; resultDetails = ""; ceNotice = ""; annL = ""; annR = "";
  shownCountL = 0; shownCountR = 0;
  hist = [];
  redoStack = []; 

  if (document.getElementById("score-val-L")) {
    document.getElementById("score-val-L").innerText = "0";
    document.getElementById("score-val-R").innerText = "0";
    document.getElementById("ann-text-L").innerText = "";
    document.getElementById("ann-text-R").innerText = "";
    document.getElementById("game-dots-L").innerHTML = "";
    document.getElementById("game-dots-R").innerHTML = "";
    document.getElementById("tags-container-L").innerHTML = "";
    document.getElementById("tags-container-R").innerHTML = "";
    document.getElementById("board-call-en").innerHTML = "Love All; Play.";
    document.getElementById("board-call-kana").innerHTML = "ラブオール；プレイ";
    document.getElementById("score-val-L").classList.remove("deuce");
    document.getElementById("score-val-R").classList.remove("deuce");
  }
}

function overlayBack() {
  if (sL === 0 && sR === 0 && !isOver && !isSelectingRoles) {
    if (typeof boardUndo === 'function') boardUndo();
  } else if (hist.length === 0) {
    flowPrev();
  } else {
    if (typeof boardUndo === 'function') boardUndo();
  }
}

function roleBack() {
  if (gL === 0 && gR === 0 && hist.length === 0) {
    isSelectingRoles = false;
    document.getElementById("role-selection-overlay").style.display = "none";
    document.getElementById("board-ui").style.display = "none";
    document.getElementById("game-flow-container").style.display = "flex";
    flowStep = 3;
    if (typeof renderFlow === 'function') renderFlow();
  } else {
    if (typeof boardUndo === 'function') boardUndo();
  }
}

function finalizeAndStart() {
  initialTL = txtTL; initialTR = txtTR; initialNL1 = txtPL1; 
  initialNL2 = txtPL2; initialNR1 = txtPR1; initialNR2 = txtPR2; 
  matchScoreHistory = []; matchTimeline = []; justAfterInterval = false;

  let swapCourts = (tossWinner === 'L' && (winnerChoice === 'RIGHT' || loserChoice === 'LEFT')) ||
                   (tossWinner === 'R' && (winnerChoice === 'LEFT' || loserChoice === 'RIGHT'));

  if (swapCourts) {
    tL = txtTR; tR = txtTL;
    nL1 = txtPR1; nR1 = txtPL1;
    nL2 = txtPR2; nR2 = txtPL2;
  } else {
    tL = txtTL; tR = txtTR;
    nL1 = txtPL1; nR1 = txtPR1;
    nL2 = txtPL2; nR2 = txtPR2;
  }

  let originalLeftTeamServes = (tossWinner === 'L' && (winnerChoice === 'SERVICE' || loserChoice === 'RECEIVE')) ||
                               (tossWinner === 'R' && (winnerChoice === 'RECEIVE' || loserChoice === 'SERVICE'));

  srvL = swapCourts ? !originalLeftTeamServes : originalLeftTeamServes;

  sL = 0; sR = 0; gL = 0; gR = 0;
  isOver = false; needsOverlay = false; ivDoneInThisGame = false;
  
  if (!flowIsDouble) {
    isSelectingRoles = false; 
  } else {
    isSelectingRoles = true; 
  }
  
  overlayMsg = ""; resultDetails = ""; ceNotice = ""; annL = ""; annR = "";
  shownCountL = 0; shownCountR = 0;
  hist = [];
  redoStack = []; 

  pL1IsRight = pR1IsRight = true; 
  document.getElementById("game-flow-container").style.display = "none";

  tL = tL ? tL.trim() : "";
  tR = tR ? tR.trim() : "";

  if (typeof Recorder !== 'undefined') {
    Recorder.initMatch(flowIsDouble, tL, tR, nL1, nL2, nR1, nR2);
  }

  // ★修正：シングルスの場合は、ここで得点板に行く前にロングコール画面を判定して挟む
  if (!flowIsDouble) {
    if (typeof Recorder !== 'undefined') {
      let sName = srvL ? nL1 : nR1;
      let rName = srvL ? nR1 : nL1;
      Recorder.recordFirstSR(gL + gR, sName, rName);
    }
    
    if (typeof flowIsOfficialCall !== 'undefined' && flowIsOfficialCall && gL === 0 && gR === 0) {
      if (typeof showLongCallOverlay === 'function') {
        showLongCallOverlay();
      } else {
        document.getElementById("board-ui").style.display = "flex";
      }
    } else {
      document.getElementById("board-ui").style.display = "flex";
    }
  } else {
    // ダブルスの場合は、とりあえずボードUIを見せて陣形選択へ
    document.getElementById("board-ui").style.display = "flex";
    if (isSelectingRoles) {
      if (typeof initRoleSelectionOverlay === 'function') initRoleSelectionOverlay();
    }
  }
  
  if (typeof syncBoardDOM === 'function') syncBoardDOM();
  if (typeof saveActiveBackup === 'function') saveActiveBackup();
}

function scoreAdd(isLeft) {
  if (isOver || needsOverlay || isSelectingRoles) return;
  if (typeof boardSave === 'function') boardSave();
  justAfterInterval = false;

  annL = ""; annR = ""; ceNotice = "";

  if (isLeft) {
    if (srvL && flowIsDouble) pL1IsRight = !pL1IsRight;
    sL++; srvL = true;
    
    let targetPlayerName = "";
    if (!flowIsDouble) {
        targetPlayerName = nL1;
    } else {
        let serveFromRight = (sL % 2 === 0);
        targetPlayerName = serveFromRight ? (pL1IsRight ? nL1 : nL2) : (pL1IsRight ? nL2 : nL1);
    }
    if (typeof Recorder !== 'undefined') Recorder.recordPoint(gL + gR, targetPlayerName, sL);
    matchTimeline.push({ game: gL + gR + 1, team: 'L', score: `${sL}-${sR}` });
    
  } else {
    if (!srvL && flowIsDouble) pR1IsRight = !pR1IsRight;
    sR++; srvL = false;
    
    let targetPlayerName = "";
    if (!flowIsDouble) {
        targetPlayerName = nR1;
    } else {
        let serveFromRight = (sR % 2 === 0);
        targetPlayerName = serveFromRight ? (pR1IsRight ? nR1 : nR2) : (pR1IsRight ? nR2 : nR1);
    }
    if (typeof Recorder !== 'undefined') Recorder.recordPoint(gL + gR, targetPlayerName, sR);
    matchTimeline.push({ game: gL + gR + 1, team: 'R', score: `${sL}-${sR}` });
  }

  const limit = flowMaxPoints;
  const maxLimit = (limit === 21) ? 30 : (limit === 11 ? 15 : 21);

  let gFin = false;
  if (flowHasSetting) {
    gFin = (sL >= limit && Math.abs(sL - sR) >= 2) || sL === maxLimit ||
           (sR >= limit && Math.abs(sR - sL) >= 2) || sR === maxLimit;
  } else {
    gFin = (sL === limit || sR === limit);
  }

  if (gFin) {
    gameEndCore(sL > sR);
  } else {
    let intervalPoint = (limit === 21) ? 11 : ((limit === 15) ? 8 : -1);
    let isFinalGame = (gL + gR === flowMaxGames - 1);
    let isOneGameMatch = (flowMaxGames === 1);
    
    let triggerMidGameStop = false;
    if (!ivDoneInThisGame && intervalPoint !== -1 && (sL === intervalPoint || sR === intervalPoint)) {
        if (flowHasInterval) {
            triggerMidGameStop = true;
        } else if (flowHasCE && (isFinalGame || isOneGameMatch)) {
            triggerMidGameStop = true;
        }
    }

    if (triggerMidGameStop) {
      ivDoneInThisGame = true;
      needsOverlay = true;
      resultDetails = sL > sR ? `SCORE: ${sL}-${sR}` : `SCORE: ${sR}-${sL}`;
      
      let doInterval = flowHasInterval;
      let doCE = flowHasCE && (isFinalGame || isOneGameMatch);

      if (doInterval && doCE) {
          overlayMsg = "INTERVAL";
          ceNotice = "CHANGE ENDS";
      } else if (doInterval) {
          overlayMsg = "INTERVAL";
          ceNotice = "";
      } else if (doCE) {
          overlayMsg = "CHANGE ENDS";
          ceNotice = "";
      }
      if (typeof triggerBannerDisplay === 'function') triggerBannerDisplay(true);
    } else {
      let winTarget = Math.floor((flowMaxGames + 1) / 2);
      let isMatchPoint = (isLeft ? gL : gR) === winTarget - 1;
      let label = isMatchPoint ? "MATCH POINT" : "GAME POINT";

      if (isLeft) {
        let reachL = flowHasSetting ? ((sL >= limit - 1 && sL > sR) || (sL === maxLimit - 1)) : (sL === limit - 1);
        if (shownCountL === 0 && reachL) {
          annL = label; shownCountL++;
        }
      } else {
        let reachR = flowHasSetting ? ((sR >= limit - 1 && sR > sL) || (sR === maxLimit - 1)) : (sR === limit - 1);
        if (shownCountR === 0 && reachR) {
          annR = label; shownCountR++;
        }
      }
    }
  }
  if (typeof syncBoardDOM === 'function') syncBoardDOM();
  if (typeof saveActiveBackup === 'function') saveActiveBackup();
}

function gameEndCore(leftWon) {
  if (typeof Recorder !== 'undefined') {
     let finalScore = leftWon ? sL : sR;
     let winnerName = leftWon ? nL1 : nR1;
     Recorder.recordGameEnd(gL + gR, winnerName, finalScore);
  }

  if (leftWon) gL++; else gR++;
  let winTarget = Math.floor((flowMaxGames + 1) / 2);

  // ★修正箇所：最終スコアが逆転しないように、ダブルスで立ち位置が入れ替わっていても正しくチームを判定する
  let isInitialLeftNowLeft = false;
  if (!flowIsDouble) {
      isInitialLeftNowLeft = (nL1 === initialNL1);
  } else {
      isInitialLeftNowLeft = (nL1 === initialNL1 || nL1 === initialNL2);
  }
  
  let aScore = isInitialLeftNowLeft ? sL : sR;
  let bScore = isInitialLeftNowLeft ? sR : sL;
  matchScoreHistory.push({ a: aScore, b: bScore });

  if (gL === winTarget || gR === winTarget) {
    isOver = true;
    let isL = (gL === winTarget);
    overlayMsg = "MATCH WON BY\n" + (isL ? (typeof getBannerName === 'function' ? getBannerName(true) : "") : (typeof getBannerName === 'function' ? getBannerName(false) : ""));
    
    let matchScoreStr = isL ? `${gL}-${gR}` : `${gR}-${gL}`;
    
    // ★マッチ終了後のダイアログ表示用チーム判定も同様に修正
    let isLeftWinnerInitialLeft = false;
    if (!flowIsDouble) {
        isLeftWinnerInitialLeft = (nL1 === initialNL1);
    } else {
        isLeftWinnerInitialLeft = (nL1 === initialNL1 || nL1 === initialNL2);
    }
    let winnerIsInitialLeft = isL ? isLeftWinnerInitialLeft : !isLeftWinnerInitialLeft;
    
    let historyStrs = matchScoreHistory.map(game => {
        if (winnerIsInitialLeft) {
            return `${game.a}-${game.b}`;
        } else {
            return `${game.b}-${game.a}`;
        }
    }).join(", ");
    
    resultDetails = `${matchScoreStr} (${historyStrs})`;
  } else {
    needsOverlay = true;
    let gameNumber = gL + gR;
    let nth = (gameNumber === 1) ? "ST" : (gameNumber === 2 ? "ND" : (gameNumber === 3 ? "RD" : "TH"));
    overlayMsg = `${gameNumber}${nth} GAME WON BY\n` + (leftWon ? (typeof getBannerName === 'function' ? getBannerName(true) : "") : (typeof getBannerName === 'function' ? getBannerName(false) : ""));
    resultDetails = sL > sR ? `SCORE: ${sL}-${sR}` : `SCORE: ${sR}-${sL}`;
    
    if (flowHasCE) {
      ceNotice = "CHANGE ENDS";
    } else {
      ceNotice = "";
    }
    srvL = leftWon;
  }
  shownCountL = 0; shownCountR = 0;
  if (typeof triggerBannerDisplay === 'function') triggerBannerDisplay(true);
}

function handleBannerTap() {
  if (isOver) {
    try {
      if (typeof saveMatchToHistory === 'function') saveMatchToHistory("FINISHED");
    } catch (e) {
      console.error("履歴保存エラー:", e); 
    } finally {
      document.getElementById("board-ui").style.display = "none";
      document.getElementById("game-flow-container").style.display = "flex";
      flowStep = 1;
      tossWinner = null; winnerChoice = null; loserChoice = null;
      
      try { resetNames(); } catch (e) { console.error("初期化エラー:", e); }
      if (typeof triggerBannerDisplay === 'function') triggerBannerDisplay(false);
      if (typeof renderFlow === 'function') renderFlow();
    }
    return;
  }

  if (typeof boardSave === 'function') boardSave();

  let shouldSwap = flowHasCE && (ceNotice === "CHANGE ENDS" || overlayMsg === "CHANGE ENDS");

  if (overlayMsg.includes("WON BY")) {
    if (flowHasCE && typeof boardSwap === 'function') boardSwap();
    
    sL = 0; sR = 0;
    ivDoneInThisGame = false;
    
    if (!flowIsDouble) {
      pL1IsRight = true; pR1IsRight = true;
      isSelectingRoles = false;
      if (typeof Recorder !== 'undefined') {
        let sName = srvL ? nL1 : nR1;
        let rName = srvL ? nR1 : nL1;
        Recorder.recordFirstSR(gL + gR, sName, rName);
      }
    } else {
      if (matchDefaultRole.hasOwnProperty('initialLeftTeamSelectedPlayer') && matchDefaultRole.initialLeftTeamSelectedPlayer !== "") {
        if (nL1 === initialNL1) {
          pL1IsRight = (nL1 === matchDefaultRole.initialLeftTeamSelectedPlayer);
          pR1IsRight = (nR1 === matchDefaultRole.initialRightTeamSelectedPlayer);
        } else {
          pL1IsRight = (nL1 === matchDefaultRole.initialRightTeamSelectedPlayer);
          pR1IsRight = (nR1 === matchDefaultRole.initialLeftTeamSelectedPlayer);
        }
      } else {
        pL1IsRight = true; pR1IsRight = true;
      }
      isSelectingRoles = true;  
    }
    justAfterInterval = false;
    if (isSelectingRoles) {
      if (typeof initRoleSelectionOverlay === 'function') initRoleSelectionOverlay();
    }
  } else if (overlayMsg === "INTERVAL" || overlayMsg === "CHANGE ENDS") {
    if (shouldSwap && typeof boardSwap === 'function') {
      boardSwap();
    }
    justAfterInterval = true;
  }
  needsOverlay = false;
  ceNotice = ""; resultDetails = "";
  if (typeof triggerBannerDisplay === 'function') triggerBannerDisplay(false);
  if (typeof syncBoardDOM === 'function') syncBoardDOM();
  if (typeof saveActiveBackup === 'function') saveActiveBackup();
}

function triggerBannerDisplay(show) {
  const banner = document.getElementById("bottom-banner");
  if (!banner) return;
  if (show) {
    document.getElementById("banner-msg-field").innerText = overlayMsg;
    document.getElementById("banner-details-field").innerText = resultDetails;
    document.getElementById("banner-notice-field").innerText = ceNotice;
    document.getElementById("banner-action-trigger").innerText = isOver ? "FINISH" : "NEXT";
    banner.style.display = "block";
  } else {
    banner.style.display = "none";
  }
}

function boardSwap() {
  let ts = sL; sL = sR; sR = ts;
  let tg = gL; gL = gR; gR = tg;
  let tt = tL; tL = tR; tR = tt;
  let tn1 = nL1; nL1 = nR1; nR1 = tn1;
  let tn2 = nL2; nL2 = nR2; nR2 = tn2;
  let tpL = pL1IsRight; pL1IsRight = pR1IsRight; pR1IsRight = tpL;
  srvL = !srvL;
  let scL = shownCountL; shownCountL = shownCountR; shownCountR = scL;
}

function boardClose() {
  if (confirm("ゲームを終了して設定画面に戻りますか？")) {
    if (!isOver && (sL > 0 || sR > 0 || gL > 0 || gR > 0)) {
      if (typeof saveMatchToHistory === 'function') saveMatchToHistory("INTERRUPTED"); 
    } else {
      if (typeof clearActiveBackup === 'function') clearActiveBackup();
    }
    document.getElementById("board-ui").style.display = "none";
    document.getElementById("game-flow-container").style.display = "flex";
    flowStep = 1;
    tossWinner = null; winnerChoice = null; loserChoice = null;
    
    resetNames();
    if (typeof triggerBannerDisplay === 'function') triggerBannerDisplay(false);
    if (typeof renderFlow === 'function') renderFlow();
  }
}

function getBoardSideName(isL) {
  let sideT = isL ? tL : tR;
  if (sideT.trim().length > 0) {
    return sideT;
  } else {
    return isL ? (flowIsDouble ? `${nL1}\n${nL2}` : nL1) : (flowIsDouble ? `${nR1}\n${nR2}` : nR1);
  }
}

function getBannerName(isL) {
  let sideT = isL ? tL : tR;
  if (sideT.trim().length > 0) {
    return sideT;
  } else {
    return isL ? (flowIsDouble ? `${nL1} and ${nL2}` : nL1) : (flowIsDouble ? `${nR1} and ${nR2}` : nR1);
  }
}

function saveActiveBackup() {
  if (flowStep < 3) return; 
  let stateData = {
    flowIsDouble, flowMaxGames, flowMaxPoints, flowHasCE, flowHasInterval, flowHasSetting,
    sL, sR, gL, gR, srvL, tL, tR, nL1, nL2, nR1, nR2,
    pL1IsRight, pR1IsRight, isOver, needsOverlay, ivDoneInThisGame, isSelectingRoles,
    overlayMsg, resultDetails, ceNotice, annL, annR, shownCountL, shownCountR, justAfterInterval,
    initialTL, initialTR, initialNL1, initialNL2, initialNR1, initialNR2, 
    matchScoreHistory, matchDefaultRole, matchTimeline,
    hist, redoStack,
    recorderData: (typeof Recorder !== 'undefined') ? Recorder.exportData() : null 
  };
  localStorage.setItem('call_active_backup', JSON.stringify(stateData));
}

function clearActiveBackup() {
  localStorage.removeItem('call_active_backup');
}

function saveMatchToHistory(status) {
  if (status === "FINISHED") {
    hist = [];
    redoStack = [];
  }

  let historyList = [];
  try {
    let saved = localStorage.getItem('call_match_history');
    if (saved) historyList = JSON.parse(saved);
  } catch(e) {}

  let now = new Date();
  let dateStr = now.getFullYear() + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + ('0' + now.getDate()).slice(-2) + ' ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);

  let teamLName = tL ? tL : (flowIsDouble ? `${nL1} & ${nL2}` : nL1);
  let teamRName = tR ? tR : (flowIsDouble ? `${nR1} & ${nR2}` : nR1);
  let matchTitle = `${teamLName} vs ${teamRName}`;

  let matchScoreStr = `${gL} - ${gR}`;
  let gameDetails = matchScoreHistory.map(g => `${g.a}-${g.b}`).join(', ');
  
  if (status === "INTERRUPTED") {
    // ★ここも同様に修正
    let isInitialLeftNowLeft = false;
    if (!flowIsDouble) {
        isInitialLeftNowLeft = (nL1 === initialNL1);
    } else {
        isInitialLeftNowLeft = (nL1 === initialNL1 || nL1 === initialNL2);
    }
    let aScore = isInitialLeftNowLeft ? sL : sR;
    let bScore = isInitialLeftNowLeft ? sR : sL;
    gameDetails += (gameDetails ? ", " : "") + `(${aScore}-${bScore} 途中)`;
  }

  let stateData = {
    flowIsDouble, flowMaxGames, flowMaxPoints, flowHasCE, flowHasInterval, flowHasSetting,
    sL, sR, gL, gR, srvL, tL, tR, nL1, nL2, nR1, nR2,
    pL1IsRight, pR1IsRight, isOver, needsOverlay, ivDoneInThisGame, isSelectingRoles,
    overlayMsg, resultDetails, ceNotice, annL, annR, shownCountL, shownCountR, justAfterInterval,
    initialTL, initialTR, initialNL1, initialNL2, initialNR1, initialNR2, 
    matchScoreHistory, matchDefaultRole, matchTimeline,
    hist, redoStack,
    recorderData: (typeof Recorder !== 'undefined') ? Recorder.exportData() : null
  };

  let newItem = {
    id: now.getTime().toString(),
    date: dateStr,
    title: matchTitle,
    status: status,
    score: matchScoreStr,
    details: gameDetails,
    state: stateData
  };

  historyList.unshift(newItem);

  let savedSuccessfully = false;
  while (!savedSuccessfully && historyList.length > 0) {
    try {
      localStorage.setItem('call_match_history', JSON.stringify(historyList));
      savedSuccessfully = true;
    } catch(e) {
      console.warn("ストレージ容量上限のため、一番古い履歴を削除して保存を再試行します。");
      historyList.pop(); 
    }
  }

  clearActiveBackup();
}