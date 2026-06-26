// =========================================
// 画面描画・UI更新処理 (ui.js)
// =========================================

/**
 * アプリ起動時の初期化処理
 */
window.onload = function() {
  // 画面の初期描画
  if (typeof renderFlow === 'function') renderFlow();
  
  // ROSTERのEnterキー登録ショートカット（要素が存在する場合のみ安全に登録してフリーズを防止）
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

  // 選手/チーム選択モーダルのCANCELボタンを大型化（DOMの書き換え）
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
  // SR選択中であっても、背景のスコアとボタンは常に最新に同期する
  let titleLText = getBoardSideName(true);
  let titleRText = getBoardSideName(false);
  
  // チーム名が15文字以上の長文の場合は文字縮小クラスを付与
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

  // Undo / Redo ボタンの活性化状態の切り替え
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

  // GAME PREPARATION画面などが開いている間は、裏側のトップボタン群を安全に隠す
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

  // 主審カンペの更新（call.jsの関数を呼び出す）
  if (typeof syncVolumeCallカンペ === 'function') {
    syncVolumeCallカンペ();
  }

  if (isSelectingRoles) return;

  // セッティングありの時のみ、デュース（発光エフェクト）を許可
  let deuceCheck = flowHasSetting ? (sL >= flowMaxPoints - 1 && sR >= flowMaxPoints - 1 && Math.abs(sL - sR) <= 1) : false;
  if (deuceCheck) {
    document.getElementById("score-val-L").classList.add("deuce");
    document.getElementById("score-val-R").classList.add("deuce");
  } else {
    document.getElementById("score-val-L").classList.remove("deuce");
    document.getElementById("score-val-R").classList.remove("deuce");
  }

  // 取得ゲーム数の丸（ドット）の描画
  let winTarget = Math.floor((flowMaxGames + 1) / 2);
  let dotsL = document.getElementById("game-dots-L");
  let dotsR = document.getElementById("game-dots-R");
  if (dotsL) dotsL.innerHTML = Array.from({length: winTarget}, (_, i) => `<div class="game-dot" style="background-color: ${i < gL ? '#FFFFFF' : 'rgba(255,255,255,0.12)'}"></div>`).join('');
  if (dotsR) dotsR.innerHTML = Array.from({length: winTarget}, (_, i) => `<div class="game-dot" style="background-color: ${i < gR ? '#FFFFFF' : 'rgba(255,255,255,0.12)'}"></div>`).join('');

  // サーバー・レシーバーの枠（タグ）の描画
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
// QRスキャナー・出力モーダル開閉と圧縮/解凍ロジック（フェーズ4）
// =========================================

// グローバルにカメラインスタンスを保持
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

  if (html5QrCode) {
    try { html5QrCode.stop(); } catch(e) {}
    html5QrCode = null;
  }

  html5QrCode = new Html5Qrcode("qr-reader");

  const onScanSuccess = (decodedText, decodedResult) => {
    if (html5QrCode) {
      html5QrCode.stop().then(() => {
        html5QrCode = null;
      }).catch(err => console.log("カメラ停止エラー", err));
    }

    try {
      // 1. Base64文字列をバイナリ（Uint8Array）に変換
      let binaryString = atob(decodedText);
      let charArray = binaryString.split('').map(c => c.charCodeAt(0));
      let uint8Array = new Uint8Array(charArray);

      // 2. Pakoで解凍
      let decompressedUint8 = pako.inflate(uint8Array);
      
      // 3. Uint8Arrayから文字列(UTF-8)に戻す（TextDecoderを使用）
      let decompressedText = new TextDecoder().decode(decompressedUint8);
      
      // 4. JSONとしてパース
      let matchData = JSON.parse(decompressedText);
      
      // 5. ワープ処理へ
      if (typeof resumeMatchFromState === 'function') {
        resumeMatchFromState(matchData);
      } else {
        alert("復元・ワープ用の関数が見つかりません。");
      }
      
    } catch (e) {
      alert("QRコードの解読に失敗しました。データが大きすぎるか、形式が間違っています。");
      console.error(e);
    }

    overlay.style.display = 'none';
  };

  const config = { fps: 10, qrbox: { width: 250, height: 250 } };

  html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
    .catch(err => {
      alert("カメラの起動に失敗しました。ブラウザのカメラアクセス許可を確認してください。");
      console.error(err);
    });
}

/**
 * 【入力側】QRスキャナーモーダルを閉じる（キャンセル時）
 */
function closeQRScannerModal() {
  const overlay = document.getElementById('qr-scanner-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    if (html5QrCode) {
      html5QrCode.stop().then(() => {
        html5QrCode = null;
      }).catch(err => console.log("カメラ停止エラー", err));
    }
  }
}

/**
 * 【出力側】QR表示モーダルを開き、データを圧縮してQRコードを描画する
 * 引数 index: MATCH HISTORY の配列インデックス
 */
function openQROutputModal(index) {
  const overlay = document.getElementById('qr-output-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  
  try {
    let historyList = getHistoryList();
    let matchItem = historyList[index];
    if (!matchItem) throw new Error("指定された試合データが見つかりません。");
    
    // ディープコピーして元の履歴データを壊さないようにする
    let state = JSON.parse(JSON.stringify(matchItem.state || matchItem));
    
    // ★大容量化の原因であるUndo履歴（histとredoStack）を空にしてデータを軽量化
    state.hist = [];
    state.redoStack = [];
    
    // 1. 状態オブジェクトをJSON文字列化
    let jsonString = JSON.stringify(state);
    
    // 2. TextEncoderでUTF-8のバイナリ（Uint8Array）に変換（日本語文字化け防止）
    let uint8Array = new TextEncoder().encode(jsonString);
    
    // 3. Pako で超圧縮（deflate）
    let compressedArray = pako.deflate(uint8Array);
    
    // 4. 圧縮されたバイナリをBase64文字列に変換
    let binaryString = "";
    for (let i = 0; i < compressedArray.length; i++) {
        binaryString += String.fromCharCode(compressedArray[i]);
    }
    let base64String = btoa(binaryString);
    
    // 5. 空枠の中身をリセットして描画
    const qrArea = document.getElementById('qr-output-area');
    qrArea.innerHTML = ""; // 古いQRを消す
    
    // ★修正：プロジェクトに導入されている qrcode.min.js の正しい命令文に変更
    let canvas = document.createElement('canvas');
    qrArea.appendChild(canvas);
    
    QRCode.toCanvas(canvas, base64String, {
      width: 200,
      margin: 2,
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
    
  } catch (e) {
    alert("データの圧縮またはQRコードの生成に失敗しました。");
    console.error(e);
  }
}

/**
 * 【出力側】QR表示モーダルを閉じる
 */
function closeQROutputModal() {
  const overlay = document.getElementById('qr-output-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    
    // モーダルが閉じた後、次に備えて描画されたQRコードを消去・リセットする
    const qrArea = document.getElementById('qr-output-area');
    if (qrArea) qrArea.innerHTML = '<span style="color: #999; font-size: 12px;">(QR Code Space)</span>';
  }
}