// =========================================
// サーバー・レシーバー選択と陣形記憶 (role.js)
// =========================================

function initRoleSelectionOverlay() {
  const overlay = document.getElementById("role-selection-overlay");
  
  // game.js側でシングルスの場合はisSelectingRoles=falseに設定済のため、ここで処理を抜ける
  if (!isSelectingRoles) {
    if (overlay) overlay.style.display = "none";
    return;
  }

  // 万が一シングルスでここに来た場合は何もしない（game.jsで裏側記録するため）
  if (!flowIsDouble) {
    if (overlay) overlay.style.display = "none";
    return;
  }

  if (overlay) overlay.style.display = "flex";

  const titleEl = document.getElementById("role-overlay-title");
  const subtitleEl = document.getElementById("role-overlay-subtitle");
  const splitContainer = document.getElementById("role-split-container");
  const confirmBtn = document.getElementById("role-overlay-confirm-btn");

  if (titleEl) titleEl.innerText = "GAME PREPARATION";
  if (subtitleEl) subtitleEl.innerText = "初期配置を確認し、必要に応じてタップで左右を入れ替えてください";
  if (splitContainer) splitContainer.style.display = "flex";
  if (confirmBtn) confirmBtn.innerText = "GAME START";

  let boxFarNameL = pL1IsRight ? nL2 : nL1;
  let boxNearNameL = pL1IsRight ? nL1 : nL2;
  let boxFarClassL = ""; let boxNearClassL = "";
  
  let boxFarNameR = pR1IsRight ? nR1 : nR2;
  let boxNearNameR = pR1IsRight ? nR2 : nR1;
  let boxFarClassR = ""; let boxNearClassR = "";

  let p1S_L = srvL && ((sL % 2 === 0) === pL1IsRight);
  let p1S_R = !srvL && ((sR % 2 === 0) === pR1IsRight);

  if (srvL) {
    if (p1S_L) { if (pL1IsRight) boxNearClassL = "server"; else boxFarClassL = "server"; } 
    else       { if (pL1IsRight) boxFarClassL = "server"; else boxNearClassL = "server"; }
    if (boxFarClassL === "server") boxNearClassR = "receiver";
    else if (boxNearClassL === "server") boxFarClassR = "receiver";
  } else {
    if (p1S_R) { if (pR1IsRight) boxFarClassR = "server"; else boxNearClassR = "server"; } 
    else       { if (pR1IsRight) boxNearClassR = "server"; else boxFarClassR = "server"; }
    if (boxNearClassR === "server") boxFarClassL = "receiver";
    else if (boxFarClassR === "server") boxNearClassL = "receiver";
  }

  let dispTL = tL ? tL : "&nbsp;";
  let dispTR = tR ? tR : "&nbsp;";

  let extFarL = boxFarNameL.length >= 12 ? " long-text" : "";
  let extNearL = boxNearNameL.length >= 12 ? " long-text" : "";
  let extFarR = boxFarNameR.length >= 12 ? " long-text" : "";
  let extNearR = boxNearNameR.length >= 12 ? " long-text" : "";

  let roleL = srvL ? 'SERVER' : 'RECEIVER';
  let roleR = !srvL ? 'SERVER' : 'RECEIVER';

  if (splitContainer) {
    splitContainer.innerHTML = `
      <div class="role-split-side toggle-mode" onclick="toggleRole('L')" style="cursor: pointer; position: relative; transition: background 0.2s;">
        <div class="role-picker-title" style="pointer-events: none;">
          ${roleL}<br>
          <span style="font-size: 13px; color: #94A3B8; font-weight: normal; display: block; min-height: 18px;">${dispTL}</span>
          LEFT
        </div>
        <div class="role-picker-row" style="pointer-events: none; gap: 10px; width: 100%;">
          <div class="player-tag ${boxFarClassL}${extFarL}" style="width: 100%; margin: 0; padding: 12px; background: rgba(255,255,255,0.05);">${boxFarNameL}</div>
          <div class="player-tag ${boxNearClassL}${extNearL}" style="width: 100%; margin: 0; padding: 12px; background: rgba(255,255,255,0.05);">${boxNearNameL}</div>
        </div>
        <div class="toggle-hint" style="color: #3B82F6; font-size: 12px; font-weight: bold; margin-top: 18px; display: flex; align-items: center; justify-content: center; gap: 4px; pointer-events: none;">
          <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
          TAP TO SWAP
        </div>
      </div>

      <div class="role-split-side toggle-mode" onclick="toggleRole('R')" style="cursor: pointer; position: relative; transition: background 0.2s;">
        <div class="role-picker-title" style="pointer-events: none;">
          ${roleR}<br>
          <span style="font-size: 13px; color: #94A3B8; font-weight: normal; display: block; min-height: 18px;">${dispTR}</span>
          RIGHT
        </div>
        <div class="role-picker-row" style="pointer-events: none; gap: 10px; width: 100%;">
          <div class="player-tag ${boxFarClassR}${extFarR}" style="width: 100%; margin: 0; padding: 12px; background: rgba(255,255,255,0.05);">${boxFarNameR}</div>
          <div class="player-tag ${boxNearClassR}${extNearR}" style="width: 100%; margin: 0; padding: 12px; background: rgba(255,255,255,0.05);">${boxNearNameR}</div>
        </div>
        <div class="toggle-hint" style="color: #3B82F6; font-size: 12px; font-weight: bold; margin-top: 18px; display: flex; align-items: center; justify-content: center; gap: 4px; pointer-events: none;">
          <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
          TAP TO SWAP
        </div>
      </div>
    `;
  }
}

function toggleRole(side) {
  if (side === 'L') {
    pL1IsRight = !pL1IsRight;
  } else {
    pR1IsRight = !pR1IsRight;
  }
  initRoleSelectionOverlay(); 
  if (typeof syncBoardDOM === 'function') syncBoardDOM(); 
}

function confirmRoles() {
  if (sL === 0 && sR === 0) {
    let selL = pL1IsRight ? nL1 : nL2;
    let selR = pR1IsRight ? nR1 : nR2;
    if (nL1 === initialNL1) {
      matchDefaultRole.initialLeftTeamSelectedPlayer = selL;
      matchDefaultRole.initialRightTeamSelectedPlayer = selR;
    } else {
      matchDefaultRole.initialLeftTeamSelectedPlayer = selR;
      matchDefaultRole.initialRightTeamSelectedPlayer = selL;
    }
  }

  if (typeof Recorder !== 'undefined') {
    let serverName = "";
    let receiverName = "";
    if (!flowIsDouble) {
      serverName = srvL ? nL1 : nR1;
      receiverName = srvL ? nR1 : nL1;
    } else {
      let leftRightPlayer = pL1IsRight ? nL1 : nL2;
      let rightRightPlayer = pR1IsRight ? nR1 : nR2;
      if (srvL) {
        serverName = leftRightPlayer;
        receiverName = rightRightPlayer;
      } else {
        serverName = rightRightPlayer;
        receiverName = leftRightPlayer;
      }
    }
    Recorder.recordFirstSR(gL + gR, serverName, receiverName);
  }

  isSelectingRoles = false;
  const overlay = document.getElementById("role-selection-overlay");
  if (overlay) overlay.style.display = "none";
  if (typeof syncBoardDOM === 'function') syncBoardDOM();
  if (typeof saveActiveBackup === 'function') saveActiveBackup();
}