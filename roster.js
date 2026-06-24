// =========================================
// 名簿（マスター）管理・選択機能 (roster.js)
// =========================================

let editingRosterIndex = -1;
let targetInputIdForSelect = '';
let isSelectingTeam = false;

/**
 * データを取得する
 */
function getRoster() {
  let roster = localStorage.getItem('call_player_roster');
  return roster ? JSON.parse(roster) : [];
}

/**
 * 【ルール1・前提】データを保存する（プライベートモード等によるエラー回避）
 */
function saveRoster(roster) {
  try {
    localStorage.setItem('call_player_roster', JSON.stringify(roster));
  } catch (e) {
    console.warn("スマホの制限により名簿が保存できませんでした（プライベートモード等）");
  }
}

/**
 * Rosterモーダルを開く
 */
let openRosterModal = function() {
  editingRosterIndex = -1;
  document.getElementById('roster-submit-btn').innerText = 'ADD PLAYER';
  document.getElementById('roster-cancel-edit-btn').style.display = 'none';
  document.getElementById('roster-player-name').value = '';
  document.getElementById('roster-team-name').value = '';
  document.getElementById('roster-overlay').style.display = 'flex';
  
  if(document.getElementById('roster-tab-single')) {
    switchRosterMode('single');
  }

  renderRosterList();
};

/**
 * Rosterモーダルを閉じる
 * 【ルール3】閉じる時、テキストエリア（#roster-bulk-text）の中身は消さない
 */
function closeRosterModal() {
  document.getElementById('roster-overlay').style.display = 'none';
}

/**
 * 編集をキャンセルする
 */
function cancelRosterEdit() {
  editingRosterIndex = -1;
  document.getElementById('roster-submit-btn').innerText = 'ADD PLAYER';
  document.getElementById('roster-cancel-edit-btn').style.display = 'none';
  document.getElementById('roster-player-name').value = '';
  document.getElementById('roster-team-name').value = '';
}

/**
 * 【ルール2】EDIT選択時の自動タブ切り替えとデータ反映
 */
function editPlayerInRoster(index) {
  // ★修正：先にタブ切り替え（お掃除処理）を実行し、文字が消されるのを防ぐ
  if(document.getElementById('roster-tab-single')) {
    switchRosterMode('single');
  }

  // タブ切り替え後にデータをセットする
  let roster = getRoster();
  let player = roster[index];
  editingRosterIndex = index;
  
  document.getElementById('roster-player-name').value = player.name;
  document.getElementById('roster-team-name').value = player.team || "";
  
  document.getElementById('roster-submit-btn').innerText = 'UPDATE PLAYER';
  document.getElementById('roster-cancel-edit-btn').style.display = 'block';

  document.getElementById('roster-single-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * 単独のプレイヤーを追加・更新する
 */
function addPlayerToRoster() {
  let name = document.getElementById('roster-player-name').value.trim();
  let team = document.getElementById('roster-team-name').value.trim();
  
  if (!name) {
    alert('Player Name を入力してください');
    return;
  }
  
  let roster = getRoster();

  // 同姓同名・同チームの重複チェック（編集中の自分自身は除外）
  let isDuplicate = roster.some((player, index) => {
    if (editingRosterIndex === index) return false;
    return player.name === name && (player.team || "") === team;
  });

  if (isDuplicate) {
    alert('同じチーム（または空白）で同名の選手がすでに登録されています。');
    return;
  }
  
  if (editingRosterIndex > -1) {
    roster[editingRosterIndex] = { name: name, team: team };
  } else {
    roster.push({ name: name, team: team });
  }
  
  saveRoster(roster);
  cancelRosterEdit(); // 入力欄とボタン状態をリセット
  renderRosterList();
}

/**
 * 名簿から単独削除
 */
function deletePlayerFromRoster(index) {
  if(confirm('この選手を名簿から削除しますか？')) {
    let roster = getRoster();
    roster.splice(index, 1);
    saveRoster(roster);
    
    // 編集中のアイテムを消した場合のリセット
    if (editingRosterIndex === index) {
      cancelRosterEdit();
    }
    
    renderRosterList();
  }
}

/**
 * 名簿リストの描画（検索対応 ＋ 一括変更ボタンの動的追加）
 */
function renderRosterList() {
  let roster = getRoster();
  let listEl = document.getElementById('roster-list');
  let searchEl = document.getElementById('roster-search-team');
  let searchQ = searchEl ? searchEl.value.trim().toLowerCase() : "";
  
  if (roster.length === 0) {
    listEl.innerHTML = '<div style="text-align:center; color:#94A3B8; font-size:14px; padding:10px;">名簿に選手が登録されていません</div>';
    return;
  }

  let html = "";
  
  // ★絞り込み中なら「一括変更」ボタンをリストの上部に出現させる
  if (searchQ) {
    let displayQ = searchQ === "(所属なし)" ? "所属なし" : searchQ;
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #333333; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
        <span style="font-size: 12px; color: #E2E8F0; font-weight: bold;">対象:「${displayQ}」</span>
        <button class="action-btn" style="height: 32px !important; margin: 0 !important; font-size: 11px; padding: 0 15px; width: auto;" onclick="bulkChangeTeamName('${searchQ.replace(/'/g, "\\'")}')">チーム名一括変更</button>
      </div>
    `;
  }

  let countMatch = 0;
  roster.forEach((player, index) => {
    let pTeam = player.team || "";
    if (searchQ) {
      if (searchQ === "(所属なし)") {
         if (pTeam !== "") return;
      } else {
         if (!pTeam.toLowerCase().includes(searchQ)) return;
      }
    }
    countMatch++;
    html += `
    <div class="roster-item">
      <div class="roster-item-info">
        <span class="roster-item-name">${player.name}</span>
        ${player.team ? `<span class="roster-item-team">${player.team}</span>` : ''}
      </div>
      <div class="roster-item-actions" style="display: flex; gap: 8px;">
        <button class="roster-edit-btn" onclick="editPlayerInRoster(${index})">EDIT</button>
        <button class="roster-delete-btn" onclick="deletePlayerFromRoster(${index})">DEL</button>
      </div>
    </div>`;
  });

  if (countMatch === 0) {
    listEl.innerHTML = html + '<div style="text-align:center; color:#94A3B8; font-size:14px; padding:10px;">該当する選手が見つかりません</div>';
  } else {
    listEl.innerHTML = html;
  }
}

/**
 * 【新規追加】絞り込んだチーム名を一斉に書き換える
 */
function bulkChangeTeamName(searchQ) {
  let roster = getRoster();
  let count = roster.filter(p => {
    let pTeam = (p.team || "").toLowerCase();
    if (searchQ === "(所属なし)") return pTeam === "";
    return pTeam.includes(searchQ);
  }).length;

  if (count === 0) return;

  let newTeamName = prompt(`対象の ${count}名 の新しいチーム名を入力してください。\n（空欄にしてOKを押すとチーム名を「なし」にします）`);
  if (newTeamName === null) return; // キャンセルされた場合

  let trimmedNewName = newTeamName.trim();

  roster = roster.map(p => {
    let pTeam = (p.team || "").toLowerCase();
    let isTarget = false;
    if (searchQ === "(所属なし)") {
      isTarget = (pTeam === "");
    } else {
      isTarget = pTeam.includes(searchQ);
    }

    if (isTarget) {
      return { ...p, team: trimmedNewName };
    }
    return p;
  });

  saveRoster(roster);
  
  // 検索枠を新しいチーム名に書き換えて再検索状態にする
  let searchEl = document.getElementById('roster-search-team');
  if (searchEl) {
      searchEl.value = trimmedNewName === "" ? "(所属なし)" : trimmedNewName;
  }
  
  if (editingRosterIndex !== -1) cancelRosterEdit();
  renderRosterList();
}

/**
 * 【ルール5】チーム選択用モーダルを開く
 */
function openTeamSelectModal(inputId) {
  targetInputIdForSelect = inputId;
  isSelectingTeam = true;
  document.getElementById('player-select-overlay').style.display = 'flex';
  document.querySelector('#player-select-overlay .roster-header').innerText = 'SELECT TEAM';
  renderTeamSelectList();
}

/**
 * 【ルール5】重複のないチーム一覧を描画（所属なしも追加）
 */
function renderTeamSelectList() {
  let roster = getRoster();
  let listEl = document.getElementById('player-select-list');
  
  // 名簿の中から空白以外のチーム名を重複なしで抽出
  let teams = [...new Set(roster.map(p => p.team).filter(t => t && t.trim() !== ""))];
  
  if (roster.length === 0) {
    listEl.innerHTML = '<div style="text-align:center; color:#94A3B8; font-size:14px; padding:10px;">登録されているチームがありません</div>';
    return;
  }
  
  // ★新規追加：常に一番上に「(所属なし)」の選択肢を出す
  let html = `
    <button class="roster-item roster-select-btn" onclick="selectTeam('(所属なし)')">
      <div class="roster-item-info">
        <span class="roster-item-name" style="color: #94A3B8; font-style: italic;">(所属なしの選手)</span>
      </div>
    </button>
  `;
  
  html += teams.map((team) => `
    <button class="roster-item roster-select-btn" onclick="selectTeam('${team.replace(/'/g, "\\'")}')">
      <div class="roster-item-info">
        <span class="roster-item-name">${team}</span>
      </div>
    </button>
  `).join('');
  
  listEl.innerHTML = html;
}

/**
 * 【ルール5】チームを選択して入力欄へ反映
 */
function selectTeam(team) {
  // ★修正：検索枠以外で「(所属なし)」が選ばれた場合は、空欄としてセットする
  if (team === '(所属なし)' && targetInputIdForSelect !== 'roster-search-team') {
    document.getElementById(targetInputIdForSelect).value = "";
  } else {
    document.getElementById(targetInputIdForSelect).value = team;
  }
  
  if (targetInputIdForSelect === 'roster-search-team') {
    renderRosterList();
  }
  closePlayerSelectModal();
}

/**
 * プレイヤー選択用モーダルを開く
 */
function openPlayerSelectModal(inputId) {
  targetInputIdForSelect = inputId;
  isSelectingTeam = false;
  document.getElementById('player-select-overlay').style.display = 'flex';
  document.querySelector('#player-select-overlay .roster-header').innerText = 'SELECT PLAYER';
  renderPlayerSelectList();
}

/**
 * プレイヤー選択用モーダルを閉じる
 */
function closePlayerSelectModal() {
  document.getElementById('player-select-overlay').style.display = 'none';
}

/**
 * プレイヤー一覧の描画（チームでの絞り込みと選択済みのグレーアウト機能付き）
 */
function renderPlayerSelectList() {
  let roster = getRoster();
  let listEl = document.getElementById('player-select-list');
  
  if (roster.length === 0) {
    listEl.innerHTML = `<div style="text-align:center; padding:20px 10px;"><div style="color:#94A3B8; font-size:14px; margin-bottom:15px;">名簿に選手が登録されていません</div><button class="action-btn" style="min-width:160px; height:44px !important; margin-top:0 !important; font-size:14px; background:#333333 !important;" onclick="closePlayerSelectModal(); openRosterModal();">+ Add players</button></div>`;
    return;
  }

  let isLeft = targetInputIdForSelect.includes('-pl');
  let teamInputId = isLeft ? 'input-tl' : 'input-tr';
  let filterTeam = document.getElementById(teamInputId)?.value.trim() || "";

  let filteredRoster = roster;
  if (filterTeam !== "") {
    // 枠に(所属なし)が入っている場合は空欄の人だけを絞り込む
    if (filterTeam === "(所属なし)") {
      filteredRoster = roster.filter(p => (p.team || "") === "");
    } else {
      filteredRoster = roster.filter(p => (p.team || "") === filterTeam);
    }
    
    if (filteredRoster.length === 0) {
      listEl.innerHTML = '<div style="text-align:center; color:#94A3B8; font-size:14px; padding:10px;">該当チームの選手が見つかりません</div>';
      return;
    }
  }
  
  // 現在フォーカスしている枠「以外」ですでに選ばれている選手名を取得
  let otherInputs = ['input-pl1', 'input-pl2', 'input-pr1', 'input-pr2'].filter(id => id !== targetInputIdForSelect);
  let takenNames = otherInputs.map(id => {
      let el = document.getElementById(id);
      return el ? el.value.trim() : "";
  }).filter(Boolean);
  
  listEl.innerHTML = filteredRoster.map((player) => {
    let isDisabled = takenNames.includes(player.name);
    
    if (isDisabled) {
        return `
        <div class="roster-item roster-select-btn" style="opacity: 0.3; cursor: not-allowed; border-color: transparent;">
          <div class="roster-item-info">
            <span class="roster-item-name">${player.name} <span style="font-size:10px; color:#A1A1AA; margin-left:8px;">(選択済)</span></span>
            ${player.team ? `<span class="roster-item-team">${player.team}</span>` : ''}
          </div>
        </div>`;
    } else {
        return `
        <button class="roster-item roster-select-btn" onclick="selectPlayer('${player.name.replace(/'/g, "\\'")}', '${(player.team || '').replace(/'/g, "\\'")}')">
          <div class="roster-item-info">
            <span class="roster-item-name">${player.name}</span>
            ${player.team ? `<span class="roster-item-team">${player.team}</span>` : ''}
          </div>
        </button>`;
    }
  }).join('');
}

/**
 * プレイヤーを選択し、必要に応じてチーム名も自動推論する
 */
function selectPlayer(name, team) {
  document.getElementById(targetInputIdForSelect).value = name;
  
  let roster = getRoster();
  
  // 指定された枠のペアを考慮してチーム名を算出するヘルパー
  let getTeam = (pId1, pId2) => {
      let p1 = document.getElementById(pId1)?.value.trim() || "";
      // script.jsの flowIsDouble に依存（万一未定義なら true 扱い）
      let isDouble = typeof flowIsDouble !== 'undefined' ? flowIsDouble : true;
      if (!isDouble) {
          let p = roster.find(r => r.name === p1);
          return p ? p.team : "";
      }
      let p2 = document.getElementById(pId2)?.value.trim() || "";
      let t1 = roster.find(r => r.name === p1)?.team || "";
      let t2 = roster.find(r => r.name === p2)?.team || "";
      
      if (p1 && p2) {
          return (t1 === t2 && t1 !== "") ? t1 : "";
      } else if (p1) {
          return t1;
      } else if (p2) {
          return t2;
      }
      return "";
  };

  let derivedL = getTeam('input-pl1', 'input-pl2');
  let derivedR = getTeam('input-pr1', 'input-pr2');

  let tlEl = document.getElementById('input-tl');
  let trEl = document.getElementById('input-tr');

  // 選択した側のチーム名だけを確実にセット・維持する
  if (tlEl && trEl) {
      let isLeft = targetInputIdForSelect.includes('-pl');
      if (isLeft) {
          if (derivedL !== "") tlEl.value = derivedL;
      } else {
          if (derivedR !== "") trEl.value = derivedR;
      }
  }

  closePlayerSelectModal();
}

/**
 * タブ切り替え（SINGLE ADD / BULK ADD）
 * 【ルール3】タブ切り替え時、テキストエリアの中身は消さない
 */
function switchRosterMode(mode) {
  const tabSingle = document.getElementById('roster-tab-single');
  const tabBulk = document.getElementById('roster-tab-bulk');
  const singleArea = document.getElementById('roster-single-area');
  const bulkArea = document.getElementById('roster-bulk-area');
  
  if (mode === 'single') {
    tabSingle.classList.add('selected');
    tabBulk.classList.remove('selected');
    singleArea.style.display = 'flex';
    bulkArea.style.display = 'none';
    cancelRosterEdit();
  } else {
    tabSingle.classList.remove('selected');
    tabBulk.classList.add('selected');
    singleArea.style.display = 'none';
    bulkArea.style.display = 'flex';
  }
}

/**
 * 【ルール4】コピペ等で一括追加する
 */
function addBulkPlayersToRoster() {
  const textEl = document.getElementById('roster-bulk-text');
  const text = textEl ? textEl.value : "";
  if (!text.trim()) {
    alert('テキストを入力してください');
    return;
  }
  
  let roster = getRoster();
  const lines = text.split('\n');
  let addCount = 0;
  
  const globalTeamEl = document.getElementById('roster-bulk-team-name');
  const globalTeam = globalTeamEl ? globalTeamEl.value.trim() : "";
  
  lines.forEach(line => {
    let rawLine = line.trim();
    if (!rawLine) return; // 空行はスルー
    
    let name = "";
    let team = "";
    
    // 【ルール4】カンマ、またはタブ（エクセルからのコピペ）のみで分割する
    if (rawLine.includes(',')) {
      let parts = rawLine.split(',');
      name = parts[0].trim();
      team = parts.slice(1).join(',').trim();
      if(team === "") team = globalTeam;
    } else if (rawLine.includes('\t')) {
      let parts = rawLine.split('\t');
      name = parts[0].trim();
      team = parts.slice(1).join('\t').trim();
      if(team === "") team = globalTeam;
    } else {
      // カンマもタブもない場合は、行全体を名前として扱う（途中のスペースは保護）
      name = rawLine; 
      team = globalTeam;
    }
    
    if (!name) return; // 名前が空の行はスキップ
    
    // 名簿内の同姓同名・同チーム重複チェック
    let isDuplicate = roster.some(p => p.name === name && (p.team || "") === team);
    if (!isDuplicate) {
      roster.push({ name: name, team: team });
      addCount++;
    }
  });
  
  if (addCount > 0) {
    saveRoster(roster);
    renderRosterList();
    // 【修正箇所】成功した時のみ、重複防止のためテキストとチーム名を両方クリア
    if (textEl) textEl.value = "";
    if (globalTeamEl) globalTeamEl.value = "";
    alert(`${addCount}名の選手を名簿に一括登録しました！`);
  } else {
    alert('新しい選手が見つからなかったか、すべて既に登録されています。');
  }
}

/**
 * 【ルール6】検索されたチームを名簿から一括削除する
 */
function deleteFilteredTeamRoster() {
  let searchEl = document.getElementById('roster-search-team');
  let searchQ = searchEl ? searchEl.value.trim().toLowerCase() : "";
  if (!searchQ) {
    alert("削除したいチーム名を検索枠に入力してください。");
    return;
  }
  
  let roster = getRoster();
  let count = roster.filter(p => {
      let pTeam = (p.team || "").toLowerCase();
      if (searchQ === "(所属なし)") return pTeam === "";
      return pTeam.includes(searchQ);
  }).length;
  
  if (count === 0) {
    alert("該当するチームの選手はいません。");
    return;
  }
  
  let displayQ = searchQ === "(所属なし)" ? "所属なし" : searchQ;
  if(confirm(`「${displayQ}」の選手 ${count}名 を一括削除しますか？`)) {
    roster = roster.filter(p => {
      let pTeam = (p.team || "").toLowerCase();
      if (searchQ === "(所属なし)") return pTeam !== "";
      return !pTeam.includes(searchQ);
    });
    saveRoster(roster);
    if(editingRosterIndex !== -1) cancelRosterEdit();
    renderRosterList();
  }
}

/**
 * 【ルール6】名簿データを全件削除する
 */
function clearAllRoster() {
  if(confirm("名簿の全ての選手を完全削除します。\n（元には戻せません）よろしいですか？")) {
    saveRoster([]); // 空の配列を保存
    if(editingRosterIndex !== -1) cancelRosterEdit();
    renderRosterList();
  }
}