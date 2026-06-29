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
let qrAnimationTimer = null; 

let scannedChunks = [];
let totalChunksExpected = 0;

/**
 * 【入力側】QRスキャナーモーダルを開き、カメラを起動する
 */
function openQRScannerModal() {
  const overlay = document.getElementById('qr-scanner-overlay');
  const wrapper = document.getElementById('qr-reader-wrapper');
  const spinner = document.getElementById('qr-loading-spinner');
  const dotsContainer = document.getElementById('qr-progress-dots');
  const missingNumEl = document.getElementById('qr-missing-numbers');
  
  if (!overlay || !wrapper) return;
  
  scannedChunks = [];
  totalChunksExpected = 0;
  
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    dotsContainer.style.flexWrap = 'wrap'; 
  }
  
  if (missingNumEl) {
    missingNumEl.innerText = '';
  }
  
  wrapper.innerHTML = `<div id="qr-reader" style="width: 100%; min-height: 250px; background-color: #000; border: 1px solid #333; border-radius: 8px;"></div>`;
  wrapper.style.display = 'block';
  
  if (spinner) spinner.style.display = 'none';
  
  overlay.style.display = 'flex';

  if (typeof Html5Qrcode === 'undefined') {
    alert("QRコード読み取り機能が読み込まれていません。");
    return;
  }

  setTimeout(() => {
    if (overlay.style.display === 'none') return;

    if (html5QrCode) {
      try { html5QrCode.clear(); } catch(e) {}
      html5QrCode = null;
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

        if (missingNumEl) {
          let missingNumbers = [];
          for (let i = 0; i < totalChunksExpected; i++) {
            if (!scannedChunks[i]) {
              missingNumbers.push(i + 1);
            }
          }
          
          let missingText = "";
          if (missingNumbers.length > 0) {
            let tempStr = "";
            for (let i = 0; i < missingNumbers.length; i++) {
              let appendStr = (i === 0) ? String(missingNumbers[i]) : ", " + missingNumbers[i];
              if (tempStr.length + appendStr.length > 25) {
                tempStr += "...";
                break;
              }
              tempStr += appendStr;
            }
            missingText = tempStr;
          }
          missingNumEl.innerText = missingText; 
        }

        const collectedCount = scannedChunks.filter(Boolean).length;
        if (collectedCount === totalChunksExpected) {
          
          if (missingNumEl) missingNumEl.innerText = "";
          
          const stopCameraAndProcess = async () => {
            if (html5QrCode) {
              try {
                if (html5QrCode.isScanning) {
                  await html5QrCode.stop();
                }
                html5QrCode.clear();
              } catch(e) {
                console.warn("スキャン完了時のカメラ停止エラー", e);
              } finally { 
                html5QrCode = null; 
              }
            }
            
            wrapper.innerHTML = "";
            wrapper.style.display = 'none';
            
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
                if (spinner) spinner.style.display = 'none';

              } catch (e) {
                alert("QRコードの結合・解読に失敗しました。");
                console.error(e);
                if (spinner) spinner.style.display = 'none';
              }
            }, 50);
          };
          
          stopCameraAndProcess();
        }

      } catch (e) {
        console.warn("分割QRの処理中にエラー", e);
      }
    };

    const cameraConfig = { facingMode: "environment" };
    
    const config = { 
      fps: 15,
      aspectRatio: 1.0,
      qrbox: function(viewfinderWidth, viewfinderHeight) {
        let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        let size = Math.floor(minEdgeSize * 0.75);
        return { width: size, height: size };
      }
    };

    html5QrCode.start(cameraConfig, config, onScanSuccess)
      .catch(err => {
        alert("カメラの起動に失敗しました。ブラウザの許可を確認してください。");
        console.error(err);
        html5QrCode = null;
      });
      
  }, 300);
}

/**
 * キャンセル時：モーダルを閉じる際のカメラの完全破棄と「DOMの完全爆破」
 */
async function closeQRScannerModal() {
  const overlay = document.getElementById('qr-scanner-overlay');
  const wrapper = document.getElementById('qr-reader-wrapper');
  if (!overlay) return;
  
  overlay.style.display = 'none';
  
  if (html5QrCode) {
    try {
      if (html5QrCode.isScanning) {
        await html5QrCode.stop();
      }
      html5QrCode.clear();
    } catch (err) {
      console.warn("カメラ停止エラー", err);
    } finally {
      html5QrCode = null;
    }
  }
  
  if (wrapper) {
      wrapper.innerHTML = "";
      wrapper.style.display = 'none';
  }
  
  const spinner = document.getElementById('qr-loading-spinner');
  if (spinner) spinner.style.display = 'none';
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
    
    const chunkSize = 40; 
    let chunks = [];
    for (let i = 0; i < fullBase64String.length; i += chunkSize) {
      chunks.push(fullBase64String.substring(i, i + chunkSize));
    }
    
    const totalChunks = chunks.length;
    
    overlay.innerHTML = ""; 
    overlay.onclick = null; 
    
    let headerBar = document.createElement('div');
    headerBar.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; padding: 15px 20px; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; z-index: 10001;";
    
    let calcBtn = document.createElement('button');
    calcBtn.style.cssText = "background: #1C1C1E; color: #E2E8F0; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.2s;";
    calcBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6-12h4v4h-4V4zm0 6h4v4h-4v-4zm0 6h4v4h-4v-4z"/></svg>`;
    headerBar.appendChild(calcBtn);
    
    let rightGroup = document.createElement('div');
    rightGroup.style.cssText = "display: flex; gap: 15px;";
    
    let zoomBtn = document.createElement('button');
    zoomBtn.style.cssText = "background: #1C1C1E; color: #E2E8F0; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.2s;";
    zoomBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>`;
    
    let closeBtn = document.createElement('button');
    closeBtn.style.cssText = "background: #1C1C1E; color: #A1A1AA; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);";
    closeBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    closeBtn.onclick = function(e) {
      e.stopPropagation();
      closeQROutputModal();
    };
    
    rightGroup.appendChild(zoomBtn);
    rightGroup.appendChild(closeBtn);
    headerBar.appendChild(rightGroup);
    overlay.appendChild(headerBar);

    let qrContainer = document.createElement('div');
    qrContainer.style.cssText = "width: 80vw; height: 80vw; max-width: 280px; max-height: 280px; background-color: #ffffff; border-radius: 12px; padding: 15px; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative; border: 10px solid #1C1C1E; transition: max-width 0.3s, max-height 0.3s; margin-top: 50px;";
    
    let canvas = document.createElement('canvas');
    canvas.style.cssText = "width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: contain; display: block; pointer-events: none; transition: opacity 0.1s;";
    
    let counterLabel = document.createElement('div');
    counterLabel.style.cssText = "position: absolute; bottom: 5px; right: 10px; font-size: 10px; color: #999; font-family: monospace;";
    
    qrContainer.appendChild(canvas);
    qrContainer.appendChild(counterLabel);
    overlay.appendChild(qrContainer);

    // ★追加：テキストボックス＋12キー固定テンキーのコンテナ
    let manualInputContainer = document.createElement('div');
    manualInputContainer.style.cssText = "display: none; flex-direction: column; align-items: center; gap: 10px; margin-top: 15px; width: 100%; max-width: 260px; z-index: 10001;";

    let inputBox = document.createElement('input');
    inputBox.type = "tel";
    inputBox.inputMode = "numeric";
    inputBox.pattern = "[0-9]*";
    inputBox.placeholder = "1 ~ " + totalChunks;
    inputBox.style.cssText = "width: 100%; height: 44px; background: #1C1C1E; color: #FFFFFF; border: 1px solid #48484A; border-radius: 8px; font-size: 20px; font-weight: bold; text-align: center; outline: none; box-sizing: border-box;";
    inputBox.onclick = function(e) { e.stopPropagation(); };
    
    const handleManualInput = () => {
      let val = parseInt(inputBox.value, 10);
      if (isNaN(val)) return;
      if (val < 1) val = 1;
      if (val > totalChunks) val = totalChunks;
      inputBox.value = val;
      drawSpecificQR(val - 1);
    };

    inputBox.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleManualInput();
        inputBox.blur(); 
      }
    });

    manualInputContainer.appendChild(inputBox);

    let fixedNumpad = document.createElement('div');
    fixedNumpad.style.cssText = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%;";

    const keys = ['1','2','3','4','5','6','7','8','9','BS','0','GO'];
    keys.forEach(key => {
      let btn = document.createElement('button');
      btn.innerText = key === 'BS' ? '?' : key;
      btn.style.cssText = "height: 44px; background: #1C1C1E; color: #E2E8F0; border: 1px solid #333333; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;";
      
      if (key === 'GO') {
        btn.style.backgroundColor = "#10B981";
        btn.style.color = "#000000";
        btn.style.border = "none";
      } else if (key === 'BS') {
        btn.style.backgroundColor = "#2C2C2E";
        btn.style.fontSize = "16px";
      }

      btn.onclick = function(e) {
        e.stopPropagation();
        if (key === 'BS') {
          inputBox.value = inputBox.value.slice(0, -1);
        } else if (key === 'GO') {
          handleManualInput();
        } else {
          inputBox.value += key;
        }
      };
      fixedNumpad.appendChild(btn);
    });
    manualInputContainer.appendChild(fixedNumpad);
    overlay.appendChild(manualInputContainer);

    let indices = Array.from({length: totalChunks}, (_, i) => i);
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    let currentStep = 0;
    
    const drawSpecificQR = (index) => {
      let payload = `QRX:${index + 1}/${totalChunks}:${chunks[index]}`;
      QRCode.toCanvas(canvas, payload, {
        margin: 1,
        version: 4, 
        width: 800, 
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: 'L'
      }, function (error) {
        if (error) console.error("QR描画エラー:", error);
      });
      counterLabel.innerText = `${index + 1} / ${totalChunks}`;
    };

    const drawNextQR = () => {
      if (currentStep === 0) {
        shuffleArray(indices);
      }
      let chunkIndex = indices[currentStep];
      drawSpecificQR(chunkIndex);
      
      currentStep++;
      if (currentStep >= totalChunks) {
        currentStep = 0;
      }
    };

    let isPaused = false;
    let isExpanded = false;
    let isAnimating = false;

    zoomBtn.onclick = function(e) {
      e.stopPropagation();
      if (isAnimating) return;
      if (isPaused) return; 
      
      isAnimating = true;
      isExpanded = !isExpanded;
      
      clearInterval(qrAnimationTimer);
      canvas.style.opacity = "0";

      if (isExpanded) {
        qrContainer.style.maxWidth = "80vh";
        qrContainer.style.maxHeight = "80vh";
        zoomBtn.style.color = "#10B981";
        zoomBtn.style.borderColor = "#10B981";
      } else {
        qrContainer.style.maxWidth = "280px";
        qrContainer.style.maxHeight = "280px";
        zoomBtn.style.color = "#E2E8F0";
        zoomBtn.style.borderColor = "#48484A";
      }

      setTimeout(() => {
        drawNextQR();
        canvas.style.opacity = "1";
        if (totalChunks > 1) {
          qrAnimationTimer = setInterval(drawNextQR, 100);
        }
        isAnimating = false;
      }, 300);
    };

    // ★修正：計算機ボタンクリックでテキスト＆固定テンキーを表示
    calcBtn.onclick = function(e) {
      e.stopPropagation();
      if (totalChunks <= 1) return;
      isPaused = !isPaused;
      if (isPaused) {
        clearInterval(qrAnimationTimer);
        manualInputContainer.style.display = 'flex';
        qrContainer.style.maxWidth = "280px";
        qrContainer.style.maxHeight = "280px";
        isExpanded = false;
        zoomBtn.style.color = "#E2E8F0";
        zoomBtn.style.borderColor = "#48484A";
        
        calcBtn.style.color = "#10B981";
        calcBtn.style.borderColor = "#10B981";
        
        // 現在表示されている番号をインプットにセット
        let currentIndexDisplay = parseInt(counterLabel.innerText.split(' / ')[0]);
        inputBox.value = currentIndexDisplay;
      } else {
        manualInputContainer.style.display = 'none';
        qrAnimationTimer = setInterval(drawNextQR, 100);
        calcBtn.style.color = "#E2E8F0";
        calcBtn.style.borderColor = "#48484A";
      }
    };

    overlay.style.display = 'flex';
    drawNextQR();
    if (totalChunks > 1) {
      qrAnimationTimer = setInterval(drawNextQR, 100); 
    }
    
  } catch (e) {
    alert("データの圧縮またはQRコードの生成に失敗しました。");
    console.error(e);
  }
}

/**
 * 【出力側】得点板から「今の試合状態」を直接QR化して表示する
 */
function openCurrentMatchQRModal() {
  const overlay = document.getElementById('qr-direct-overlay');
  if (!overlay) return;
  
  if (qrAnimationTimer) {
    clearInterval(qrAnimationTimer);
    qrAnimationTimer = null;
  }
  
  try {
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
    
    const chunkSize = 40; 
    let chunks = [];
    for (let i = 0; i < fullBase64String.length; i += chunkSize) {
      chunks.push(fullBase64String.substring(i, i + chunkSize));
    }
    
    const totalChunks = chunks.length;
    
    overlay.innerHTML = ""; 
    overlay.onclick = null; 
    
    let headerBar = document.createElement('div');
    headerBar.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; padding: 15px 20px; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; z-index: 10001;";
    
    let calcBtn = document.createElement('button');
    calcBtn.style.cssText = "background: #1C1C1E; color: #E2E8F0; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.2s;";
    calcBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6-12h4v4h-4V4zm0 6h4v4h-4v-4zm0 6h4v4h-4v-4z"/></svg>`;
    headerBar.appendChild(calcBtn);
    
    let rightGroup = document.createElement('div');
    rightGroup.style.cssText = "display: flex; gap: 15px;";
    
    let zoomBtn = document.createElement('button');
    zoomBtn.style.cssText = "background: #1C1C1E; color: #E2E8F0; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.2s;";
    zoomBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>`;
    
    let closeBtn = document.createElement('button');
    closeBtn.style.cssText = "background: #1C1C1E; color: #A1A1AA; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);";
    closeBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    closeBtn.onclick = function(e) {
      e.stopPropagation();
      closeQROutputModal();
    };
    
    rightGroup.appendChild(zoomBtn);
    rightGroup.appendChild(closeBtn);
    headerBar.appendChild(rightGroup);
    overlay.appendChild(headerBar);

    let qrContainer = document.createElement('div');
    qrContainer.style.cssText = "width: 80vw; height: 80vw; max-width: 280px; max-height: 280px; background-color: #ffffff; border-radius: 12px; padding: 15px; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative; border: 10px solid #1C1C1E; transition: max-width 0.3s, max-height 0.3s; margin-top: 50px;";
    
    let canvas = document.createElement('canvas');
    canvas.style.cssText = "width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: contain; display: block; pointer-events: none; transition: opacity 0.1s;";
    
    let counterLabel = document.createElement('div');
    counterLabel.style.cssText = "position: absolute; bottom: 5px; right: 10px; font-size: 10px; color: #999; font-family: monospace;";
    
    qrContainer.appendChild(canvas);
    qrContainer.appendChild(counterLabel);
    overlay.appendChild(qrContainer);

    let manualInputContainer = document.createElement('div');
    manualInputContainer.style.cssText = "display: none; flex-direction: column; align-items: center; gap: 10px; margin-top: 15px; width: 100%; max-width: 260px; z-index: 10001;";

    let inputBox = document.createElement('input');
    inputBox.type = "tel";
    inputBox.inputMode = "numeric";
    inputBox.pattern = "[0-9]*";
    inputBox.placeholder = "1 ~ " + totalChunks;
    inputBox.style.cssText = "width: 100%; height: 44px; background: #1C1C1E; color: #FFFFFF; border: 1px solid #48484A; border-radius: 8px; font-size: 20px; font-weight: bold; text-align: center; outline: none; box-sizing: border-box;";
    inputBox.onclick = function(e) { e.stopPropagation(); };
    
    const handleManualInput = () => {
      let val = parseInt(inputBox.value, 10);
      if (isNaN(val)) return;
      if (val < 1) val = 1;
      if (val > totalChunks) val = totalChunks;
      inputBox.value = val;
      drawSpecificQR(val - 1);
    };

    inputBox.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleManualInput();
        inputBox.blur(); 
      }
    });

    manualInputContainer.appendChild(inputBox);

    let fixedNumpad = document.createElement('div');
    fixedNumpad.style.cssText = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%;";

    const keys = ['1','2','3','4','5','6','7','8','9','BS','0','GO'];
    keys.forEach(key => {
      let btn = document.createElement('button');
      btn.innerText = key === 'BS' ? '?' : key;
      btn.style.cssText = "height: 44px; background: #1C1C1E; color: #E2E8F0; border: 1px solid #333333; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;";
      
      if (key === 'GO') {
        btn.style.backgroundColor = "#10B981";
        btn.style.color = "#000000";
        btn.style.border = "none";
      } else if (key === 'BS') {
        btn.style.backgroundColor = "#2C2C2E";
        btn.style.fontSize = "16px";
      }

      btn.onclick = function(e) {
        e.stopPropagation();
        if (key === 'BS') {
          inputBox.value = inputBox.value.slice(0, -1);
        } else if (key === 'GO') {
          handleManualInput();
        } else {
          inputBox.value += key;
        }
      };
      fixedNumpad.appendChild(btn);
    });
    manualInputContainer.appendChild(fixedNumpad);
    overlay.appendChild(manualInputContainer);

    let indices = Array.from({length: totalChunks}, (_, i) => i);
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    let currentStep = 0;
    
    const drawSpecificQR = (index) => {
      let payload = `QRX:${index + 1}/${totalChunks}:${chunks[index]}`;
      QRCode.toCanvas(canvas, payload, {
        margin: 1,
        version: 4, 
        width: 800, 
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: 'L'
      }, function (error) {
        if (error) console.error("QR描画エラー:", error);
      });
      counterLabel.innerText = `${index + 1} / ${totalChunks}`;
    };

    const drawNextQR = () => {
      if (currentStep === 0) {
        shuffleArray(indices);
      }
      let chunkIndex = indices[currentStep];
      drawSpecificQR(chunkIndex);
      
      currentStep++;
      if (currentStep >= totalChunks) {
        currentStep = 0;
      }
    };

    let isPaused = false;
    let isExpanded = false;
    let isAnimating = false;

    zoomBtn.onclick = function(e) {
      e.stopPropagation();
      if (isAnimating) return;
      if (isPaused) return; 
      
      isAnimating = true;
      isExpanded = !isExpanded;
      
      clearInterval(qrAnimationTimer);
      canvas.style.opacity = "0";

      if (isExpanded) {
        qrContainer.style.maxWidth = "80vh";
        qrContainer.style.maxHeight = "80vh";
        zoomBtn.style.color = "#10B981";
        zoomBtn.style.borderColor = "#10B981";
      } else {
        qrContainer.style.maxWidth = "280px";
        qrContainer.style.maxHeight = "280px";
        zoomBtn.style.color = "#E2E8F0";
        zoomBtn.style.borderColor = "#48484A";
      }

      setTimeout(() => {
        drawNextQR();
        canvas.style.opacity = "1";
        if (totalChunks > 1) {
          qrAnimationTimer = setInterval(drawNextQR, 100);
        }
        isAnimating = false;
      }, 300);
    };

    calcBtn.onclick = function(e) {
      e.stopPropagation();
      if (totalChunks <= 1) return;
      isPaused = !isPaused;
      if (isPaused) {
        clearInterval(qrAnimationTimer);
        manualInputContainer.style.display = 'flex';
        qrContainer.style.maxWidth = "280px";
        qrContainer.style.maxHeight = "280px";
        isExpanded = false;
        zoomBtn.style.color = "#E2E8F0";
        zoomBtn.style.borderColor = "#48484A";
        
        calcBtn.style.color = "#10B981";
        calcBtn.style.borderColor = "#10B981";
        
        let currentIndexDisplay = parseInt(counterLabel.innerText.split(' / ')[0]);
        inputBox.value = currentIndexDisplay;
      } else {
        manualInputContainer.style.display = 'none';
        qrAnimationTimer = setInterval(drawNextQR, 100);
        calcBtn.style.color = "#E2E8F0";
        calcBtn.style.borderColor = "#48484A";
      }
    };

    overlay.style.display = 'flex';
    drawNextQR();
    if (totalChunks > 1) {
      qrAnimationTimer = setInterval(drawNextQR, 100); 
    }
    
  } catch (e) {
    alert("現在の試合状況のQRコード生成に失敗しました。");
    console.error(e);
  }
}

/**
 * 【出力側】本部からの初期データを送信するためのQR表示
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
    
    const chunkSize = 40; 
    let chunks = [];
    for (let i = 0; i < fullBase64String.length; i += chunkSize) {
      chunks.push(fullBase64String.substring(i, i + chunkSize));
    }
    
    const totalChunks = chunks.length;
    
    overlay.innerHTML = ""; 
    overlay.onclick = null; 
    
    let headerBar = document.createElement('div');
    headerBar.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; padding: 15px 20px; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; z-index: 10001;";
    
    let calcBtn = document.createElement('button');
    calcBtn.style.cssText = "background: #1C1C1E; color: #E2E8F0; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.2s;";
    calcBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6-12h4v4h-4V4zm0 6h4v4h-4v-4zm0 6h4v4h-4v-4z"/></svg>`;
    headerBar.appendChild(calcBtn);
    
    let rightGroup = document.createElement('div');
    rightGroup.style.cssText = "display: flex; gap: 15px;";
    
    let zoomBtn = document.createElement('button');
    zoomBtn.style.cssText = "background: #1C1C1E; color: #E2E8F0; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.2s;";
    zoomBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>`;
    
    let closeBtn = document.createElement('button');
    closeBtn.style.cssText = "background: #1C1C1E; color: #A1A1AA; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);";
    closeBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    closeBtn.onclick = function(e) {
      e.stopPropagation();
      closeQROutputModal();
    };
    
    rightGroup.appendChild(zoomBtn);
    rightGroup.appendChild(closeBtn);
    headerBar.appendChild(rightGroup);
    overlay.appendChild(headerBar);

    let qrContainer = document.createElement('div');
    qrContainer.style.cssText = "width: 80vw; height: 80vw; max-width: 280px; max-height: 280px; background-color: #ffffff; border-radius: 12px; padding: 15px; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative; border: 10px solid #1C1C1E; transition: max-width 0.3s, max-height 0.3s; margin-top: 50px;";
    
    let canvas = document.createElement('canvas');
    canvas.style.cssText = "width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: contain; display: block; pointer-events: none; transition: opacity 0.1s;";
    
    let counterLabel = document.createElement('div');
    counterLabel.style.cssText = "position: absolute; bottom: 5px; right: 10px; font-size: 10px; color: #999; font-family: monospace;";
    
    qrContainer.appendChild(canvas);
    qrContainer.appendChild(counterLabel);
    overlay.appendChild(qrContainer);

    let manualInputContainer = document.createElement('div');
    manualInputContainer.style.cssText = "display: none; flex-direction: column; align-items: center; gap: 10px; margin-top: 15px; width: 100%; max-width: 260px; z-index: 10001;";

    let inputBox = document.createElement('input');
    inputBox.type = "tel";
    inputBox.inputMode = "numeric";
    inputBox.pattern = "[0-9]*";
    inputBox.placeholder = "1 ~ " + totalChunks;
    inputBox.style.cssText = "width: 100%; height: 44px; background: #1C1C1E; color: #FFFFFF; border: 1px solid #48484A; border-radius: 8px; font-size: 20px; font-weight: bold; text-align: center; outline: none; box-sizing: border-box;";
    inputBox.onclick = function(e) { e.stopPropagation(); };
    
    const handleManualInput = () => {
      let val = parseInt(inputBox.value, 10);
      if (isNaN(val)) return;
      if (val < 1) val = 1;
      if (val > totalChunks) val = totalChunks;
      inputBox.value = val;
      drawSpecificQR(val - 1);
    };

    inputBox.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleManualInput();
        inputBox.blur(); 
      }
    });

    manualInputContainer.appendChild(inputBox);

    let fixedNumpad = document.createElement('div');
    fixedNumpad.style.cssText = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%;";

    const keys = ['1','2','3','4','5','6','7','8','9','BS','0','GO'];
    keys.forEach(key => {
      let btn = document.createElement('button');
      btn.innerText = key === 'BS' ? '?' : key;
      btn.style.cssText = "height: 44px; background: #1C1C1E; color: #E2E8F0; border: 1px solid #333333; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;";
      
      if (key === 'GO') {
        btn.style.backgroundColor = "#10B981";
        btn.style.color = "#000000";
        btn.style.border = "none";
      } else if (key === 'BS') {
        btn.style.backgroundColor = "#2C2C2E";
        btn.style.fontSize = "16px";
      }

      btn.onclick = function(e) {
        e.stopPropagation();
        if (key === 'BS') {
          inputBox.value = inputBox.value.slice(0, -1);
        } else if (key === 'GO') {
          handleManualInput();
        } else {
          inputBox.value += key;
        }
      };
      fixedNumpad.appendChild(btn);
    });
    manualInputContainer.appendChild(fixedNumpad);
    overlay.appendChild(manualInputContainer);

    let indices = Array.from({length: totalChunks}, (_, i) => i);
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    let currentStep = 0;
    
    const drawSpecificQR = (index) => {
      let payload = `QRX:${index + 1}/${totalChunks}:${chunks[index]}`;
      QRCode.toCanvas(canvas, payload, {
        margin: 1,
        version: 4, 
        width: 800,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: 'L'
      }, function (error) {
        if (error) console.error("QR描画エラー:", error);
      });
      counterLabel.innerText = `${index + 1} / ${totalChunks}`;
    };

    const drawNextQR = () => {
      if (currentStep === 0) {
        shuffleArray(indices);
      }
      let chunkIndex = indices[currentStep];
      drawSpecificQR(chunkIndex);
      
      currentStep++;
      if (currentStep >= totalChunks) {
        currentStep = 0;
      }
    };

    let isPaused = false;
    let isExpanded = false;
    let isAnimating = false;

    zoomBtn.onclick = function(e) {
      e.stopPropagation();
      if (isAnimating) return;
      if (isPaused) return; 
      
      isAnimating = true;
      isExpanded = !isExpanded;
      
      clearInterval(qrAnimationTimer);
      canvas.style.opacity = "0";

      if (isExpanded) {
        qrContainer.style.maxWidth = "80vh";
        qrContainer.style.maxHeight = "80vh";
        zoomBtn.style.color = "#10B981";
        zoomBtn.style.borderColor = "#10B981";
      } else {
        qrContainer.style.maxWidth = "280px";
        qrContainer.style.maxHeight = "280px";
        zoomBtn.style.color = "#E2E8F0";
        zoomBtn.style.borderColor = "#48484A";
      }

      setTimeout(() => {
        drawNextQR();
        canvas.style.opacity = "1";
        if (totalChunks > 1) {
          qrAnimationTimer = setInterval(drawNextQR, 100);
        }
        isAnimating = false;
      }, 300);
    };

    calcBtn.onclick = function(e) {
      e.stopPropagation();
      if (totalChunks <= 1) return;
      isPaused = !isPaused;
      if (isPaused) {
        clearInterval(qrAnimationTimer);
        manualInputContainer.style.display = 'flex';
        qrContainer.style.maxWidth = "280px";
        qrContainer.style.maxHeight = "280px";
        isExpanded = false;
        zoomBtn.style.color = "#E2E8F0";
        zoomBtn.style.borderColor = "#48484A";
        
        calcBtn.style.color = "#10B981";
        calcBtn.style.borderColor = "#10B981";
        
        let currentIndexDisplay = parseInt(counterLabel.innerText.split(' / ')[0]);
        inputBox.value = currentIndexDisplay;
      } else {
        manualInputContainer.style.display = 'none';
        qrAnimationTimer = setInterval(drawNextQR, 100);
        calcBtn.style.color = "#E2E8F0";
        calcBtn.style.borderColor = "#48484A";
      }
    };

    overlay.style.display = 'flex';
    drawNextQR();
    if (totalChunks > 1) {
      qrAnimationTimer = setInterval(drawNextQR, 100); 
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