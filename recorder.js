// =========================================
// 公式記録員 (recorder.js)
// 試合の絶対座標を管理し、PDF用の公式記録をつける
// =========================================

const Recorder = {
  data: {
    initialPlayers: { L1: "", L2: "", R1: "", R2: "", TL: "", TR: "" },
    isDouble: true,
    timeline: [] 
  },
  redoStack: [],

  initMatch: function(isDouble, tL, tR, nL1, nL2, nR1, nR2) {
    this.data.isDouble = isDouble;
    this.data.initialPlayers = { L1: nL1, L2: nL2, R1: nR1, R2: nR2, TL: tL, TR: tR };
    this.data.timeline = [];
    this.redoStack = [];
  },

  getRowIndex: function(playerName) {
    if (!playerName) return -1;
    let p = this.data.initialPlayers;
    if (playerName === p.L1) return 0;
    if (playerName === p.L2) return 1;
    if (playerName === p.R1) return 2;
    if (playerName === p.R2) return 3;
    return -1;
  },

  recordFirstSR: function(gameIdx, serverName, receiverName) {
    this.data.timeline.push({
      type: 'SR',
      gameIdx: gameIdx,
      serverRow: this.getRowIndex(serverName),
      receiverRow: this.getRowIndex(receiverName)
    });
  },

  recordPoint: function(gameIdx, serverName, score) {
    this.data.timeline.push({
      type: 'POINT',
      gameIdx: gameIdx,
      serverRow: this.getRowIndex(serverName),
      score: score
    });
  },

  recordGameEnd: function(gameIdx, winnerName, finalScore) {
    this.data.timeline.push({
      type: 'WIN_SCORE',
      gameIdx: gameIdx,
      winnerRow: this.getRowIndex(winnerName),
      score: finalScore
    });
  },

  exportData: function() {
    return JSON.parse(JSON.stringify(this.data));
  },
  
  loadData: function(savedData) {
    if (savedData) {
      this.data = JSON.parse(JSON.stringify(savedData));
    } else {
      this.data.timeline = [];
    }
    this.redoStack = [];
  },

  /**
   * PDF出力用：指定ゲームのマス目データを生成する
   */
  generateTableData: function(savedData, gameIdx, flowMaxPoints, flowHasSetting) {
    let timeline = savedData ? savedData.timeline : this.data.timeline;
    let rowsCount = 4;
    
    // 68列(上段34マス＋下段34マス)の空配列を4行分つくる
    let table = Array.from({length: rowsCount}, () => new Array(68).fill(""));
    
    // ラリーは2列目(index:2)から進行する（index:0はS/R、index:1は初期スコア0）
    let globalCol = 2; 

    // ゲームの点数設定とデュースの条件を取得
    let limit = flowMaxPoints || 21;
    let hasSetting = flowHasSetting !== undefined ? flowHasSetting : true;
    let deucePt = limit - 1;
    let scoreL = 0;
    let scoreR = 0;
    let deuceMarkerInserted = false;

    let gameTimeline = timeline.filter(t => t.gameIdx === gameIdx);

    gameTimeline.forEach(action => {
      if (action.type === 'SR') {
        let sR = action.serverRow;
        let rR = action.receiverRow;
        
        if (sR >= 0 && sR < rowsCount) {
          table[sR][0] = "S";
          table[sR][1] = "0"; // ★修正①：サーバーの1マス目に0を記録
        }
        if (rR >= 0 && rR < rowsCount) {
          table[rR][0] = "R";
          table[rR][1] = "0"; // ★修正①：レシーバーの1マス目に0を記録
        }
      } else if (action.type === 'POINT') {
        let r = action.serverRow;
        if (r >= 0 && r < rowsCount) {
          table[r][globalCol] = action.score;
          globalCol++;
          
          // 両チームのスコアを追跡
          let isLeft = (r === 0 || r === 1);
          if (isLeft) scoreL = action.score;
          else scoreR = action.score;
          
          // ★修正③：デュースポイント(20-20など)に到達した瞬間、1列まるごと斜線マーカーを挿入
          if (hasSetting && !deuceMarkerInserted && scoreL === deucePt && scoreR === deucePt) {
            for (let i = 0; i < rowsCount; i++) {
              table[i][globalCol] = "SLASH";
            }
            globalCol++;
            deuceMarkerInserted = true;
          }
        }
      } else if (action.type === 'WIN_SCORE') {
        let r = action.winnerRow;
        if (r >= 0 && r < rowsCount) {
          table[r][globalCol] = "W_" + action.score;
          globalCol++;
        }
      }
    });

    return table;
  }
};