// =========================================
// 画面描画・UI更新処理 (ui.js)
// =========================================

/**
 * アプリ起動時の初期化処理
 */
window.onload = function() {
  if (typeof renderFlow === 'function') renderFlow();
  
  const rosterPlayerInput = document.getElementById('roster-player-name');
  const rosterTeamInput = document.getElementById('roster-team-name');
  const rosterSubmitBtn = document.getElementById('roster-submit-btn');

  if (rosterPlayerInput && rosterSubmitBtn) {
    rosterPlayerInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') rosterSubmitBtn.click();
    });
  }
  if (rosterTeamInput && rosterSubmitBtn) {
    rosterTeamInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') rosterSubmitBtn.click();
    });
  }

  const playerSelectCancelContainer = document.querySelector('#player-select-overlay .back-nav-bar');
  if (playerSelectCancelContainer) {
    playerSelectCancelContainer.style.marginTop = '20px';
    playerSelectCancelContainer.style.width = '100%';
    playerSelectCancelContainer.innerHTML = `
      <button class="action-btn roster-cancel-btn" style="width: 100%; margin: 0 auto; display: block;" onclick="closePlayerSelectModal()">CANCEL</button>
    `;
  }
};

/**
 * 得点板のDOM表示・エフェクト更新処理
 */
function syncBoardDOM() {
  let titleLText = getBoardSideName(true);
  let titleRText = getBoardSideName(false);
  
  if (titleLText.length >= 15) {
    document.getElementById("title-text-L").classList.add("long-text");
  } else {
    document.getElementById("title-text-L").classList.remove("long-text");
  }
  
  if (titleRText.length >= 15) {
    document.getElementById("title-text-R").classList.add("long-text");
  } else {
    document.getElementById("title-text-R").classList.remove("long-text");
  }

  document.getElementById("title-text-L").innerText = titleLText;
  document.getElementById("title-text-R").innerText = titleRText;
  document.getElementById("score-val-L").innerText = sL;
  document.getElementById("score-val-R").innerText = sR;
  document.getElementById("ann-text-L").innerText = annL;
  document.getElementById("ann-text-R").innerText = annR;

  let btnRedo = document.getElementById("btn-redo");
  if (btnRedo) {
    if (redoStack.length > 0) {
      btnRedo.style.color = "rgba(255,255,255,0.7)";
      btnRedo.style.pointerEvents = "auto";
    } else {
      btnRedo.style.color = "rgba(255,255,255,0.15)";
      btnRedo.style.pointerEvents = "none";
    }
  }
  
  let btnUndo = document.getElementById("btn-undo");
  if (btnUndo) {
    if (hist.length > 0 || (sL === 0 && sR === 0 && !isOver && !isSelectingRoles)) {
      btnUndo.style.color = "rgba(255,255,255,0.7)";
      btnUndo.style.pointerEvents = "auto";
    } else {
      btnUndo.style.color = "rgba(255,255,255,0.15)";
      btnUndo.style.pointerEvents = "none";
    }
  }

  let btnRecorder = document.getElementById("btn-recorder");
  let btnClose = document.getElementById("btn-close");

  if (isSelectingRoles) {
    if (btnUndo) btnUndo.classList.add("hidden-by-overlay");
    if (btnRedo) btnRedo.classList.add("hidden-by-overlay");
    if (btnRecorder) btnRecorder.classList.add("hidden-by-overlay");
    if (btnClose) btnClose.classList.add("hidden-by-overlay");
  } else {
    if (btnUndo) btnUndo.classList.remove("hidden-by-overlay");
    if (btnRedo) btnRedo.classList.remove("hidden-by-overlay");
    if (btnRecorder) btnRecorder.classList.remove("hidden-by-overlay");
    if (btnClose) btnClose.classList.remove("hidden-by-overlay");
  }

  if (typeof syncVolumeCallカンペ === 'function') {
    syncVolumeCallカンペ();
  }

  if (isSelectingRoles) return;

  let deuceCheck = flowHasSetting ? (sL >= flowMaxPoints - 1 && sR >= flowMaxPoints - 1 && Math.abs(sL - sR) <= 1) : false;
  if (deuceCheck) {
    document.getElementById("score-val-L").classList.add("deuce");
    document.getElementById("score-val-R").classList.add("deuce");
  } else {
    document.getElementById("score-val-L").classList.remove("deuce");
    document.getElementById("score-val-R").classList.remove("deuce");
  }

  let winTarget = Math.floor((flowMaxGames + 1) / 2);
  let dotsL = document.getElementById("game-dots-L");
  let dotsR = document.getElementById("game-dots-R");
  if (dotsL) dotsL.innerHTML = Array.from({length: winTarget}, (_, i) => `<div class="game-dot" style="background-color: ${i < gL ? '#FFFFFF' : 'rgba(255,255,255,0.12)'}"></div>`).join('');
  if (dotsR) dotsR.innerHTML = Array.from({length: winTarget}, (_, i) => `<div class="game-dot" style="background-color: ${i < gR ? '#FFFFFF' : 'rgba(255,255,255,0.12)'}"></div>`).join('');

  let containerL = document.getElementById("tags-container-L");
  let containerR = document.getElementById("tags-container-R");

  if (!flowIsDouble) {
    let classL = srvL ? "server" : "receiver";
    let classR = !srvL ? "server" : "receiver";

    let extL = nL1.length >= 12 ? " long-text" : "";
    let extR = nR1.length >= 12 ? " long-text" : "";

    if (containerL) containerL.innerHTML = `<div class="player-tag ${classL}${extL}">${nL1}</div>`;
    if (containerR) containerR.innerHTML = `<div class="player-tag ${classR}${extR}">${nR1}</div>`;
  } 
  else {
    let p1S_L = srvL && ((sL % 2 === 0) === pL1IsRight);
    let p1S_R = !srvL && ((sR % 2 === 0) === pR1IsRight);

    let boxFarNameL = pL1IsRight ? nL2 : nL1;
    let boxNearNameL = pL1IsRight ? nL1 : nL2;
    let boxFarClassL = "";
    let boxNearClassL = "";
    
    let boxFarNameR = pR1IsRight ? nR1 : nR2;
    let boxNearNameR = pR1IsRight ? nR2 : nR1;
    let boxFarClassR = "";
    let boxNearClassR = "";

    if (srvL) {
      if (p1S_L) { if (pL1IsRight) boxNearClassL = "server"; else boxFarClassL = "server"; } 
      else       { if (pL1IsRight) boxFarClassL = "server"; else boxNearClassL = "server"; }
      
      if (boxFarClassL === "server") {
          boxNearClassR = "receiver";
      } else if (boxNearClassL === "server") {
          boxFarClassR = "receiver";
      }
    } else {
      if (p1S_R) { if (pR1IsRight) boxFarClassR = "server"; else boxNearClassR = "server"; } 
      else       { if (pR1IsRight) boxNearClassR = "server"; else boxFarClassR = "server"; }

      if (boxNearClassR === "server") {
          boxFarClassL = "receiver";
      } else if (boxFarClassR === "server") {
          boxNearClassL = "receiver";
      }
    }
    
    let extFarL = boxFarNameL.length >= 12 ? " long-text" : "";
    let extNearL = boxNearNameL.length >= 12 ? " long-text" : "";
    let extFarR = boxFarNameR.length >= 12 ? " long-text" : "";
    let extNearR = boxNearNameR.length >= 12 ? " long-text" : "";

    if (containerL) {
      containerL.innerHTML = `
        <div class="player-tag ${boxFarClassL}${extFarL}">${boxFarNameL}</div>
        <div class="player-tag ${boxNearClassL}${extNearL}">${boxNearNameL}</div>`;
    }
    if (containerR) {
      containerR.innerHTML = `
        <div class="player-tag ${boxFarClassR}${extFarR}">${boxFarNameR}</div>
        <div class="player-tag ${boxNearClassR}${extNearR}">${boxNearNameR}</div>`;
    }
  }
}

// =========================================
// QRスキャナー・出力モーダル開閉と圧縮/解凍ロジック
// =========================================

// ★修正：カメラ一時停止(pause)をやめ、完全に停止・破棄(stop)する元の安全なロジックに戻す
let html5QrCode = null;

/**
 * 【入力側】QRスキャナーモーダルを開き、カメラを起動する
 */
function openQRScannerModal() {
  const overlay = document.getElementById('qr-scanner-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';

  if (typeof Html5Qrcode === 'undefined') {
    alert("QRコード読み取り機能が読み込まれていません。通信環境を確認してください。");
    return;
  }

  // もし前のカメラが残っていれば確実にストップして破棄する
  if (html5QrCode) {
    try { 
      html5QrCode.stop().then(() => { html5QrCode = null; }).catch(e => { html5QrCode = null; });
    } catch(e) { html5QrCode = null; }
  }

  // 毎回新しいインスタンスとしてクリーンに起動する
  html5QrCode = new Html5Qrcode("qr-reader");

  const onScanSuccess = (decodedText, decodedResult) => {
    // 成功したらすぐにカメラを完全に停止(stop)し、リソースを手放す
    if (html5QrCode) {
      html5QrCode.stop().then(() => {
        html5QrCode = null;
      }).catch(err => console.log("カメラ停止エラー", err));
    }

    try {
      let binaryString = atob(decodedText);
      let charArray = binaryString.split('').map(c => c.charCodeAt(0));
      let uint8Array = new Uint8Array(charArray);

      let decompressedUint8 = pako.inflate(uint8Array);
      let decompressedText = new TextDecoder().decode(decompressedUint8);
      let matchData = JSON.parse(decompressedText);
      
      if (typeof resumeMatchFromState === 'function') {
        resumeMatchFromState(matchData);
      } else {
        alert("復元・ワープ用の関数が見つかりません。");
      }
      
    } catch (e) {
      alert("QRコードの解読に失敗しました。データ形式が正しくありません。");
      console.error(e);
    }
    overlay.style.display = 'none';
  };

  const cameraConfig = { facingMode: "environment" };
  const config = { 
    fps: 15,
    qrbox: { width: 250, height: 250 } 
  };

  html5QrCode.start(cameraConfig, config, onScanSuccess)
    .catch(err => {
      alert("カメラの起動に失敗しました。ブラウザの許可を確認してください。");
      console.error(err);
    });
}

function closeQRScannerModal() {
  const overlay = document.getElementById('qr-scanner-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    // 閉じる時も完全に停止(stop)してバッテリー消費を防ぐ
    if (html5QrCode) {
      html5QrCode.stop().then(() => {
        html5QrCode = null;
      }).catch(err => console.log("カメラ停止エラー", err));
    }
  }
}

/**
 * 【出力側】ダイレクトQR表示（履歴一覧から一発表示）
 */
function openQROutputModal(index) {
  const overlay = document.getElementById('qr-direct-overlay');
  if (!overlay) return;
  
  try {
    let historyList = getHistoryList();
    let matchItem = historyList[index];
    if (!matchItem) throw new Error("指定された試合データが見つかりません。");
    
    let state = JSON.parse(JSON.stringify(matchItem.state || matchItem));
    
    // PDFに必要なデータは残しつつ、重いUndo履歴だけを削ってダイエット
    state.hist = [];
    state.redoStack = [];
    
    let jsonString = JSON.stringify(state);
    let uint8Array = new TextEncoder().encode(jsonString);
    let compressedArray = pako.deflate(uint8Array);
    
    let binaryString = "";
    for (let i = 0; i < compressedArray.length; i++) {
        binaryString += String.fromCharCode(compressedArray[i]);
    }
    let base64String = btoa(binaryString);
    
    overlay.innerHTML = ""; 
    
    // ★大修正：Safariのツールバー等に影響されない、最強の「はみ出し防止CSS」
    let qrContainer = document.createElement('div');
    // 幅・高さを画面の短い方(vmin)の80%に設定し、絶対に画面からはみ出さないようにロック
    qrContainer.style.cssText = "width: 80vmin; height: 80vmin; max-width: 400px; max-height: 400px; background-color: #ffffff; border-radius: 12px; padding: 15px; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; overflow: hidden;";
    
    let canvas = document.createElement('canvas');
    // キャンバスは親(qrContainer)の内部サイズ(100%)に完全に追従する
    canvas.style.cssText = "width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: contain; display: block;";
    
    qrContainer.appendChild(canvas);
    overlay.appendChild(qrContainer);
    
    // ピクセル指定を外し、CSSの枠サイズに自動で合わせる
    QRCode.toCanvas(canvas, base64String, {
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
      errorCorrectionLevel: 'L'
    }, function (error) {
      if (error) {
        console.error(error);
        alert("データ量が大きすぎてQRコードの生成限界を超えました。");
      }
    });
    
    overlay.style.display = 'flex';
    
  } catch (e) {
    alert("データの圧縮またはQRコードの生成に失敗しました。");
    console.error(e);
  }
}

/**
 * 【出力側】ダイレクトQR表示を閉じる（タップされた時）
 */
function closeQROutputModal() {
  const overlay = document.getElementById('qr-direct-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.innerHTML = ''; 
  }
}