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

  // ★修正：新設した「QR出力ボタン(btn-qr-out)」もTOSS画面等では隠す処理の対象に含める
  let btnQrOut = document.getElementById("btn-qr-out");
  let btnRecorder = document.getElementById("btn-recorder");
  let btnClose = document.getElementById("btn-close");

  if (isSelectingRoles) {
    if (btnUndo) btnUndo.classList.add("hidden-by-overlay");
    if (btnRedo) btnRedo.classList.add("hidden-by-overlay");
    if (btnQrOut) btnQrOut.classList.add("hidden-by-overlay");
    if (btnRecorder) btnRecorder.classList.add("hidden-by-overlay");
    if (btnClose) btnClose.classList.add("hidden-by-overlay");
  } else {
    if (btnUndo) btnUndo.classList.remove("hidden-by-overlay");
    if (btnRedo) btnRedo.classList.remove("hidden-by-overlay");
    if (btnQrOut) btnQrOut.classList.remove("hidden-by-overlay");
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
// アニメーションQR（分割送受信）と圧縮/解凍ロジック
// =========================================

let html5QrCode = null;
let isCameraPaused = false;
let qrAnimationTimer = null; 

let scannedChunks = [];
let totalChunksExpected = 0;

/**
 * 【入力側】QRスキャナーモーダルを開き、カメラを起動する
 */
function openQRScannerModal() {
  const overlay = document.getElementById('qr-scanner-overlay');
  const reader = document.getElementById('qr-reader');
  const spinner = document.getElementById('qr-loading-spinner');
  const dotsContainer = document.getElementById('qr-progress-dots');
  
  if (!overlay) return;
  
  scannedChunks = [];
  totalChunksExpected = 0;
  
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    dotsContainer.style.flexWrap = 'wrap'; 
  }
  
  if (reader) reader.style.display = 'block';
  if (spinner) spinner.style.display = 'none';
  overlay.style.display = 'flex';

  if (typeof Html5Qrcode === 'undefined') {
    alert("QRコード読み取り機能が読み込まれていません。");
    return;
  }

  if (html5QrCode && isCameraPaused) {
    html5QrCode.resume();
    isCameraPaused = false;
    return;
  }

  html5QrCode = new Html5Qrcode("qr-reader");

  const onScanSuccess = async (decodedText, decodedResult) => {
    if (totalChunksExpected > 0 && scannedChunks.filter(Boolean).length === totalChunksExpected) return;
    if (!decodedText.startsWith("QRX:")) return;

    try {
      const parts = decodedText.split(':');
      if (parts.length < 3) return;
      
      const meta = parts[1].split('/');
      const currentIndex = parseInt(meta[0], 10) - 1;
      const total = parseInt(meta[1], 10);
      const dataStr = parts.slice(2).join(':');

      if (totalChunksExpected === 0) {
        totalChunksExpected = total;
        if (dotsContainer) {
          dotsContainer.innerHTML = Array.from({length: total}, (_, i) => 
            `<div id="qr-dot-${i}" style="width: 8px; height: 8px; border-radius: 50%; background-color: rgba(255,255,255,0.15); flex-shrink: 0;"></div>`
          ).join('');
        }
      }

      if (!scannedChunks[currentIndex]) {
        scannedChunks[currentIndex] = dataStr;
        const targetDot = document.getElementById(`qr-dot-${currentIndex}`);
        if (targetDot) targetDot.style.backgroundColor = '#10B981';
      }

      const collectedCount = scannedChunks.filter(Boolean).length;
      if (collectedCount === totalChunksExpected) {
        
        if (html5QrCode) {
          try {
            await html5QrCode.stop();
            html5QrCode.clear();
          } catch(e) {} finally { html5QrCode = null; }
        }
        
        if (reader) reader.style.display = 'none';
        if (spinner) spinner.style.display = 'flex';

        setTimeout(() => {
          try {
            let fullBase64 = scannedChunks.join('');
            let binaryString = atob(fullBase64);
            let charArray = binaryString.split('').map(c => c.charCodeAt(0));
            let uint8Array = new Uint8Array(charArray);

            let decompressedUint8 = pako.inflate(uint8Array);
            let decompressedText = new TextDecoder().decode(decompressedUint8);
            let matchData = JSON.parse(decompressedText);
            
            if (typeof processScannedData === 'function') {
              processScannedData(matchData);
            } else {
              alert("復元用の関数が見つかりません。");
            }
            
            overlay.style.display = 'none';
            if (reader) reader.style.display = 'block';
            if (spinner) spinner.style.display = 'none';

          } catch (e) {
            alert("QRコードの結合・解読に失敗しました。");
            console.error(e);
            if (spinner) spinner.style.display = 'none';
            if (reader) reader.style.display = 'block';
          }
        }, 50);
      }

    } catch (e) {
      console.warn("分割QRの処理中にエラー", e);
    }
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
      html5QrCode = null;
    });
}

async function closeQRScannerModal() {
  const overlay = document.getElementById('qr-scanner-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
    } catch (err) {
      console.log("カメラ停止エラー", err);
    } finally {
      html5QrCode = null;
    }
  }
}

/**
 * 【出力側】ダイレクトQR表示（履歴一覧から一発表示）
 */
function openQROutputModal(index) {
  const overlay = document.getElementById('qr-direct-overlay');
  if (!overlay) return;
  
  if (qrAnimationTimer) {
    clearInterval(qrAnimationTimer);
    qrAnimationTimer = null;
  }
  
  try {
    let historyList = getHistoryList();
    let matchItem = historyList[index];
    if (!matchItem) throw new Error("指定された試合データが見つかりません。");
    
    let state = JSON.parse(JSON.stringify(matchItem.state || matchItem));
    
    if (state.hist && state.hist.length > 0) {
      let latestHist = state.hist[state.hist.length - 1];
      state.hist = [latestHist];
    } else {
      state.hist = [];
    }
    state.redoStack = [];
    
    let jsonString = JSON.stringify(state);
    let uint8Array = new TextEncoder().encode(jsonString);
    let compressedArray = pako.deflate(uint8Array);
    
    let binaryString = "";
    for (let i = 0; i < compressedArray.length; i++) {
        binaryString += String.fromCharCode(compressedArray[i]);
    }
    let fullBase64String = btoa(binaryString);
    
    const chunkSize = 60; 
    let chunks = [];
    for (let i = 0; i < fullBase64String.length; i += chunkSize) {
      chunks.push(fullBase64String.substring(i, i + chunkSize));
    }
    
    const totalChunks = chunks.length;
    
    overlay.innerHTML = ""; 
    let qrContainer = document.createElement('div');
    qrContainer.style.cssText = "width: 80vw; height: 80vw; max-width: 400px; max-height: 400px; background-color: #ffffff; border-radius: 12px; padding: 15px; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative;";
    
    let canvas = document.createElement('canvas');
    canvas.style.cssText = "width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: contain; display: block;";
    
    let counterLabel = document.createElement('div');
    counterLabel.style.cssText = "position: absolute; bottom: 5px; right: 10px; font-size: 10px; color: #999; font-family: monospace;";
    
    qrContainer.appendChild(canvas);
    qrContainer.appendChild(counterLabel);
    overlay.appendChild(qrContainer);
    overlay.style.display = 'flex';

    let currentDrawIndex = 0;
    const drawNextQR = () => {
      let payload = `QRX:${currentDrawIndex + 1}/${totalChunks}:${chunks[currentDrawIndex]}`;
      
      QRCode.toCanvas(canvas, payload, {
        margin: 1,
        version: 5,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: 'L'
      }, function (error) {
        if (error) console.error("QR描画エラー:", error);
      });
      
      counterLabel.innerText = `${currentDrawIndex + 1} / ${totalChunks}`;
      currentDrawIndex = (currentDrawIndex + 1) % totalChunks;
    };

    drawNextQR();
    if (totalChunks > 1) {
      qrAnimationTimer = setInterval(drawNextQR, 150); 
    }
    
  } catch (e) {
    alert("データの圧縮またはQRコードの生成に失敗しました。");
    console.error(e);
  }
}

/**
 * 【出力側】★新設：得点板から「今の試合状態」を直接QR化して表示する
 */
function openCurrentMatchQRModal() {
  const overlay = document.getElementById('qr-direct-overlay');
  if (!overlay) return;
  
  if (qrAnimationTimer) {
    clearInterval(qrAnimationTimer);
    qrAnimationTimer = null;
  }
  
  try {
    // 履歴からではなく、今まさに動いているアプリのグローバル変数をかき集めて state オブジェクトを作る
    let currentState = {
      flowIsDouble: flowIsDouble,
      flowMaxGames: flowMaxGames,
      flowMaxPoints: flowMaxPoints,
      flowHasCE: flowHasCE,
      flowHasInterval: flowHasInterval,
      flowHasSetting: flowHasSetting,
      flowHasCourtSelect: flowHasCourtSelect,
      sL: sL, sR: sR, gL: gL, gR: gR, srvL: srvL,
      tL: tL, tR: tR,
      nL1: nL1, nL2: nL2, nR1: nR1, nR2: nR2,
      pL1IsRight: pL1IsRight, pR1IsRight: pR1IsRight,
      isOver: isOver, needsOverlay: needsOverlay,
      ivDoneInThisGame: ivDoneInThisGame,
      isSelectingRoles: isSelectingRoles,
      overlayMsg: overlayMsg, resultDetails: resultDetails, ceNotice: ceNotice,
      annL: annL, annR: annR,
      shownCountL: shownCountL, shownCountR: shownCountR,
      justAfterInterval: justAfterInterval,
      initialTL: initialTL, initialTR: initialTR,
      initialNL1: initialNL1, initialNL2: initialNL2,
      initialNR1: initialNR1, initialNR2: initialNR2,
      matchScoreHistory: matchScoreHistory,
      matchDefaultRole: matchDefaultRole,
      matchTimeline: matchTimeline,
      recorderData: (typeof Recorder !== 'undefined') ? Recorder.exportData() : null
    };

    // 戻るボタンの履歴（hist）は、最新の1件だけを持たせる（軽量化と戻る機能の両立）
    if (hist && hist.length > 0) {
      currentState.hist = [hist[hist.length - 1]];
    } else {
      currentState.hist = [];
    }
    currentState.redoStack = [];

    let jsonString = JSON.stringify(currentState);
    let uint8Array = new TextEncoder().encode(jsonString);
    let compressedArray = pako.deflate(uint8Array);
    
    let binaryString = "";
    for (let i = 0; i < compressedArray.length; i++) {
        binaryString += String.fromCharCode(compressedArray[i]);
    }
    let fullBase64String = btoa(binaryString);
    
    const chunkSize = 60; 
    let chunks = [];
    for (let i = 0; i < fullBase64String.length; i += chunkSize) {
      chunks.push(fullBase64String.substring(i, i + chunkSize));
    }
    
    const totalChunks = chunks.length;
    
    overlay.innerHTML = ""; 
    let qrContainer = document.createElement('div');
    qrContainer.style.cssText = "width: 80vw; height: 80vw; max-width: 400px; max-height: 400px; background-color: #ffffff; border-radius: 12px; padding: 15px; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative;";
    
    let canvas = document.createElement('canvas');
    canvas.style.cssText = "width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: contain; display: block;";
    
    let counterLabel = document.createElement('div');
    counterLabel.style.cssText = "position: absolute; bottom: 5px; right: 10px; font-size: 10px; color: #999; font-family: monospace;";
    
    qrContainer.appendChild(canvas);
    qrContainer.appendChild(counterLabel);
    overlay.appendChild(qrContainer);
    overlay.style.display = 'flex';

    let currentDrawIndex = 0;
    const drawNextQR = () => {
      let payload = `QRX:${currentDrawIndex + 1}/${totalChunks}:${chunks[currentDrawIndex]}`;
      
      QRCode.toCanvas(canvas, payload, {
        margin: 1,
        version: 5,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: 'L'
      }, function (error) {
        if (error) console.error("QR描画エラー:", error);
      });
      
      counterLabel.innerText = `${currentDrawIndex + 1} / ${totalChunks}`;
      currentDrawIndex = (currentDrawIndex + 1) % totalChunks;
    };

    drawNextQR();
    if (totalChunks > 1) {
      qrAnimationTimer = setInterval(drawNextQR, 150); 
    }
    
  } catch (e) {
    alert("現在の試合状況のQRコード生成に失敗しました。");
    console.error(e);
  }
}

/**
 * 【出力側】★新設：本部からの初期データを送信するためのQR表示
 */
function generateStartMatchQR(matchData) {
  const overlay = document.getElementById('qr-direct-overlay');
  if (!overlay) return;
  
  if (qrAnimationTimer) {
    clearInterval(qrAnimationTimer);
    qrAnimationTimer = null;
  }
  
  try {
    let jsonString = JSON.stringify(matchData);
    let uint8Array = new TextEncoder().encode(jsonString);
    let compressedArray = pako.deflate(uint8Array);
    
    let binaryString = "";
    for (let i = 0; i < compressedArray.length; i++) {
        binaryString += String.fromCharCode(compressedArray[i]);
    }
    let fullBase64String = btoa(binaryString);
    
    const chunkSize = 60; 
    let chunks = [];
    for (let i = 0; i < fullBase64String.length; i += chunkSize) {
      chunks.push(fullBase64String.substring(i, i + chunkSize));
    }
    
    const totalChunks = chunks.length;
    
    overlay.innerHTML = ""; 
    let qrContainer = document.createElement('div');
    qrContainer.style.cssText = "width: 80vw; height: 80vw; max-width: 400px; max-height: 400px; background-color: #ffffff; border-radius: 12px; padding: 15px; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative;";
    
    let canvas = document.createElement('canvas');
    canvas.style.cssText = "width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: contain; display: block;";
    
    let counterLabel = document.createElement('div');
    counterLabel.style.cssText = "position: absolute; bottom: 5px; right: 10px; font-size: 10px; color: #999; font-family: monospace;";
    
    qrContainer.appendChild(canvas);
    qrContainer.appendChild(counterLabel);
    overlay.appendChild(qrContainer);
    overlay.style.display = 'flex';

    let currentDrawIndex = 0;
    const drawNextQR = () => {
      let payload = `QRX:${currentDrawIndex + 1}/${totalChunks}:${chunks[currentDrawIndex]}`;
      
      QRCode.toCanvas(canvas, payload, {
        margin: 1,
        version: 5,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: 'L'
      }, function (error) {
        if (error) console.error("QR描画エラー:", error);
      });
      
      counterLabel.innerText = `${currentDrawIndex + 1} / ${totalChunks}`;
      currentDrawIndex = (currentDrawIndex + 1) % totalChunks;
    };

    drawNextQR();
    if (totalChunks > 1) {
      qrAnimationTimer = setInterval(drawNextQR, 150); 
    }
    
  } catch (e) {
    alert("初期設定データのQRコード生成に失敗しました。");
    console.error(e);
  }
}

function closeQROutputModal() {
  const overlay = document.getElementById('qr-direct-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.innerHTML = ''; 
    if (qrAnimationTimer) {
      clearInterval(qrAnimationTimer);
      qrAnimationTimer = null;
    }
  }
}