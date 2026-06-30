// =========================================
// トス専用ロジック (toss.js)
// =========================================

let tossWinner = null;    
let winnerChoice = null;  
let loserChoice = null;   

function getTossName(t1, t2, p1, p2) {
  let pStr = flowIsDouble ? `${p1} / ${p2}` : p1;
  let combinedTeam = (t1 === t2 || !t2) ? t1 : `${t1} / ${t2}`;
  
  if (combinedTeam.trim().length > 0) {
    return `${combinedTeam}\n<span style="font-size:11px;">(${pStr})</span>`;
  } else {
    return flowIsDouble ? `${p1}\n${p2}` : p1;
  }
}

function setTossWinner(val) {
  tossWinner = val; 
  winnerChoice = null; 
  loserChoice = null;
  renderFlow();
}

function setWinnerChoice(val) {
  winnerChoice = val; 
  loserChoice = null;
  renderFlow();
}

function setLoserChoice(val) {
  loserChoice = val;
  renderFlow();
}