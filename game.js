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
// ★修正箇所：削除されてしまっていた変数を安全のため完全復旧
let initialNL2 = "", initialNR1 = "", initialNR2 = ""; 
let matchScoreHistory = [];
let matchDefaultRole = {};

// ★機能プラス：一球ごとの得点経過をPDF用に記録するタイムライン配列
let matchTimeline = [];

function resetNames() {
  flowStep = 1;
  tossWinner = null; winnerChoice = null; loserChoice = null;
  txtTL = ""; txtTR = "";
  // ★構想3：2マッチ目以降も名前初期値を完全に透明化（空文字列）して維持
  txtPL1 = ""; txtPL2 = "";
  txtPR1 = ""; txtPR2 = "";
  initialTL = ""; initialTR = "";
  initialNL1 = "";
  initialNL2 = ""; initialNR1 = ""; initialNR2 = ""; // ★復旧
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
  // ★修正：0-0の画面から戻る場合は、履歴がゼロであっても必ず GAME PREPARATION を経由させる
  if (sL === 0 && sR === 0 && !isOver && !isSelectingRoles) {
    if (typeof boardUndo === 'function') boardUndo();
  } else if (hist.length === 0) {
    flowPrev();
  } else {
    if (typeof boardUndo === 'function') boardUndo();
  }
}

// ★構想1：GAME PREPARATION画面の順当な戻るリレーを実現する関数
function roleBack() {
  if (gL === 0 && gR === 0 && hist.length === 0) {
    // 最初のゲーム開始前なら、TOSS画面（flowStep=3）に美しく戻る
    isSelectingRoles = false;
    document.getElementById("role-selection-overlay").style.display = "none";
    document.getElementById("board-ui").style.display = "none";
    document.getElementById("game-flow-container").style.display = "flex";
    flowStep = 3;
    if (typeof renderFlow === 'function') renderFlow();
  } else {
    // 第2ゲーム以降の開始前なら、前ゲームの最終スコア盤面にUndoで戻る
    if (typeof boardUndo === 'function') boardUndo();
  }
}

function finalizeAndStart() {
  initialTL = txtTL; initialTR = txtTR; initialNL1 = txtPL1; 
  initialNL2 = txtPL2; initialNR1 = txtPR1; initialNR2 = txtPR2; // ★復旧
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
  overlayMsg = ""; resultDetails = ""; ceNotice = ""; annL = ""; annR = "";
  shownCountL = 0; shownCountR = 0;
  hist = [];
  redoStack = []; 

  pL1IsRight = pR1IsRight = true; isSelectingRoles = flowIsDouble;
  document.getElementById("game-flow-container").style.display = "none";
  document.getElementById("board-ui").style.display = "flex";

  // ★片方だけのチーム名入力でも両方が消えないように、それぞれ独立して文字列をセットする
  tL = tL ? tL.trim() : "";
  tR = tR ? tR.trim() : "";

  // ★機能プラス：公式記録員（PDFノート）に初期配置を報告・ロック
  if (typeof Recorder !== 'undefined') {
    Recorder.initMatch(flowIsDouble, tL, tR, nL1, nL2, nR1, nR2);
  }

  if (typeof initRoleSelectionOverlay === 'function') initRoleSelectionOverlay();
  if (typeof syncBoardDOM === 'function') syncBoardDOM();
  if (typeof saveActiveBackup === 'function') saveActiveBackup();
}

function scoreAdd(isLeft) {
  if (isOver || needsOverlay || isSelectingRoles) return;
  if (typeof boardSave === 'function') boardSave();
  justAfterInterval = false;

  annL = ""; annR = ""; ceNotice = "";

  // ★機能プラス：PDF記録員への報告用に「今のサーバー」を特定
  let serverName = "";
  if (typeof Recorder !== 'undefined') {
    if (!flowIsDouble) {
        serverName = srvL ? nL1 : nR1;
    } else {
        if (srvL) {
            serverName = ((sL % 2 === 0) === pL1IsRight) ? nL1 : nL2;
        } else {
            serverName = ((sR % 2 === 0) === pR1IsRight) ? nR1 : nR2;
        }
    }
  }
  
  if (isLeft) {
    if (typeof Recorder !== 'undefined') Recorder.recordPoint(gL + gR, serverName, sL + 1);
    if (srvL && flowIsDouble) pL1IsRight = !pL1IsRight;
    sL++; srvL = true;
    matchTimeline.push({ game: gL + gR + 1, team: 'L', score: `${sL}-${sR}` });
  } else {
    if (typeof Recorder !== 'undefined') Recorder.recordPoint(gL + gR, serverName, sR + 1);
    if (!srvL && flowIsDouble) pR1IsRight = !pR1IsRight;
    sR++; srvL = false;
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
  // ★機能プラス：PDF記録員へゲーム終了と最終スコアを報告
  if (typeof Recorder !== 'undefined') {
     let finalScore = leftWon ? sL : sR;
     let winnerName = leftWon ? nL1 : nR1;
     Recorder.recordGameEnd(gL + gR, winnerName, finalScore);
  }

  if (leftWon) gL++; else gR++;
  let winTarget = Math.floor((flowMaxGames + 1) / 2);

  let isInitialLeftNowLeft = (nL1 === initialNL1);
  let aScore = isInitialLeftNowLeft ? sL : sR;
  let bScore = isInitialLeftNowLeft ? sR : sL;
  matchScoreHistory.push({ a: aScore, b: bScore });

  if (gL === winTarget || gR === winTarget) {
    isOver = true;
    let isL = (gL === winTarget);
    overlayMsg = "MATCH WON BY\n" + (isL ? (typeof getBannerName === 'function' ? getBannerName(true) : "") : (typeof getBannerName === 'function' ? getBannerName(false) : ""));
    
    let matchScoreStr = isL ? `${gL}-${gR}` : `${gR}-${gL}`;
    let matchWinnerPlayer1 = isL ? nL1 : nR1;
    let winnerIsInitialLeft = (matchWinnerPlayer1 === initialNL1);
    
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
  // ★セーフティネット追加：FINISHが押された時、どんなエラーが起きても絶対に初期画面に戻る処理を保証する
  if (isOver) {
    try {
      if (typeof saveMatchToHistory === 'function') saveMatchToHistory("FINISHED");
    } catch (e) {
      console.error("履歴保存エラー:", e); // エラーを検知してもストップさせない
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
    if (typeof initRoleSelectionOverlay === 'function') initRoleSelectionOverlay();
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

// =========================================
// ★機能プラス：セーブ・ロード・履歴保存用 データ管理関数
// =========================================
function saveActiveBackup() {
  if (flowStep < 3) return; 
  let stateData = {
    flowIsDouble, flowMaxGames, flowMaxPoints, flowHasCE, flowHasInterval, flowHasSetting,
    sL, sR, gL, gR, srvL, tL, tR, nL1, nL2, nR1, nR2,
    pL1IsRight, pR1IsRight, isOver, needsOverlay, ivDoneInThisGame, isSelectingRoles,
    overlayMsg, resultDetails, ceNotice, annL, annR, shownCountL, shownCountR, justAfterInterval,
    initialTL, initialTR, initialNL1, initialNL2, initialNR1, initialNR2, // ★復旧
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
    let isInitialLeftNowLeft = (nL1 === initialNL1);
    let aScore = isInitialLeftNowLeft ? sL : sR;
    let bScore = isInitialLeftNowLeft ? sR : sL;
    gameDetails += (gameDetails ? ", " : "") + `(${aScore}-${bScore} 途中)`;
  }

  let stateData = {
    flowIsDouble, flowMaxGames, flowMaxPoints, flowHasCE, flowHasInterval, flowHasSetting,
    sL, sR, gL, gR, srvL, tL, tR, nL1, nL2, nR1, nR2,
    pL1IsRight, pR1IsRight, isOver, needsOverlay, ivDoneInThisGame, isSelectingRoles,
    overlayMsg, resultDetails, ceNotice, annL, annR, shownCountL, shownCountR, justAfterInterval,
    initialTL, initialTR, initialNL1, initialNL2, initialNR1, initialNR2, // ★復旧
    matchScoreHistory, matchDefaultRole, matchTimeline,
    hist, redoStack,
    recorderData: (typeof Recorder !== 'undefined') ? Recorder.exportData() : null
  };

  historyList.unshift({
    id: now.getTime().toString(),
    date: dateStr,
    title: matchTitle,
    status: status,
    score: matchScoreStr,
    details: gameDetails,
    state: stateData
  });

  localStorage.setItem('call_match_history', JSON.stringify(historyList));
  clearActiveBackup();
}