// =========================================
// データ圧縮および分割QRコードの生成・送信処理 (qr-generator.js)
// =========================================

let qrAnimationTimer = null; 

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
    
    generateAndShowQRSequence(state, overlay);
    
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

    generateAndShowQRSequence(currentState, overlay);
    
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
    generateAndShowQRSequence(matchData, overlay);
  } catch (e) {
    alert("初期設定データのQRコード生成に失敗しました。");
    console.error(e);
  }
}

/**
 * 共通処理: データを圧縮し、分割QRを生成して画面に表示する
 */
function generateAndShowQRSequence(dataObject, overlay) {
  let jsonString = JSON.stringify(dataObject);
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
  
  // ★ ヘッダーとその中のボタンが絶対にタッチ判定を奪われないよう z-index と pointer-events を強化
  let headerBar = document.createElement('div');
  headerBar.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; padding: 15px 20px; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; z-index: 99999; pointer-events: none;";
  
  let calcBtn = document.createElement('button');
  calcBtn.style.cssText = "pointer-events: auto; position: relative; z-index: 100000; background: #1C1C1E; color: #E2E8F0; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.2s;";
  calcBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6-12h4v4h-4V4zm0 6h4v4h-4v-4zm0 6h4v4h-4v-4z"/></svg>`;
  headerBar.appendChild(calcBtn);
  
  let rightGroup = document.createElement('div');
  rightGroup.style.cssText = "display: flex; gap: 15px; pointer-events: none;";
  
  let zoomBtn = document.createElement('button');
  zoomBtn.style.cssText = "pointer-events: auto; position: relative; z-index: 100000; background: #1C1C1E; color: #E2E8F0; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.2s;";
  zoomBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>`;
  
  let closeBtn = document.createElement('button');
  closeBtn.style.cssText = "pointer-events: auto; position: relative; z-index: 100000; background: #1C1C1E; color: #A1A1AA; border: 1px solid #48484A; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);";
  closeBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
  closeBtn.onclick = function(e) {
    e.stopPropagation();
    closeQROutputModal();
  };
  
  rightGroup.appendChild(zoomBtn);
  rightGroup.appendChild(closeBtn);
  headerBar.appendChild(rightGroup);
  overlay.appendChild(headerBar);

  let contentWrapper = document.createElement('div');
  contentWrapper.style.cssText = "display: flex; flex-direction: column; align-items: center; margin-top: 50px;";

  let qrContainer = document.createElement('div');
  qrContainer.style.cssText = "width: 80vw; height: 80vw; max-width: 280px; max-height: 280px; background-color: #ffffff; border-radius: 12px; padding: 15px; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; position: relative; border: 10px solid #1C1C1E; transition: max-width 0.3s, max-height 0.3s;";
  
  let statusLabel = document.createElement('div');
  statusLabel.style.cssText = "position: absolute; top: -35px; left: 50%; transform: translateX(-50%); color: #E2E8F0; font-size: 24px; font-weight: bold; font-family: sans-serif; pointer-events: none; z-index: 10002;";

  let canvas = document.createElement('canvas');
  canvas.style.cssText = "width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: contain; display: block; pointer-events: none; transition: opacity 0.1s;";
  
  let counterLabel = document.createElement('div');
  counterLabel.style.cssText = "position: absolute; bottom: 5px; right: 10px; font-size: 10px; color: #999; font-family: monospace;";
  
  qrContainer.appendChild(canvas);
  qrContainer.appendChild(counterLabel);
  qrContainer.appendChild(statusLabel);
  contentWrapper.appendChild(qrContainer);
  
  overlay.appendChild(contentWrapper);

  let manualInputContainer = document.createElement('div');
  manualInputContainer.style.cssText = "display: none; flex-direction: column; align-items: center; gap: 10px; margin-top: 15px; width: 100%; max-width: 260px; z-index: 10001;";

  let inputBox = document.createElement('input');
  inputBox.type = "tel";
  inputBox.inputMode = "numeric";
  inputBox.pattern = "[0-9]*";
  inputBox.placeholder = "1 ~ " + totalChunks;
  inputBox.style.cssText = "width: 100%; height: 44px; background: #1C1C1E; color: #FFFFFF; border: 1px solid #48484A; border-radius: 8px; font-size: 20px; font-weight: bold; text-align: center; outline: none; box-sizing: border-box;";
  inputBox.onclick = function(e) { e.stopPropagation(); };
  
  let handleManualInput = function() {
    let val = parseInt(inputBox.value, 10);
    if (isNaN(val)) return;
    if (val < 1) val = 1;
    if (val > totalChunks) val = totalChunks;
    drawSpecificQR(val - 1);
    statusLabel.innerText = val; 
    inputBox.value = ""; 
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

  const keys = ['1','2','3','4','5','6','7','8','9','DEL','0','ENTER'];
  keys.forEach(function(key) {
    let btn = document.createElement('button');
    btn.innerText = key;
    
    if (key === 'ENTER') {
      btn.style.cssText = "height: 44px; background: #48484A; color: #E2E8F0; border: 1px solid #636366; border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;";
    } else if (key === 'DEL') {
      btn.style.cssText = "height: 44px; background: #2C2C2E; color: #E2E8F0; border: 1px solid #333333; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;";
    } else {
      btn.style.cssText = "height: 44px; background: #1C1C1E; color: #E2E8F0; border: 1px solid #333333; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;";
    }

    btn.onclick = function(e) {
      e.stopPropagation();
      if (key === 'DEL') {
        inputBox.value = ""; 
      } else if (key === 'ENTER') {
        handleManualInput();
      } else {
        inputBox.value += key;
      }
    };
    fixedNumpad.appendChild(btn);
  });
  manualInputContainer.appendChild(fixedNumpad);
  overlay.appendChild(manualInputContainer);

  let indices = Array.from({length: totalChunks}, function(_, i) { return i; });
  let shuffleArray = function(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  };

  let currentStep = 0;
  
  let drawSpecificQR = function(index) {
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

  let drawNextQR = function() {
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

    setTimeout(function() {
      drawNextQR();
      canvas.style.opacity = "1";
      if (totalChunks > 1 && !isPaused) {
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
      statusLabel.innerText = currentIndexDisplay; 
      inputBox.value = ""; 
    } else {
      manualInputContainer.style.display = 'none';
      statusLabel.innerText = ""; 
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