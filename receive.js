// =========================================
// QRスキャンデータの受け取りと自動ワープ処理 (receive.js)
// =========================================

function checkScannedQRDataOnLoad() {
  let scannedDataString = sessionStorage.getItem('call_qr_scanned_data');
  if (scannedDataString) {
    try {
      let binaryString = atob(scannedDataString);
      let charArray = binaryString.split('').map(c => c.charCodeAt(0));
      let uint8Array = new Uint8Array(charArray);
      let decompressedUint8 = pako.inflate(uint8Array);
      let decompressedText = new TextDecoder().decode(decompressedUint8);
      let matchData = JSON.parse(decompressedText);

      sessionStorage.removeItem('call_qr_scanned_data');

      let isMatchInProgress = (matchData.sL > 0 || matchData.sR > 0 || matchData.gL > 0 || matchData.gR > 0);

      if (isMatchInProgress) {
        if (typeof resumeMatchFromState === 'function') {
          setTimeout(() => { resumeMatchFromState(matchData); }, 100);
        }
      } else {
        setTimeout(() => { processScannedData(matchData); }, 100);
      }

    } catch (e) {
      console.error("QRデータの復元に失敗しました", e);
      sessionStorage.removeItem('call_qr_scanned_data');
    }
  }
}
checkScannedQRDataOnLoad();

function processScannedData(data) {
  if (!data || typeof data !== 'object') {
    alert("無効なデータ形式です。");
    return;
  }

  if (data.isOver) {
    try {
      let historyList = [];
      let saved = localStorage.getItem('call_match_history');
      if (saved) historyList = JSON.parse(saved);

      let now = new Date();
      let dateStr = now.getFullYear() + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + ('0' + now.getDate()).slice(-2) + ' ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);

      let teamLName = data.tL ? data.tL : (data.flowIsDouble ? `${data.nL1} & ${data.nL2}` : data.nL1);
      let teamRName = data.tR ? data.tR : (data.flowIsDouble ? `${data.nR1} & ${data.nR2}` : data.nR1);
      let matchTitle = `${teamLName} vs ${teamRName}`;

      let matchScoreStr = `${data.gL} - ${data.gR}`;
      let gameDetails = (data.matchScoreHistory || []).map(g => `${g.a}-${g.b}`).join(', ');

      let newItem = {
        id: now.getTime().toString(),
        date: dateStr,
        title: matchTitle,
        status: "FINISHED",
        score: matchScoreStr,
        details: gameDetails,
        state: data 
      };

      historyList.unshift(newItem);
      localStorage.setItem('call_match_history', JSON.stringify(historyList));
      
      alert("終了済みの試合データを受信し、履歴（MATCH HISTORY）に追加しました。");
      
      if (typeof renderHistoryList === 'function') {
        renderHistoryList();
      }
      return; 

    } catch (e) {
      alert("履歴への保存に失敗しました。");
      console.error(e);
      return;
    }
  }

  let isInterruptedMatch = false;
  if (data.recorderData && Array.isArray(data.recorderData.timeline) && data.recorderData.timeline.length > 0) {
    isInterruptedMatch = true;
  }

  if (isInterruptedMatch) {
    if (typeof resumeMatchFromState === 'function') {
      resumeMatchFromState(data);
    }
  } else {
    let isD = (data.flowIsDouble !== undefined) ? data.flowIsDouble : (data.d !== undefined ? data.d : true);
    
    let typeStr = isD ? "ダブルス" : "シングルス";
    let gameStr = (data.flowMaxGames !== undefined) ? `${data.flowMaxGames}G` : (data.g !== undefined ? `${data.g}G` : "3G");
    let ptStr = (data.flowMaxPoints !== undefined) ? `${data.flowMaxPoints}pt` : (data.p !== undefined ? `${data.p}pt` : "15pt");
    
    let hasSet = (data.flowHasSetting !== undefined) ? data.flowHasSetting : (data.s !== undefined ? data.s : true);
    let rawPt = parseInt(ptStr.replace("pt", ""));
    let limitPt = (rawPt === 21) ? 30 : ((rawPt === 15) ? 21 : 15);
    let setStr = hasSet ? `デュースあり(${limitPt})` : "デュースなし";
    
    let ruleStr = `${typeStr} / ${gameStr} / ${ptStr} / ${setStr}`;
    
    let names = Array.isArray(data.n) ? data.n : [];
    let l1 = data.nL1 || names[0] || "PlayerA1";
    let l2 = isD ? (data.nL2 || names[1] || "PlayerA2") : "";
    let r1 = data.nR1 || names[2] || "PlayerB1";
    let r2 = isD ? (data.nR2 || names[3] || "PlayerB2") : "";
    
    let lTeam = data.tL ? `[${data.tL}] ` : "";
    let rTeam = data.tR ? `[${data.tR}] ` : "";
    
    let lPlayers = isD ? `${l1} & ${l2}` : l1;
    let rPlayers = isD ? `${r1} & ${r2}` : r1;
    
    let confirmMsg = `以下の試合データを受信しました。\nこの試合を開始（トス画面へ移動）しますか？\n\n` +
                     `【ルール】\n${ruleStr}\n\n` +
                     `【LEFT】\n${lTeam}${lPlayers}\n\n` +
                     `【RIGHT】\n${rTeam}${rPlayers}`;

    if (confirm(confirmMsg)) {
      flowIsDouble = isD;
      flowMaxGames = (data.flowMaxGames !== undefined) ? data.flowMaxGames : (data.g !== undefined ? data.g : 3);
      flowMaxPoints = (data.flowMaxPoints !== undefined) ? data.flowMaxPoints : (data.p !== undefined ? data.p : 15);
      flowHasSetting = hasSet;
      flowHasCourtSelect = (data.flowHasCourtSelect !== undefined) ? data.flowHasCourtSelect : (data.hc !== undefined ? data.hc : true);
      
      txtTL = data.tL || "";
      txtTR = data.tR || "";
      txtPL1 = data.nL1 || names[0] || "";
      txtPL2 = isD ? (data.nL2 || names[1] || "") : "";
      txtPR1 = data.nR1 || names[2] || "";
      txtPR2 = isD ? (data.nR2 || names[3] || "") : "";

      if (flowHasCourtSelect) {
        flowStep = 3;
      } else {
        flowStep = 1; 
      }
      if (typeof renderFlow === 'function') renderFlow();
    } else {
      if (typeof renderFlow === 'function') renderFlow();
    }
  }
}