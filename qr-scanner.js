// =========================================
// カメラによるQRコードスキャン・受信処理 (qr-scanner.js)
// =========================================

let html5QrCode = null;

let scannedChunks = [];
let totalChunksExpected = 0;

function openQRScannerModal() {
  const overlay = document.getElementById('qr-scanner-overlay');
  const wrapper = document.getElementById('qr-reader-wrapper');
  const spinner = document.getElementById('qr-loading-spinner');
  const dotsContainer = document.getElementById('qr-progress-dots');
  
  if (!overlay || !wrapper) return;
  
  scannedChunks = [];
  totalChunksExpected = 0;
  
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    dotsContainer.style.flexWrap = 'wrap'; 
  }
  
  wrapper.innerHTML = `<div id="qr-reader" style="width: 100%; min-height: 250px; background-color: #000; border: 1px solid #333; border-radius: 8px;"></div>`;
  wrapper.style.display = 'block';
  
  let missingNumEl = document.getElementById('qr-missing-numbers-dynamic');
  if (!missingNumEl) {
      missingNumEl = document.createElement('div');
      missingNumEl.id = 'qr-missing-numbers-dynamic';
      missingNumEl.style.cssText = "color: rgba(255, 255, 255, 0.3); font-size: 15px; font-weight: bold; text-align: center; margin-bottom: 10px; min-height: 18px; letter-spacing: 1px;";
      wrapper.parentNode.insertBefore(missingNumEl, wrapper);
  }
  missingNumEl.innerText = '';
  
  if (spinner) spinner.style.display = 'none';
  
  overlay.style.display = 'flex';

  if (typeof Html5Qrcode === 'undefined') {
    alert("QRコード読み取り機能が読み込まれていません。");
    return;
  }

  setTimeout(function() {
    if (overlay.style.display === 'none') return;

    if (html5QrCode) {
      try { html5QrCode.clear(); } catch(e) {}
      html5QrCode = null;
    }

    html5QrCode = new Html5Qrcode("qr-reader");

    let onScanSuccess = async function(decodedText, decodedResult) {
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
            dotsContainer.innerHTML = Array.from({length: total}, function(_, i) {
              return `<div id="qr-dot-${i}" style="width: 8px; height: 8px; border-radius: 50%; background-color: rgba(255,255,255,0.15); flex-shrink: 0;"></div>`;
            }).join('');
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
          
          let stopCameraAndProcess = async function() {
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

            setTimeout(function() {
              try {
                let fullBase64 = scannedChunks.join('');
                let binaryString = atob(fullBase64);
                let charArray = binaryString.split('').map(function(c) { return c.charCodeAt(0); });
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
      .catch(function(err) {
        alert("カメラの起動に失敗しました。ブラウザの許可を確認してください。");
        console.error(err);
        html5QrCode = null;
      });
      
  }, 300);
}

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
  
  const missingNumEl = document.getElementById('qr-missing-numbers-dynamic');
  if (missingNumEl) {
      missingNumEl.remove();
  }
  
  const spinner = document.getElementById('qr-loading-spinner');
  if (spinner) spinner.style.display = 'none';
}