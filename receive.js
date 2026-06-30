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

      let tLCombined = data.tL !== undefined ? data.tL : ((data.tL1 === data.tL2 || !data.tL2) ? data.tL1 : `${data.tL1} / ${data.tL2}`);
      let tRCombined = data.tR !== undefined ? data.tR : ((data.tR1 === data.tR2 || !data.tR2) ? data.tR1 : `${data.tR1} / ${data.tR2}`);

      let teamLName = tLCombined ? tLCombined : (data.flowIsDouble ? `${data.nL1} & ${data.nL2}` : data.nL1);
      let teamRName = tRCombined ? tRCombined : (data.flowIsDouble ? `${data.nR1} & ${data.nR2}` : data.nR1);
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
    
    let isTeam = data.hasOwnProperty('flowIsTeamMatch') ? data.flowIsTeamMatch : false;
    let matchTypeStr = isTeam ? "団体戦" : "個人戦";
    let ruleStr = `${matchTypeStr} / ${typeStr} / ${gameStr} / ${ptStr} / ${setStr}`;
    
    let names = Array.isArray(data.n) ? data.n : [];
    let l1 = data.nL1 || names[0] || "PlayerA1";
    let l2 = isD ? (data.nL2 || names[1] || "PlayerA2") : "";
    let r1 = data.nR1 || names[2] || "PlayerB1";
    let r2 = isD ? (data.nR2 || names[3] || "PlayerB2") : "";
    
    let tL1Val = data.tL1 !== undefined ? data.tL1 : (data.tL || "");
    let tL2Val = data.tL2 !== undefined ? data.tL2 : (data.tL || "");
    let tR1Val = data.tR1 !== undefined ? data.tR1 : (data.tR || "");
    let tR2Val = data.tR2 !== undefined ? data.tR2 : (data.tR || "");

    let lTeam1 = tL1Val ? `[${tL1Val}] ` : "";
    let lTeam2 = tL2Val ? `[${tL2Val}] ` : "";
    let rTeam1 = tR1Val ? `[${tR1Val}] ` : "";
    let rTeam2 = tR2Val ? `[${tR2Val}] ` : "";
    
    let lPlayers = isD ? `${lTeam1}${l1} & ${lTeam2}${l2}` : `${lTeam1}${l1}`;
    let rPlayers = isD ? `${rTeam1}${r1} & ${rTeam2}${r2}` : `${rTeam1}${r1}`;
    
    let confirmMsg = `以下の試合データを受信しました。\nこの試合を開始（トス画面へ移動）しますか？\n\n` +
                     `【ルール】\n${ruleStr}\n\n` +
                     `【LEFT】\n${lPlayers}\n\n` +
                     `【RIGHT】\n${rPlayers}`;

    if (confirm(confirmMsg)) {
      flowIsDouble = isD;
      flowMaxGames = (data.flowMaxGames !== undefined) ? data.flowMaxGames : (data.g !== undefined ? data.g : 3);
      flowMaxPoints = (data.flowMaxPoints !== undefined) ? data.flowMaxPoints : (data.p !== undefined ? data.p : 15);
      flowHasSetting = hasSet;
      flowHasCourtSelect = (data.flowHasCourtSelect !== undefined) ? data.flowHasCourtSelect : (data.hc !== undefined ? data.hc : true);
      flowIsTeamMatch = isTeam;
      
      txtTL1 = tL1Val;
      txtTL2 = tL2Val;
      txtTR1 = tR1Val;
      txtTR2 = tR2Val;

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