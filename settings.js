// =========================================
// 設定画面・データ管理・WakeLock (settings.js)
// =========================================

function openSettingModal() {
  const overlay = document.getElementById("setting-overlay");
  if (!overlay) return;
  tempSettings = { ...defaultSettings };
  overlay.style.display = "flex";
  renderSettingModal();
}

function closeSettingModal() {
  const overlay = document.getElementById("setting-overlay");
  if (overlay) overlay.style.display = "none";
}

function updateTempSetting(key, value) {
  tempSettings[key] = value;
  renderSettingModal();
}

function applySettings() {
  defaultSettings = { ...tempSettings };
  localStorage.setItem('call_default_settings', JSON.stringify(defaultSettings));

  flowIsDouble = defaultSettings.isDouble;
  flowMaxGames = defaultSettings.maxGames;
  flowMaxPoints = defaultSettings.maxPoints;
  flowHasCE = defaultSettings.hasCE;
  flowHasInterval = defaultSettings.hasInterval;
  flowHasSetting = defaultSettings.hasSetting;
  flowHasCourtSelect = defaultSettings.hasCourtSelect !== undefined ? defaultSettings.hasCourtSelect : false;
  flowIsOfficialCall = defaultSettings.isOfficialCall !== undefined ? defaultSettings.isOfficialCall : true;

  resetWakeLockTimer();
  if (typeof renderFlow === 'function') renderFlow();
  if (typeof updateBoardFormatInfo === 'function') updateBoardFormatInfo();

  if (typeof saveActiveBackup === 'function') saveActiveBackup();
  
  closeSettingModal();
}

function renderSettingModal() {
  const content = document.getElementById("setting-modal-content");
  if (!content) return;

  content.innerHTML = `
    <div style="overflow-y: auto; max-height: 50vh; display: flex; flex-direction: column; gap: 5px; width: 100%; padding-right: 4px; box-sizing: border-box;">
      <div class="setting-row">
        <div class="setting-label">種目</div>
        <div class="toggle-group">
          <button class="toggle-item ${!tempSettings.isDouble ? 'selected' : ''}" onclick="updateTempSetting('isDouble', false)">SINGLES</button>
          <button class="toggle-item ${tempSettings.isDouble ? 'selected' : ''}" onclick="updateTempSetting('isDouble', true)">DOUBLES</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">ゲーム数</div>
        <div class="toggle-group">
          <button class="toggle-item ${tempSettings.maxGames === 1 ? 'selected' : ''}" onclick="updateTempSetting('maxGames', 1)">1G</button>
          <button class="toggle-item ${tempSettings.maxGames === 3 ? 'selected' : ''}" onclick="updateTempSetting('maxGames', 3)">3G</button>
          <button class="toggle-item ${tempSettings.maxGames === 5 ? 'selected' : ''}" onclick="updateTempSetting('maxGames', 5)">5G</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">点数</div>
        <div class="toggle-group">
          <button class="toggle-item ${tempSettings.maxPoints === 11 ? 'selected' : ''}" onclick="updateTempSetting('maxPoints', 11)">11pt</button>
          <button class="toggle-item ${tempSettings.maxPoints === 15 ? 'selected' : ''}" onclick="updateTempSetting('maxPoints', 15)">15pt</button>
          <button class="toggle-item ${tempSettings.maxPoints === 21 ? 'selected' : ''}" onclick="updateTempSetting('maxPoints', 21)">21pt</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">デュース</div>
        <div class="toggle-group">
          <button class="toggle-item ${!tempSettings.hasSetting ? 'selected' : ''}" onclick="updateTempSetting('hasSetting', false)">なし</button>
          <button class="toggle-item ${tempSettings.hasSetting ? 'selected' : ''}" onclick="updateTempSetting('hasSetting', true)">あり</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">チェンジエンズ</div>
        <div class="toggle-group">
          <button class="toggle-item ${!tempSettings.hasCE ? 'selected' : ''}" onclick="updateTempSetting('hasCE', false)">なし</button>
          <button class="toggle-item ${tempSettings.hasCE ? 'selected' : ''}" onclick="updateTempSetting('hasCE', true)">あり</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">インターバル</div>
        <div class="toggle-group">
          <button class="toggle-item ${!tempSettings.hasInterval ? 'selected' : ''}" onclick="updateTempSetting('hasInterval', false)">なし</button>
          <button class="toggle-item ${tempSettings.hasInterval ? 'selected' : ''}" onclick="updateTempSetting('hasInterval', true)">あり</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">コート選択</div>
        <div class="toggle-group">
          <button class="toggle-item ${!tempSettings.hasCourtSelect ? 'selected' : ''}" onclick="updateTempSetting('hasCourtSelect', false)">なし</button>
          <button class="toggle-item ${tempSettings.hasCourtSelect ? 'selected' : ''}" onclick="updateTempSetting('hasCourtSelect', true)">あり</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-label">開始コール</div>
        <div class="toggle-group">
          <button class="toggle-item ${!tempSettings.isOfficialCall ? 'selected' : ''}" onclick="updateTempSetting('isOfficialCall', false)">なし</button>
          <button class="toggle-item ${tempSettings.isOfficialCall ? 'selected' : ''}" onclick="updateTempSetting('isOfficialCall', true)">あり</button>
        </div>
      </div>
      <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div class="setting-label" style="margin-bottom: 5px;">画面スリープ防止（Wake Lock）</div>
        <div class="toggle-group" style="width: 100%;">
          <button class="toggle-item ${tempSettings.wakeLockMinutes === 0 ? 'selected' : ''}" onclick="updateTempSetting('wakeLockMinutes', 0)" style="flex:1; padding: 8px 0; font-size: 13px;">端末設定</button>
          <button class="toggle-item ${tempSettings.wakeLockMinutes === 3 ? 'selected' : ''}" onclick="updateTempSetting('wakeLockMinutes', 3)" style="flex:1; padding: 8px 0; font-size: 13px;">3分</button>
          <button class="toggle-item ${tempSettings.wakeLockMinutes === 5 ? 'selected' : ''}" onclick="updateTempSetting('wakeLockMinutes', 5)" style="flex:1; padding: 8px 0; font-size: 13px;">5分</button>
          <button class="toggle-item ${tempSettings.wakeLockMinutes === 10 ? 'selected' : ''}" onclick="updateTempSetting('wakeLockMinutes', 10)" style="flex:1; padding: 8px 0; font-size: 13px;">10分</button>
        </div>
      </div>
      <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 10px; border-bottom: none; padding-top: 15px;">
        <div class="setting-label" style="color: #EF4444; font-size: 14px;">データリセット (危険)</div>
        <div style="display: flex; gap: 8px; width: 100%;">
          <button class="roster-delete-btn" style="flex: 1; padding: 10px 0; font-size: 12px; color: #EF4444; border-color: #EF4444;" onclick="clearAllHistory()">履歴の全削除</button>
          <button class="roster-delete-btn" style="flex: 1; padding: 10px 0; font-size: 12px; color: #EF4444; border-color: #EF4444;" onclick="clearAllRoster()">名簿の全削除</button>
        </div>
        <button class="roster-delete-btn" style="width: 100%; padding: 10px 0; font-size: 12px; background: rgba(239,68,68,0.1); color: #EF4444; border-color: #EF4444;" onclick="factoryResetApp()">アプリの初期化 (全データ削除)</button>
      </div>
    </div>
    <button class="action-btn" style="width: 100%; background: #333333 !important; margin-top: 20px !important;" onclick="applySettings()">APPLY</button>
  `;
}

function clearAllHistory() {
  if (confirm("試合履歴を全て削除します。\n（元には戻せません）よろしいですか？")) {
    localStorage.removeItem('call_match_history');
    alert("試合履歴を全件削除しました。");
  }
}

function factoryResetApp() {
  if (confirm("アプリの全てのデータ（履歴、名簿、設定、現在進行中の試合）を削除し、初期状態に戻します。\n本当によろしいですか？")) {
    localStorage.clear();
    alert("アプリを初期化しました。画面を再読み込みします。");
    location.reload();
  }
}

let wakeLock = null;
let wakeLockTimer = null;

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      if (wakeLock !== null) return;
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
      });
    } catch (err) {
      console.warn('Wake Lock API がサポートされていないか、ブロックされました:', err);
    }
  }
}

function releaseWakeLock() {
  if (wakeLock !== null) {
    wakeLock.release().then(() => { wakeLock = null; });
  }
}

function resetWakeLockTimer() {
  if (defaultSettings.wakeLockMinutes <= 0) {
    releaseWakeLock();
    return;
  }
  requestWakeLock();
  if (wakeLockTimer !== null) {
    clearTimeout(wakeLockTimer);
  }
  wakeLockTimer = setTimeout(() => {
    releaseWakeLock();
  }, defaultSettings.wakeLockMinutes * 60 * 1000);
}

document.addEventListener('touchstart', resetWakeLockTimer, {passive: true});
document.addEventListener('click', resetWakeLockTimer, {passive: true});