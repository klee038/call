// =========================================
// サーバー・レシーバー選択と陣形記憶 (role.js)
// =========================================

function initRoleSelectionOverlay() {
  const overlay = document.getElementById("role-selection-overlay");
  if (!isSelectingRoles) {
    if (overlay) overlay.style.display = "none";
    return;
  }

  // シングルスの場合は選択画面を完全にスキップして即試合開始
  if (!flowIsDouble) {
    pL1IsRight = true; 
    pR1IsRight = true;
    confirmRoles(); // 即座に確定処理へ移行
    return;
  }

  // ダブルスの場合は通常通り選択画面を表示する
  if (overlay) overlay.style.display = "flex";

  const titleEl = document.getElementById("role-overlay-title");
  const subtitleEl = document.getElementById("role-overlay-subtitle");
  const splitContainer = document.getElementById("role-split-container");
  const confirmBtn = document.getElementById("role-overlay-confirm-btn");

  if (titleEl) titleEl.innerText = "GAME PREPARATION";
  // ★構想2：案内文を「リストから選ぶ」から「タップで反転する」内容へ最適化
  if (subtitleEl) subtitleEl.innerText = "初期配置を確認し、必要に応じてタップで左右を入れ替えてください";
  if (splitContainer) splitContainer.style.display = "flex";
  if (confirmBtn) confirmBtn.innerText = "GAME START";

  // ★構想2：ui.jsと全く同じ計算で「現在の実際のコート配置とサーバー/レシーバー状態」を算出し、そのままボタンとして描画する
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

  // ★構想2：左右のブロック全体を「1つの巨大なプレビュー兼トグルボタン」として再構築
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

/**
 * ★新規追加：タップされた側の左右の選手を単純に入れ替えて再描画する
 */
function toggleRole(side) {
  if (side === 'L') {
    pL1IsRight = !pL1IsRight;
  } else {
    pR1IsRight = !pR1IsRight;
  }
  initRoleSelectionOverlay(); // オーバーレイ内の表示を即時更新
  if (typeof syncBoardDOM === 'function') syncBoardDOM(); // 背景の0-0スコア板も即時同期させて違和感を消す
}

function confirmRoles() {
  // 毎ゲームの0-0（ゲーム開始時）に確定した「選択された人の名前」を次のゲームのデフォルトとして記憶する
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

  // ★機能プラス：公式記録員（PDFノート）に最初のサーバーとレシーバーを報告する処理
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