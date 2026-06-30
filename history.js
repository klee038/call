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
    tL1: tL1, tL2: tL2, tR1: tR1, tR2: tR2, 
    nL1: nL1, nL2: nL2, nR1: nR1, nR2: nR2,
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
  if (sL === 0 && sR === 0 && !isOver && !isSelectingRoles) {
    isSelectingRoles = true;
    
    // 連打による空回りを防ぐため、配列にデータが残っている場合のみpopを実行する
    if (typeof Recorder !== 'undefined' && Recorder.data && Array.isArray(Recorder.data.timeline) && Recorder.data.timeline.length > 0) {
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
    tL1: tL1, tL2: tL2, tR1: tR1, tR2: tR2, 
    nL1: nL1, nL2: nL2, nR1: nR1, nR2: nR2,
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
  tL1 = l.tL1 !== undefined ? l.tL1 : (l.tL || ""); 
  tL2 = l.tL2 !== undefined ? l.tL2 : (l.tL || ""); 
  tR1 = l.tR1 !== undefined ? l.tR1 : (l.tR || ""); 
  tR2 = l.tR2 !== undefined ? l.tR2 : (l.tR || "");
  nL1 = l.nL1; nL2 = l.nL2; nR1 = l.nR1; nR2 = l.nR2;
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
      tL1: tL1, tL2: tL2, tR1: tR1, tR2: tR2, 
      nL1: nL1, nL2: nL2, nR1: nR1, nR2: nR2,
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
    tL1 = l.tL1 !== undefined ? l.tL1 : (l.tL || ""); 
    tL2 = l.tL2 !== undefined ? l.tL2 : (l.tL || ""); 
    tR1 = l.tR1 !== undefined ? l.tR1 : (l.tR || ""); 
    tR2 = l.tR2 !== undefined ? l.tR2 : (l.tR || "");
    nL1 = l.nL1; nL2 = l.nL2; nR1 = l.nR1; nR2 = l.nR2;
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

        // 旧仕様互換のための結合
        let tLCombined = state.tL !== undefined ? state.tL : ((state.tL1 === state.tL2 || !state.tL2) ? state.tL1 : `${state.tL1} / ${state.tL2}`);
        let tRCombined = state.tR !== undefined ? state.tR : ((state.tR1 === state.tR2 || !state.tR2) ? state.tR1 : `${state.tR1} / ${state.tR2}`);

        let teamLName = tLCombined ? tLCombined : (state.flowIsDouble ? `${state.nL1} & ${state.nL2}` : state.nL1);
        let teamRName = tRCombined ? tRCombined : (state.flowIsDouble ? `${state.nR1} & ${state.nR2}` : state.nR1);
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
    let statusColor = isInterrupted ? "#F59E0B" : "#10B981";
    
    let st = match.state || match || {};
    let isD = st.hasOwnProperty('flowIsDouble') ? st.flowIsDouble : true;
    let pL = st.nL1 ? (isD ? `${st.nL1} & ${st.nL2}` : st.nL1) : (match.title ? match.title.split(' vs ')[0] : "");
    let pR = st.nR1 ? (isD ? `${st.nR1} & ${st.nR2}` : st.nR1) : (match.title ? match.title.split(' vs ')[1] : "");
    
    let tLCombined = st.tL !== undefined ? st.tL : ((st.tL1 === st.tL2 || !st.tL2) ? st.tL1 : `${st.tL1} / ${st.tL2}`);
    let tRCombined = st.tR !== undefined ? st.tR : ((st.tR1 === st.tR2 || !st.tR2) ? st.tR1 : `${st.tR1} / ${st.tR2}`);
    
    let tL = tLCombined ? tLCombined.trim() : "";
    let tR = tRCombined ? tRCombined.trim() : "";

    let teamLHtml = tL ? `<div style="font-size:12px; color:#94A3B8;">${tL}</div>` : "";
    let playerLHtml = `<div style="font-size:13px; color:#FFFFFF; font-weight:bold;">${pL}</div>`;
    let vsHtml = `<div style="font-size:10px; color:#64748B; margin: 4px 0;">vs</div>`;
    let teamRHtml = tR ? `<div style="font-size:12px; color:#94A3B8;">${tR}</div>` : "";
    let playerRHtml = `<div style="font-size:13px; color:#FFFFFF; font-weight:bold;">${pR}</div>`;

    let formattedScore = match.score ? match.score.replace(/\s+/g, '') : "";
    if (match.details) {
      formattedScore += ` <span style="font-size:12px; color:#A1A1AA; font-weight:normal;">(${match.details})</span>`;
    }
    
    let dateStr = match.date || '';
    let formattedDate = dateStr.replace(' ', '<br>');
    
    let qrSvg = `<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v4h-2v-4zm3 3h3v2h-3v-2z"/></svg>`;

    return `
      <div class="roster-item" style="position: relative; flex-direction: column; align-items: flex-start; gap: 8px; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; border: 1px solid #333333; width: 100%; box-sizing: border-box;">
        
        <button class="roster-edit-btn" style="position: absolute; top: 15px; right: 15px; color: ${statusColor}; border-color: ${statusColor}; padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: transparent;" onclick="openQROutputModal(${index})">
          ${qrSvg}
        </button>

        <div style="line-height: 1.3; width: calc(100% - 40px); word-break: break-all;">
          ${teamLHtml}
          ${playerLHtml}
          ${vsHtml}
          ${teamRHtml}
          ${playerRHtml}
        </div>
        
        <div style="font-size:16px; color:#10B981; font-weight: bold; margin-top: 6px; margin-bottom: 2px;">${formattedScore}</div>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin-top: 4px;">
          <div style="font-size:11px; color:#94A3B8; line-height: 1.3;">${formattedDate}</div>
          <div style="display: flex; gap: 8px; align-items: center;">
            ${isInterrupted 
              ? `<button class="roster-edit-btn" style="color:#F59E0B; border-color:#F59E0B; padding: 4px 8px; font-size: 11px;" onclick="resumeHistory(${index})">RESUME</button>` 
              : `<div style="color:#10B981; border:1px solid #10B981; padding: 4px 8px; font-size: 11px; border-radius: 6px; font-weight: bold;">FINISHED</div>`
            }
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

  resumeMatchFromState(state);

  historyList.splice(index, 1);
  localStorage.setItem('call_match_history', JSON.stringify(historyList));
  if (typeof saveActiveBackup === 'function') saveActiveBackup();

  closeHistoryModal();
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

// =========================================
// 新設：QRなどから復元した状態(State)で強制ワープする共通エンジン
// =========================================
function resumeMatchFromState(state) {
  flowIsDouble = state.hasOwnProperty('flowIsDouble') ? state.flowIsDouble : true;
  flowMaxGames = state.hasOwnProperty('flowMaxGames') ? state.flowMaxGames : 3;
  flowMaxPoints = state.hasOwnProperty('flowMaxPoints') ? state.flowMaxPoints : 15;
  flowHasCE = state.hasOwnProperty('flowHasCE') ? state.flowHasCE : true;
  flowHasInterval = state.hasOwnProperty('flowHasInterval') ? state.flowHasInterval : true;
  flowHasSetting = state.hasOwnProperty('flowHasSetting') ? state.flowHasSetting : true;
  flowIsTeamMatch = state.hasOwnProperty('flowIsTeamMatch') ? state.flowIsTeamMatch : false;

  sL = state.sL || 0; sR = state.sR || 0;
  gL = state.gL || 0; gR = state.gR || 0;
  srvL = state.hasOwnProperty('srvL') ? state.srvL : true;
  
  // 過去の1枠仕様(tL/tR)からの復元互換
  tL1 = state.tL1 !== undefined ? state.tL1 : (state.tL || "");
  tL2 = state.tL2 !== undefined ? state.tL2 : (state.tL || "");
  tR1 = state.tR1 !== undefined ? state.tR1 : (state.tR || "");
  tR2 = state.tR2 !== undefined ? state.tR2 : (state.tR || "");
  
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
  
  initialTL1 = state.initialTL1 !== undefined ? state.initialTL1 : (state.initialTL || ""); 
  initialTL2 = state.initialTL2 !== undefined ? state.initialTL2 : (state.initialTL || ""); 
  initialTR1 = state.initialTR1 !== undefined ? state.initialTR1 : (state.initialTR || ""); 
  initialTR2 = state.initialTR2 !== undefined ? state.initialTR2 : (state.initialTR || ""); 
  initialNL1 = state.initialNL1 || "";
  initialNL2 = state.initialNL2 || "";
  initialNR1 = state.initialNR1 || "";
  initialNR2 = state.initialNR2 || "";
  
  matchScoreHistory = state.matchScoreHistory || [];
  matchDefaultRole = state.matchDefaultRole || {};
  
  matchTimeline = state.matchTimeline || [];
  if (typeof matchTimeline === 'string') {
    try { matchTimeline = JSON.parse(matchTimeline); } catch(e) { matchTimeline = []; }
  }
  
  hist = state.hist || [];
  redoStack = state.redoStack || [];

  if (typeof Recorder !== 'undefined') {
    try {
      if (state.recorderData) {
        Recorder.loadData(state.recorderData);
      } else {
        let oldTL = (tL1 === tL2 || !tL2) ? tL1 : `${tL1} / ${tL2}`;
        let oldTR = (tR1 === tR2 || !tR2) ? tR1 : `${tR1} / ${tR2}`;
        Recorder.initMatch(flowIsDouble, oldTL, oldTR, nL1, nL2, nR1, nR2);
      }
    } catch(e) {
      console.warn("Recorderデータの復元に失敗しました", e);
    }
  }

  // ワープ前にアプリを試合モード（flowStep=3）に切り替える
  flowStep = 3;

  // 最新の状態としてアクティブバックアップを上書き保存する（PDFの出力に必須）
  if (typeof saveActiveBackup === 'function') saveActiveBackup();

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
}