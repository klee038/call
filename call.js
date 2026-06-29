// =========================================
// 主審コール・カンペ生成 (call.js)
// =========================================

const EN_NUM = ["Love", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty", "Twenty One", "Twenty Two", "Twenty Three", "Twenty Four", "Twenty Five", "Twenty Six", "Twenty Seven", "Twenty Eight", "Twenty Nine", "Thirty"];
const KANA_NUM = ["ラブ", "ワン", "ツー", "スリー", "フォー", "ファイブ", "シックス", "セブン", "エイト", "ナイン", "テン", "イレブン", "トゥエルブ", "サーティーン", "フォーティーン", "フィフティーン", "シックスティーン", "セブンティーン", "エイティーン", "ナインティーン", "トゥエンティ", "トゥエンティ・ワン", "トゥエンティ・ツー", "トゥエンティ・スリー", "トゥエンティ・フォー", "トゥエンティ・ファイブ", "トゥエンティ・シックス", "トゥエンティ・セブン", "トゥエンティ・エイト", "トゥエンティ・ナイン", "サーティ"];

function syncVolumeCallカンペ() {
  if (isSelectingRoles) return; 

  if (isOver) {
      let maxScore = Math.max(sL, sR);
      let minScore = Math.min(sL, sR);
      let leftWonMatch = (gL > gR);
      let winnerName = leftWonMatch ? tL : tR;
      if (winnerName.trim().length === 0) {
          winnerName = leftWonMatch ? getBannerName(true) : getBannerName(false);
      }
      
      let isL = (gL > gR);
      let matchScoreStr = isL ? `${gL}-${gR}` : `${gR}-${gL}`;
      let matchWinnerPlayer1 = isL ? nL1 : nR1;
      let winnerIsInitialLeft = (matchWinnerPlayer1 === initialNL1);
      
      let historyStrs = matchScoreHistory.map(game => {
          if (winnerIsInitialLeft) {
              return `${game.a}-${game.b}`;
          } else {
              return `${game.b}-${game.a}`;
          }
      }).join(", ");
      
      let callEn = `${EN_NUM[maxScore]} - ${EN_NUM[minScore]}, Game. <br> Match won by ${winnerName}. <br> ${matchScoreStr} (${historyStrs})`;
      let callKana = `${KANA_NUM[maxScore]}・${KANA_NUM[minScore]}、ゲーム。<br> マッチ、ウォンバイ ${winnerName}。<br> ${matchScoreStr} (${historyStrs})`;
      
      document.getElementById("board-call-en").innerHTML = callEn;
      document.getElementById("board-call-kana").innerHTML = callKana;
      return;
  }

  if (needsOverlay && overlayMsg.includes("WON BY")) {
      let maxScore = Math.max(sL, sR);
      let minScore = Math.min(sL, sR);
      
      let callEn = `${EN_NUM[maxScore]} - ${EN_NUM[minScore]}, Game. <br> `;
      let callKana = `${KANA_NUM[maxScore]}・${KANA_NUM[minScore]}、ゲーム。<br> `;
      
      if (flowHasInterval && flowHasCE) {
          callEn += "Interval, Change Ends. <br> ";
          callKana += "インターバル、チェンジエンズ。<br> ";
      } else if (flowHasInterval && !flowHasCE) {
          callEn += "Interval. <br> ";
          callKana += "インターバル。<br> ";
      } else if (!flowHasInterval && flowHasCE) {
          callEn += "Change Ends. <br> ";
          callKana += "チェンジエンズ。<br> ";
      }

      let gameNumber = gL + gR;
      let nth = (gameNumber === 1) ? "1st" : (gameNumber === 2 ? "2nd" : (gameNumber === 3 ? "3rd" : "4th"));
      let gameKana = (gameNumber === 1) ? "ファースト" : (gameNumber === 2 ? "セカンド" : (gameNumber === 3 ? "サード" : "フォース"));
      
      let leftWon = sL > sR;
      let winnerName = leftWon ? getBannerName(true) : getBannerName(false);
      
      callEn += `${nth} game won by ${winnerName}, ${maxScore}-${minScore}`;
      callKana += `${gameKana}ゲーム、ウォンバイ ${winnerName}、${maxScore}・${minScore}`;

      document.getElementById("board-call-en").innerHTML = callEn;
      document.getElementById("board-call-kana").innerHTML = callKana;
      return;
  }

  if (needsOverlay && (overlayMsg === "INTERVAL" || overlayMsg === "CHANGE ENDS")) {
      let maxScore = Math.max(sL, sR);
      let minScore = Math.min(sL, sR);
      
      let callEn = `${EN_NUM[maxScore]} - ${EN_NUM[minScore]} <br> `;
      let callKana = `${KANA_NUM[maxScore]}・${KANA_NUM[minScore]} <br> `;
      
      if (overlayMsg === "INTERVAL" && ceNotice === "CHANGE ENDS") {
          callEn += "Interval, Change Ends.";
          callKana += "インターバル、チェンジエンズ。";
      } else if (overlayMsg === "INTERVAL") {
          callEn += "Interval.";
          callKana += "インターバル。";
      } else if (overlayMsg === "CHANGE ENDS") {
          callEn += "Change Ends.";
          callKana += "チェンジエンズ。";
      }
      
      document.getElementById("board-call-en").innerHTML = callEn;
      document.getElementById("board-call-kana").innerHTML = callKana;
      return;
  }

  // ★大改修：0-0（ゲーム開始時）のコール生成ロジック
  if (sL === 0 && sR === 0 && !isOver && !needsOverlay && !justAfterInterval) {
    let callEn = "";
    let callKana = "";
    let currentGame = gL + gR + 1;
    
    // ゲーム数の冠詞を判定（第1ゲームでも、1ゲームマッチ以外なら「First game」を付ける）
    let gamePrefixEn = "";
    let gamePrefixKana = "";
    if (currentGame === 1 && flowMaxGames > 1) {
        gamePrefixEn = "First game, ";
        gamePrefixKana = "ファーストゲーム、";
    } else if (currentGame > 1) {
        if (currentGame === flowMaxGames) {
            gamePrefixEn = "Final game, ";
            gamePrefixKana = "ファイナルゲーム、";
        } else if (currentGame === 2) {
            gamePrefixEn = "Second game, ";
            gamePrefixKana = "セカンドゲーム、";
        } else if (currentGame === 3) {
            gamePrefixEn = "Third game, ";
            gamePrefixKana = "サードゲーム、";
        } else if (currentGame === 4) {
            gamePrefixEn = "Fourth game, ";
            gamePrefixKana = "フォースゲーム、";
        }
    }

    // 第1ゲームかつ公式戦モードの場合のみロングコールを生成
    if (currentGame === 1 && typeof flowIsOfficialCall !== 'undefined' && flowIsOfficialCall) {
        // 主審から見て右(Right)と左(Left)のチームを特定
        let rightTeamName = tR || "";
        let leftTeamName = tL || "";
        
        let rightPlayersEn = flowIsDouble ? `'${nR1}' and '${nR2}'` : `'${nR1}'`;
        let rightPlayersKana = flowIsDouble ? `『${nR1}』 アンド 『${nR2}』` : `『${nR1}』`;
        let leftPlayersEn = flowIsDouble ? `'${nL1}' and '${nL2}'` : `'${nL1}'`;
        let leftPlayersKana = flowIsDouble ? `『${nL1}』 アンド 『${nL2}』` : `『${nL1}』`;
        
        let rightTeamEn = rightTeamName ? `, ${rightTeamName}` : "";
        let rightTeamKana = rightTeamName ? `、${rightTeamName}` : "";
        let leftTeamEn = leftTeamName ? `, ${leftTeamName}` : "";
        let leftTeamKana = leftTeamName ? `、${leftTeamName}` : "";

        // サーバー・レシーバーの特定
        let serverName = "";
        let receiverName = "";
        if (!flowIsDouble) {
            serverName = srvL ? nL1 : nR1;
            receiverName = srvL ? nR1 : nL1;
        } else {
            let initialLPlayer = matchDefaultRole.initialLeftTeamSelectedPlayer || (pL1IsRight ? nL1 : nL2);
            let initialRPlayer = matchDefaultRole.initialRightTeamSelectedPlayer || (pR1IsRight ? nR1 : nR2);
            if (srvL) {
                serverName = initialLPlayer;
                receiverName = initialRPlayer;
            } else {
                serverName = initialRPlayer;
                receiverName = initialLPlayer;
            }
        }

        let serveCallEn = flowIsDouble ? `'${serverName}' to serve to '${receiverName}'` : `'${serverName}' to serve`;
        let serveCallKana = flowIsDouble ? `『${serverName}』 トゥサーブ トゥ 『${receiverName}』` : `『${serverName}』 トゥサーブ`;

        // ★修正：ご指定の位置で <br> による改行を挿入
        callEn = `Ladies and Gentlemen;<br>on my right, ${rightPlayersEn}${rightTeamEn}; and<br>on my left, ${leftPlayersEn}${leftTeamEn}.<br>${serveCallEn}; Love All; Play.`;
        callKana = `レイディーズ アンド ジェントルメン、<br>オンマイライト、${rightPlayersKana}${rightTeamKana}、アンド<br>オンマイレフト、${leftPlayersKana}${leftTeamKana}。<br>${serveCallKana}、ラブオール；プレイ`;
    } else {
        // 簡易版、または第2ゲーム以降のショートコール
        if (gamePrefixEn !== "") {
            callEn = `${gamePrefixEn}Love All; Play.`;
            callKana = `${gamePrefixKana}ラブオール；プレイ`;
        } else {
            callEn = "Love All; Play.";
            callKana = "ラブオール；プレイ";
        }
    }

    document.getElementById("board-call-en").innerHTML = callEn;
    document.getElementById("board-call-kana").innerHTML = callKana;
    return;
  }

  let callEn = "";
  let callKana = "";
  
  let isServiceOver = false;
  if (hist.length > 0 && !justAfterInterval) {
    let lastState = hist[hist.length - 1];
    if (lastState.srvL !== srvL && !lastState.isr) {
      isServiceOver = true;
    }
  }

  if (isServiceOver) {
    callEn += "Service Over. <br> ";
    callKana += "サービスオーバー、<br> ";
  }

  let serverScore = srvL ? sL : sR;
  let receiverScore = srvL ? sR : sL;

  let pointLabelEn = "";
  let pointLabelKana = "";
  if (annL !== "") pointLabelEn = annL;
  else if (annR !== "") pointLabelEn = annR;

  if (pointLabelEn === "GAME POINT") pointLabelKana = "ゲームポイント";
  else if (pointLabelEn === "MATCH POINT") pointLabelKana = "マッチポイント";

  if (pointLabelEn !== "") {
    if (serverScore === receiverScore) {
      callEn += `${EN_NUM[serverScore]}, ${pointLabelEn}, All.`;
      callKana += `${KANA_NUM[serverScore]}、${pointLabelKana}、オール`;
    } else {
      callEn += `${EN_NUM[serverScore]}, ${pointLabelEn}, ${EN_NUM[receiverScore]}.`;
      callKana += `${KANA_NUM[serverScore]}、${pointLabelKana}、${KANA_NUM[receiverScore]}`;
    }
  } else {
    if (serverScore === receiverScore) {
      if (sL === 0 && sR === 0) {
         callEn += "Love All.";
         callKana += "ラブ・オール";
      } else {
         callEn += `${EN_NUM[serverScore]} All.`;
         callKana += `${KANA_NUM[serverScore]}・オール`;
      }
    } else {
      callEn += `${EN_NUM[serverScore]} - ${EN_NUM[receiverScore]}.`;
      callKana += `${KANA_NUM[serverScore]}・${KANA_NUM[receiverScore]}`;
    }
  }
  
  if (justAfterInterval) {
      callEn = `${EN_NUM[serverScore]} - ${EN_NUM[receiverScore]}, Play.`;
      callKana = `${KANA_NUM[serverScore]}・${KANA_NUM[receiverScore]}、プレイ`;
  }

  document.getElementById("board-call-en").innerHTML = callEn;
  document.getElementById("board-call-kana").innerHTML = callKana;
}