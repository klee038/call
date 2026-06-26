// =========================================
// 盤面履歴（Undo/Redo）＆ 試合履歴 管理 (history.js)
// =========================================

// --- 1. 盤面状態の保存・Undo / Redo ロジック ---

/**
 * 現時点の状態を履歴スタックに保存する（Undo用）
 */
function boardSave() {
  redoStack = []; 
  hist.push({
    sL: sL, sR: sR, gL: gL, gR: gR, srvL: srvL,
    tL: tL, tR: tR, nL1: nL1, nL2: nL2, nR1: nR1, nR2: nR2,
    pL1R: pL1IsRight, pR1R: pR1IsRight, iv: ivDoneInThisGame,
    al: annL, ar: annR, cL: shownCountL, cR: shownCountR,
    over: isOver, isr: isSelectingRoles, jai: justAfterInterval,
    needsOverlay: needsOverlay,
    overlayMsg: overlayMsg,
    resultDetails: resultDetails,
    ceNotice: ceNotice,
    msh: JSON.stringify(matchScoreHistory),
    mtl: JSON.stringify(matchTimeline), 
    recorderData: (typeof Recorder !== 'undefined') ? Recorder.exportData() : null 
  });
}

/**
 * アンドゥ（一手戻る）
 */
function boardUndo() {
  // ★バグ修正：0-0のスコア画面でUndoを押した時は、TOSSではなくGAME PREPARATION画面（陣形反転トグル）を再度呼び出す
  if (sL === 0 && sR === 0 && !isOver && !isSelectingRoles) {
    isSelectingRoles = true;
    
    // PDF公式記録ノートに記録された「最初のサーバー/レシーバー情報」を1つ取り消す（二重記録防止）
    if (typeof Recorder !== 'undefined' && Recorder.data && Recorder.data.timeline) {
        let lastLog = Recorder.data.timeline[Recorder.data.timeline.length - 1];
        if (lastLog && lastLog.type === 'SR') {
            Recorder.data.timeline.pop();
        }
    }
    
    document.getElementById("board-ui").style.display = "flex";
    if (typeof initRoleSelectionOverlay === 'function') initRoleSelectionOverlay();
    if (typeof syncBoardDOM === 'function') syncBoardDOM();
    if (typeof saveActiveBackup === 'function') saveActiveBackup();
    return;
  }

  if (hist.length === 0) return;

  redoStack.push({
    sL: sL, sR: sR, gL: gL, gR: gR, srvL: srvL,
    tL: tL, tR: tR, nL1: nL1, nL2: nL2, nR1: nR1, nR2: nR2,
    pL1R: pL1IsRight, pR1R: pR1IsRight, iv: ivDoneInThisGame,
    al: annL, ar: annR, cL: shownCountL, cR: shownCountR,
    over: isOver, isr: isSelectingRoles, jai: justAfterInterval,
    needsOverlay: needsOverlay,
    overlayMsg: overlayMsg,
    resultDetails: resultDetails,
    ceNotice: ceNotice,
    msh: JSON.stringify(matchScoreHistory),
    mtl: JSON.stringify(matchTimeline),
    recorderData: (typeof Recorder !== 'undefined') ? Recorder.exportData() : null
  });

  let l = hist.pop();
  sL = l.sL; sR = l.sR; gL = l.gL; gR = l.gR; srvL = l.srvL;
  tL = l.tL; tR = l.tR; nL1 = l.nL1; nL2 = l.nL2; nR1 = l.nR1; nR2 = l.nR2;
  pL1IsRight = l.pL1R; pR1IsRight = l.pR1R; ivDoneInThisGame = l.iv;
  annL = l.al; annR = l.ar; shownCountL = l.cL; shownCountR = l.cR;
  isOver = l.over; isSelectingRoles = l.isr; justAfterInterval = l.jai;
  needsOverlay = l.needsOverlay;
  overlayMsg = l.overlayMsg;
  resultDetails = l.resultDetails;
  ceNotice = l.ceNotice;
  matchScoreHistory = JSON.parse(l.msh);
  if (l.mtl) matchTimeline = JSON.parse(l.mtl);

  if (typeof Recorder !== 'undefined') {
    if (l.recorderData) {
      Recorder.loadData(l.recorderData);
    }
  }

  document.getElementById("board-ui").style.display = "flex";
  
  if (isSelectingRoles) {
    if (typeof initRoleSelectionOverlay === 'function') initRoleSelectionOverlay();
    if (typeof syncBoardDOM === 'function') syncBoardDOM();
  } else {
    document.getElementById("role-selection-overlay").style.display = "none";
    if (typeof triggerBannerDisplay === 'function') triggerBannerDisplay(needsOverlay);
    if (typeof syncBoardDOM === 'function') syncBoardDOM();
  }

  if (typeof saveActiveBackup === 'function') saveActiveBackup();
}

/**
 * リドゥ（進む）
 */
function boardRedo() {
  if (redoStack.length > 0) {
    hist.push({
      sL: sL, sR: sR, gL: gL, gR: gR, srvL: srvL,
      tL: tL, tR: tR, nL1: nL1, nL2: nL2, nR1: nR1, nR2: nR2,
      pL1R: pL1IsRight, pR1R: pR1IsRight, iv: ivDoneInThisGame,
      al: annL, ar: annR, cL: shownCountL, cR: shownCountR,
      over: isOver, isr: isSelectingRoles, jai: justAfterInterval,
      needsOverlay: needsOverlay,
      overlayMsg: overlayMsg,
      resultDetails: resultDetails,
      ceNotice: ceNotice,
      msh: JSON.stringify(matchScoreHistory),
      mtl: JSON.stringify(matchTimeline),
      recorderData: (typeof Recorder !== 'undefined') ? Recorder.exportData() : null
    });

    let l = redoStack.pop();
    sL = l.sL; sR = l.sR; gL = l.gL; gR = l.gR; srvL = l.srvL;
    tL = l.tL; tR = l.tR; nL1 = l.nL1; nL2 = l.nL2; nR1 = l.nR1; nR2 = l.nR2;
    pL1IsRight = l.pL1R; pR1IsRight = l.pR1R; ivDoneInThisGame = l.iv;
    annL = l.al; annR = l.ar; shownCountL = l.cL; shownCountR = l.cR;
    isOver = l.over; isSelectingRoles = l.isr; justAfterInterval = l.jai;
    needsOverlay = l.needsOverlay;
    overlayMsg = l.overlayMsg;
    resultDetails = l.resultDetails;
    ceNotice = l.ceNotice;
    matchScoreHistory = JSON.parse(l.msh);
    if (l.mtl) matchTimeline = JSON.parse(l.mtl);

    if (typeof Recorder !== 'undefined') {
      if (l.recorderData) {
        Recorder.loadData(l.recorderData);
      }
    }

    document.getElementById("board-ui").style.display = "flex";

    if (isSelectingRoles) {
      if (typeof initRoleSelectionOverlay === 'function') initRoleSelectionOverlay();
      if (typeof syncBoardDOM === 'function') syncBoardDOM();
    } else {
      document.getElementById("role-selection-overlay").style.display = "none";
      if (typeof triggerBannerDisplay === 'function') triggerBannerDisplay(needsOverlay);
      if (typeof syncBoardDOM === 'function') syncBoardDOM();
    }

    if (typeof saveActiveBackup === 'function') saveActiveBackup();
  }
}

// --- 2. 試合履歴一覧（MATCH HISTORY）管理・表示ロジック ---

function getHistoryList() {
  let h = localStorage.getItem('call_match_history');
  return h ? JSON.parse(h) : [];
}

/**
 * 起動時に実行：前回放置終了されたアクティブバックアップを救出し、履歴リストへ「中断データ」として退避
 */
function checkActiveBackupOnLoad() {
  let saved = localStorage.getItem('call_active_backup');
  if (saved) {
    try {
      let state = JSON.parse(saved);
      if (state.sL > 0 || state.sR > 0 || state.gL > 0 || state.gR > 0) {
        let historyList = getHistoryList();
        let now = new Date();
        let dateStr = now.getFullYear() + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + ('0' + now.getDate()).slice(-2) + ' ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);

        let teamLName = state.tL ? state.tL : (state.flowIsDouble ? `${state.nL1} & ${state.nL2}` : state.nL1);
        let teamRName = state.tR ? state.tR : (state.flowIsDouble ? `${state.nR1} & ${state.nR2}` : state.nR1);
        let matchTitle = `${teamLName} vs ${teamRName}`;

        let matchScoreStr = `${state.gL} - ${state.gR}`;
        let gameDetails = (state.matchScoreHistory || []).map(g => `${g.a}-${g.b}`).join(', ');
        
        let isInitialLeftNowLeft = (state.nL1 === state.initialNL1);
        let aScore = isInitialLeftNowLeft ? state.sL : state.sR;
        let bScore = isInitialLeftNowLeft ? state.sR : state.sL;
        gameDetails += (gameDetails ? ", " : "") + `(${aScore}-${bScore} 途中)`;

        state.status = "INTERRUPTED";
        state.date = dateStr;
        state.title = matchTitle;
        state.score = matchScoreStr;
        state.details = gameDetails;

        historyList.unshift(state);
        localStorage.setItem('call_match_history', JSON.stringify(historyList));
      }
    } catch(e) {}
    localStorage.removeItem('call_active_backup');
  }
}
checkActiveBackupOnLoad();

function openHistoryModal() {
  const overlay = document.getElementById("history-overlay");
  if (overlay) {
    overlay.style.display = "flex";
    renderHistoryList();
  }
}

function closeHistoryModal() {
  const overlay = document.getElementById("history-overlay");
  if (overlay) overlay.style.display = "none";
}

function renderHistoryList() {
  let historyList = getHistoryList();
  let listEl = document.getElementById('history-modal-content');
  if (!listEl) return;

  if (historyList.length === 0) {
    listEl.innerHTML = '<div style="text-align:center; color:#94A3B8; font-size:14px; padding:20px;">履歴がありません</div>';
    return;
  }
  
  listEl.innerHTML = historyList.map((match, index) => {
    let isInterrupted = match.status === "INTERRUPTED";
    
    // チーム名と選手名の両方を美しく併記
    let st = match.state || match || {};
    let isD = st.hasOwnProperty('flowIsDouble') ? st.flowIsDouble : true;
    let pL = st.nL1 ? (isD ? `${st.nL1} & ${st.nL2}` : st.nL1) : (match.title ? match.title.split(' vs ')[0] : "");
    let pR = st.nR1 ? (isD ? `${st.nR1} & ${st.nR2}` : st.nR1) : (match.title ? match.title.split(' vs ')[1] : "");
    let titleL = st.tL ? `[${st.tL}] ${pL}` : pL;
    let titleR = st.tR ? `[${st.tR}] ${pR}` : pR;

    // スコアフォーマット "2-1 (15-10, 12-10, 15-12)"
    let formattedScore = match.score ? match.score.replace(/\s+/g, '') : "";
    if (match.details) {
      formattedScore += ` <span style="font-size:13px; color:#A1A1AA; font-weight:normal;">(${match.details})</span>`;
    }
    
    // ★ 変更点：「QR」ボタンを「PDF」ボタンの左側に追加
    return `
      <div class="roster-item" style="flex-direction:column; align-items:flex-start; gap:8px; background: rgba(255,255,255,0.03); padding: 12px 15px; border-radius: 8px; border: 1px solid #333333; width: 100%; box-sizing: border-box;">
        <div style="font-size:14px; font-weight:bold; color:#FFFFFF; line-height: 1.4; width:100%; word-break: break-all;">
          ${titleL}<br><span style="color:#94A3B8; font-size: 11px; margin:0 5px;">vs</span><br>${titleR}
        </div>
        <div style="font-size:16px; color:#10B981; font-weight: bold; margin-top: 4px; margin-bottom: 2px;">${formattedScore}</div>
        <div style="display:flex; justify-content:space-between; align-items:flex-end; width:100%; margin-top:4px;">
          <div style="font-size:12px; color:#94A3B8;">${match.date || ''}</div>
          <div style="display:flex; gap:8px; align-items:center;">
            ${isInterrupted 
              ? `<button class="roster-edit-btn" style="color:#F59E0B; border-color:#F59E0B; padding: 4px 8px; font-size: 11px;" onclick="resumeHistory(${index})">RESUME</button>` 
              : `<div style="color:#10B981; border:1px solid #10B981; padding: 4px 8px; font-size: 11px; border-radius: 6px; font-weight: bold;">FINISHED</div>`
            }
            <button class="roster-edit-btn" style="color:#8B5CF6; border-color:#8B5CF6; padding: 4px 8px; font-size: 11px;" onclick="openQROutputModal(${index})">QR</button>
            <button class="roster-edit-btn" style="color:#3B82F6; border-color:#3B82F6; padding: 4px 8px; font-size: 11px;" onclick="exportHistoryToPDF(${index})">PDF</button>
            <button class="roster-delete-btn" style="padding: 4px 8px; font-size: 11px;" onclick="deleteHistory(${index})">DEL</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function deleteHistory(index) {
  if (confirm("この履歴を削除しますか？")) {
    let historyList = getHistoryList();
    historyList.splice(index, 1);
    localStorage.setItem('call_match_history', JSON.stringify(historyList));
    renderHistoryList();
  }
}

function resumeHistory(index) {
  if (!confirm("この試合を続きから再開しますか？\n（現在進行中の試合データは破棄されます）")) return;

  let historyList = getHistoryList();
  let matchItem = historyList[index];
  let state = matchItem.state || matchItem;

  flowIsDouble = state.hasOwnProperty('flowIsDouble') ? state.flowIsDouble : true;
  flowMaxGames = state.hasOwnProperty('flowMaxGames') ? state.flowMaxGames : 3;
  flowMaxPoints = state.hasOwnProperty('flowMaxPoints') ? state.flowMaxPoints : 15;
  flowHasCE = state.hasOwnProperty('flowHasCE') ? state.flowHasCE : true;
  flowHasInterval = state.hasOwnProperty('flowHasInterval') ? state.flowHasInterval : true;
  flowHasSetting = state.hasOwnProperty('flowHasSetting') ? state.flowHasSetting : true;

  sL = state.sL || 0; sR = state.sR || 0;
  gL = state.gL || 0; gR = state.gR || 0;
  srvL = state.hasOwnProperty('srvL') ? state.srvL : true;
  tL = state.tL || ""; tR = state.tR || "";
  nL1 = state.nL1 || ""; nL2 = state.nL2 || "";
  nR1 = state.nR1 || ""; nR2 = state.nR2 || "";
  pL1IsRight = state.hasOwnProperty('pL1IsRight') ? state.pL1IsRight : (state.hasOwnProperty('pL1R') ? state.pL1R : true);
  pR1IsRight = state.hasOwnProperty('pR1IsRight') ? state.pR1IsRight : (state.hasOwnProperty('pR1R') ? state.pR1R : true);
  isOver = state.isOver || false;
  needsOverlay = state.needsOverlay || false;
  ivDoneInThisGame = state.ivDoneInThisGame || (state.iv || false);
  isSelectingRoles = state.hasOwnProperty('isSelectingRoles') ? state.isSelectingRoles : (state.hasOwnProperty('isr') ? state.isr : true);
  overlayMsg = state.overlayMsg || ""; resultDetails = state.resultDetails || ""; ceNotice = state.ceNotice || "";
  annL = state.annL || (state.al || ""); annR = state.annR || (state.ar || "");
  shownCountL = state.shownCountL || (state.cL || 0); shownCountR = state.shownCountR || (state.cR || 0);
  justAfterInterval = state.justAfterInterval || (state.jai || false);
  initialTL = state.initialTL || ""; initialTR = state.initialTR || ""; initialNL1 = state.initialNL1 || "";
  
  matchScoreHistory = state.matchScoreHistory || [];
  matchDefaultRole = state.matchDefaultRole || {};
  matchTimeline = state.matchTimeline || [];
  if (typeof matchTimeline === 'string') {
    try { matchTimeline = JSON.parse(matchTimeline); } catch(e) { matchTimeline = []; }
  }
  hist = state.hist || [];
  redoStack = state.redoStack || [];

  if (typeof Recorder !== 'undefined') {
    Recorder.loadData(state.recorderData);
  }

  historyList.splice(index, 1);
  localStorage.setItem('call_match_history', JSON.stringify(historyList));
  if (typeof saveActiveBackup === 'function') saveActiveBackup();

  closeHistoryModal();
  
  document.getElementById("game-flow-container").style.display = "none";
  document.getElementById("board-ui").style.display = "flex";
  
  if (isSelectingRoles) {
    if (typeof initRoleSelectionOverlay === 'function') initRoleSelectionOverlay();
    if (typeof syncBoardDOM === 'function') syncBoardDOM();
  } else {
    document.getElementById("role-selection-overlay").style.display = "none";
    if (typeof syncBoardDOM === 'function') syncBoardDOM();
    if (typeof triggerBannerDisplay === 'function') triggerBannerDisplay(needsOverlay);
  }
  
  flowStep = 3;
}

function exportHistoryToPDF(index) {
  let historyList = getHistoryList();
  let matchItem = historyList[index];
  if (!matchItem) return;
  let state = matchItem.state || matchItem;
  
  if (typeof generatePDF === 'function') {
    generatePDF(state);
  } else {
    alert("PDF生成機能が読み込まれていません。ページをリロードしてください。");
  }
}