'use strict';

/* ══════════════════════════════════════════════════════════════
   State
══════════════════════════════════════════════════════════════ */
const state = {
  timer:       null,
  countdown:   null,
  secsLeft:    0,
  lastFetch:   null,
  alertLog:    [],
};

/* ══════════════════════════════════════════════════════════════
   DOM helpers
══════════════════════════════════════════════════════════════ */
const $  = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g,
  c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

function fmt(n, decimals = 0) {
  if (n == null) return '—';
  return Number(n).toFixed(decimals);
}

/* ══════════════════════════════════════════════════════════════
   Settings persistence
══════════════════════════════════════════════════════════════ */
const KEYS = {
  owmKey:     'wab_owm_key',
  city:       'wab_city',
  lat:        'wab_lat',
  lon:        'wab_lon',
  units:      'wab_units',
  tgToken:    'wab_tg_token',
  tgChat:     'wab_tg_chat',
  rainThr:    'wab_rain_thr',
  windThr:    'wab_wind_thr',
  coldThr:    'wab_cold_thr',
  hotThr:     'wab_hot_thr',
  interval:   'wab_interval',
  alertRain:  'wab_alert_rain',
  alertWind:  'wab_alert_wind',
  alertCold:  'wab_alert_cold',
  alertHot:   'wab_alert_hot',
  alertSevere:'wab_alert_severe',
  dark:       'wab_dark',
  log:        'wab_log',
};

function saveSettings() {
  localStorage.setItem(KEYS.owmKey,  $('owm-key').value);
  localStorage.setItem(KEYS.city,    $('city-input').value);
  localStorage.setItem(KEYS.units,   $('units').value);
  localStorage.setItem(KEYS.tgToken, $('tg-token').value);
  localStorage.setItem(KEYS.tgChat,  $('tg-chat').value);
  localStorage.setItem(KEYS.rainThr, $('rain-threshold').value);
  localStorage.setItem(KEYS.windThr, $('wind-threshold').value);
  localStorage.setItem(KEYS.coldThr, $('cold-threshold').value);
  localStorage.setItem(KEYS.hotThr,  $('hot-threshold').value);
  localStorage.setItem(KEYS.interval,$('check-interval').value);
  localStorage.setItem(KEYS.alertRain,  $('alert-rain').checked  ? '1':'0');
  localStorage.setItem(KEYS.alertWind,  $('alert-wind').checked  ? '1':'0');
  localStorage.setItem(KEYS.alertCold,  $('alert-cold').checked  ? '1':'0');
  localStorage.setItem(KEYS.alertHot,   $('alert-hot').checked   ? '1':'0');
  localStorage.setItem(KEYS.alertSevere,$('alert-severe').checked? '1':'0');
  localStorage.setItem(KEYS.lat, state.lat || '');
  localStorage.setItem(KEYS.lon, state.lon || '');
}

function loadSettings() {
  const g = k => localStorage.getItem(k);
  if (g(KEYS.owmKey))  $('owm-key').value    = g(KEYS.owmKey);
  if (g(KEYS.city))    $('city-input').value  = g(KEYS.city);
  if (g(KEYS.units))   $('units').value        = g(KEYS.units);
  if (g(KEYS.tgToken)) $('tg-token').value    = g(KEYS.tgToken);
  if (g(KEYS.tgChat))  $('tg-chat').value     = g(KEYS.tgChat);
  if (g(KEYS.rainThr)) $('rain-threshold').value = g(KEYS.rainThr);
  if (g(KEYS.windThr)) $('wind-threshold').value = g(KEYS.windThr);
  if (g(KEYS.coldThr)) $('cold-threshold').value = g(KEYS.coldThr);
  if (g(KEYS.hotThr))  $('hot-threshold').value  = g(KEYS.hotThr);
  if (g(KEYS.interval))$('check-interval').value = g(KEYS.interval);

  $('alert-rain').checked   = g(KEYS.alertRain)   !== '0';
  $('alert-wind').checked   = g(KEYS.alertWind)   !== '0';
  $('alert-cold').checked   = g(KEYS.alertCold)   === '1';
  $('alert-hot').checked    = g(KEYS.alertHot)    === '1';
  $('alert-severe').checked = g(KEYS.alertSevere) !== '0';

  state.lat = g(KEYS.lat) || null;
  state.lon = g(KEYS.lon) || null;

  updateRangeLabels();
  if (g(KEYS.dark) === '1') applyTheme('dark');

  const log = g(KEYS.log);
  if (log) { try { state.alertLog = JSON.parse(log); } catch(e) { state.alertLog = []; } }
}

function persistLog() {
  localStorage.setItem(KEYS.log, JSON.stringify(state.alertLog.slice(-100)));
}

/* ══════════════════════════════════════════════════════════════
   Range label sync
══════════════════════════════════════════════════════════════ */
function updateRangeLabels() {
  const units = $('units').value;
  const isMetric = units === 'metric';

  $('rain-val').textContent = $('rain-threshold').value;
  $('wind-val').textContent = $('wind-threshold').value;
  $('cold-val').textContent = $('cold-threshold').value;
  $('hot-val').textContent  = $('hot-threshold').value;

  document.querySelectorAll('.unit-label').forEach(el => {
    el.textContent = isMetric ? 'km/h' : 'mph';
  });
  document.querySelectorAll('.unit-label2').forEach(el => {
    el.textContent = isMetric ? 'C' : 'F';
  });
}

/* ══════════════════════════════════════════════════════════════
   Theme
══════════════════════════════════════════════════════════════ */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('icon-moon').style.display = theme === 'dark' ? 'none' : 'block';
  $('icon-sun').style.display  = theme === 'dark' ? 'block' : 'none';
}

/* ══════════════════════════════════════════════════════════════
   Status helpers
══════════════════════════════════════════════════════════════ */
function setStatus(text, type = '', dotType = '') {
  const bar = $('status-bar');
  const dot = $('status-dot');
  bar.style.display = 'flex';
  $('status-text').textContent = text;
  dot.className = 'status-dot ' + (dotType || type);
}

function setSaveStatus(text, type = '') {
  const el = $('save-status');
  el.textContent = text;
  el.className = 'status-inline ' + type;
  if (text) setTimeout(() => { el.textContent = ''; el.className = 'status-inline'; }, 3000);
}

/* ══════════════════════════════════════════════════════════════
   Log
══════════════════════════════════════════════════════════════ */
function addLog(type, msg) {
  state.alertLog.unshift({ type, msg, time: new Date().toLocaleTimeString() });
  if (state.alertLog.length > 100) state.alertLog.pop();
  persistLog();
  renderLog();
}

function renderLog() {
  const ul = $('log-list');
  const section = $('log-section');
  if (state.alertLog.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';
  ul.innerHTML = state.alertLog.map(e => `
    <li class="log-item">
      <span class="log-dot ${esc(e.type)}"></span>
      <span class="log-type">${esc(e.type.toUpperCase())}</span>
      <span class="log-msg">${esc(e.msg)}</span>
      <span class="log-time">${esc(e.time)}</span>
    </li>`).join('');
}

/* ══════════════════════════════════════════════════════════════
   Telegram
══════════════════════════════════════════════════════════════ */
async function sendTelegram(text) {
  const token = $('tg-token').value.trim();
  const chat  = $('tg-chat').value.trim();
  if (!token || !chat) throw new Error('Telegram token or Chat ID is missing');

  const url = `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML' }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.description || 'Telegram API error');
  return json;
}

/* ══════════════════════════════════════════════════════════════
   OpenWeatherMap
══════════════════════════════════════════════════════════════ */
function getLocationParam() {
  if (state.lat && state.lon) return `lat=${state.lat}&lon=${state.lon}`;
  const city = $('city-input').value.trim();
  if (!city) throw new Error('Enter a city or use GPS location');
  return `q=${encodeURIComponent(city)}`;
}

async function fetchCurrentWeather(apiKey, units) {
  const loc = getLocationParam();
  const url = `https://api.openweathermap.org/data/2.5/weather?${loc}&appid=${encodeURIComponent(apiKey)}&units=${units}`;
  const res  = await fetch(url);
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.message || `OWM error ${res.status}`);
  }
  return res.json();
}

async function fetchForecast(apiKey, units) {
  const loc = getLocationParam();
  const url = `https://api.openweathermap.org/data/2.5/forecast?${loc}&appid=${encodeURIComponent(apiKey)}&units=${units}&cnt=40`;
  const res  = await fetch(url);
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.message || `OWM forecast error ${res.status}`);
  }
  return res.json();
}

/* ══════════════════════════════════════════════════════════════
   Alert detection
══════════════════════════════════════════════════════════════ */
const SEVERE_IDS = [
  200,201,202,210,211,212,221,230,231,232,  // Thunderstorm
  504,511,                                   // Extreme rain/sleet
  600,601,602,611,612,613,615,616,620,621,622, // Snow
  701,711,721,731,741,751,761,762,771,781,   // Atmosphere (fog, volcano, tornado)
  900,901,902,903,904,905,906,               // Extreme
];

function detectAlerts(current, forecastList) {
  const alerts = [];
  const units      = $('units').value;
  const isMetric   = units === 'metric';
  const rainThr    = +$('rain-threshold').value;
  const windThr    = +$('wind-threshold').value;
  const coldThr    = +$('cold-threshold').value;
  const hotThr     = +$('hot-threshold').value;
  const doRain     = $('alert-rain').checked;
  const doWind     = $('alert-wind').checked;
  const doCold     = $('alert-cold').checked;
  const doHot      = $('alert-hot').checked;
  const doSevere   = $('alert-severe').checked;

  // Wind speed: OWM returns m/s for metric, mph for imperial
  const windSpeedConverted = isMetric
    ? (current.wind?.speed || 0) * 3.6   // m/s → km/h
    : (current.wind?.speed || 0);         // already mph

  if (doWind && windSpeedConverted >= windThr) {
    alerts.push({
      type: 'wind',
      icon: '💨',
      title: 'High Wind Warning',
      msg: `Wind speed is ${fmt(windSpeedConverted, 1)} ${isMetric ? 'km/h' : 'mph'}`,
    });
  }
  if (doCold && current.main.temp <= coldThr) {
    alerts.push({
      type: 'cold',
      icon: '🥶',
      title: 'Freezing Temperature',
      msg: `Temperature is ${fmt(current.main.temp, 1)}°${isMetric ? 'C' : 'F'}`,
    });
  }
  if (doHot && current.main.temp >= hotThr) {
    alerts.push({
      type: 'heat',
      icon: '🔥',
      title: 'Extreme Heat',
      msg: `Temperature is ${fmt(current.main.temp, 1)}°${isMetric ? 'C' : 'F'}`,
    });
  }
  if (doSevere && SEVERE_IDS.includes(current.weather[0]?.id)) {
    alerts.push({
      type: 'severe',
      icon: '⚠️',
      title: 'Severe Weather',
      msg: current.weather[0].description,
    });
  }

  // Rain from forecast (next 24 h)
  if (doRain && forecastList) {
    const next24 = forecastList.slice(0, 8);
    const rainySlots = next24.filter(slot => {
      const pop = (slot.pop || 0) * 100;
      const id  = slot.weather[0]?.id;
      return pop >= rainThr || (id >= 500 && id < 700);
    });
    if (rainySlots.length > 0) {
      const maxPop = Math.max(...rainySlots.map(s => (s.pop || 0) * 100));
      const isSnow = rainySlots.some(s => s.weather[0]?.id >= 600 && s.weather[0]?.id < 700);
      alerts.push({
        type: 'rain',
        icon: isSnow ? '🌨️' : '🌧️',
        title: isSnow ? 'Snow Forecast' : 'Rain Forecast',
        msg: `Up to ${fmt(maxPop)}% chance in the next 24 hours`,
      });
    }
  }

  return alerts;
}

/* ══════════════════════════════════════════════════════════════
   Build Telegram message
══════════════════════════════════════════════════════════════ */
function buildAlertMessage(city, current, alerts) {
  const units    = $('units').value;
  const isMetric = units === 'metric';
  const deg      = isMetric ? '°C' : '°F';
  const windUnit = isMetric ? 'km/h' : 'mph';
  const windSpd  = isMetric
    ? (current.wind?.speed || 0) * 3.6
    : (current.wind?.speed || 0);

  const lines = [
    `⛈️ <b>Weather Alert — ${city}</b>`,
    ``,
    `📍 <b>Current conditions:</b>`,
    `🌡 Temp: ${fmt(current.main.temp, 1)}${deg} (feels ${fmt(current.main.feels_like, 1)}${deg})`,
    `💧 Humidity: ${current.main.humidity}%`,
    `💨 Wind: ${fmt(windSpd, 1)} ${windUnit}`,
    `🌤 ${current.weather[0]?.description || ''}`,
    ``,
    `🚨 <b>Alerts triggered:</b>`,
    ...alerts.map(a => `${a.icon} <b>${a.title}</b> — ${a.msg}`),
    ``,
    `🕐 ${new Date().toLocaleString()}`,
  ];
  return lines.join('\n');
}

/* ══════════════════════════════════════════════════════════════
   Render weather UI
══════════════════════════════════════════════════════════════ */
function iconUrl(code) {
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
}

function renderCurrent(data) {
  const units    = $('units').value;
  const isMetric = units === 'metric';
  const deg      = isMetric ? '°C' : '°F';
  const windUnit = isMetric ? 'km/h' : 'mph';
  const windSpd  = isMetric
    ? (data.wind?.speed || 0) * 3.6
    : (data.wind?.speed || 0);

  $('cur-city').textContent    = `${data.name}, ${data.sys?.country || ''}`;
  $('cur-desc').textContent    = data.weather[0]?.description || '';
  $('cur-temp').textContent    = `${fmt(data.main.temp, 0)}${deg}`;
  $('cur-feels').textContent   = `${fmt(data.main.feels_like, 0)}${deg}`;
  $('cur-hum').textContent     = `${data.main.humidity}%`;
  $('cur-wind').textContent    = `${fmt(windSpd, 1)} ${windUnit}`;
  $('cur-pressure').textContent= `${data.main.pressure} hPa`;
  $('cur-vis').textContent     = data.visibility != null ? `${(data.visibility/1000).toFixed(1)} km` : '—';
  $('cur-time').textContent    = new Date().toLocaleTimeString();
  const icon = $('cur-icon');
  icon.src = iconUrl(data.weather[0]?.icon || '01d');
  icon.alt = data.weather[0]?.description || '';

  $('weather-section').style.display = '';
}

function renderActiveAlerts(alerts) {
  const card = $('active-alerts-card');
  const list = $('active-alerts-list');
  if (!alerts.length) { card.style.display = 'none'; return; }
  card.style.display = '';
  list.innerHTML = alerts.map(a => `
    <div class="alert-badge ${esc(a.type)}">
      <span class="alert-badge-icon">${a.icon}</span>
      <div><strong>${esc(a.title)}</strong>${esc(a.msg)}</div>
    </div>`).join('');
}

function renderForecast(forecastData) {
  const units    = $('units').value;
  const isMetric = units === 'metric';
  const deg      = isMetric ? '°C' : '°F';
  const rainThr  = +$('rain-threshold').value;

  // Group by day (take one entry per day: midday or first available)
  const byDay = {};
  forecastData.list.forEach(item => {
    const d = new Date(item.dt * 1000);
    const key = d.toDateString();
    const hour = d.getHours();
    if (!byDay[key] || Math.abs(hour - 12) < Math.abs(new Date(byDay[key].dt * 1000).getHours() - 12)) {
      byDay[key] = item;
    }
  });

  const days = Object.values(byDay).slice(0, 5);
  const container = $('forecast-list');
  container.innerHTML = days.map(item => {
    const d = new Date(item.dt * 1000);
    const dayName = d.toLocaleDateString('en', { weekday: 'short' });
    const pop = Math.round((item.pop || 0) * 100);
    const hasAlert = pop >= rainThr || SEVERE_IDS.includes(item.weather[0]?.id);

    return `<div class="forecast-day${hasAlert ? ' has-alert' : ''}">
      <div class="fc-day-name">${esc(dayName)}</div>
      <img class="fc-icon" src="${iconUrl(item.weather[0]?.icon || '01d')}" alt="${esc(item.weather[0]?.description || '')}" />
      <div class="fc-temp">${fmt(item.main.temp_max ?? item.main.temp, 0)}${deg}
        <span>/ ${fmt(item.main.temp_min ?? item.main.temp, 0)}</span>
      </div>
      <div class="fc-desc">${esc(item.weather[0]?.description || '')}</div>
      ${pop > 0 ? `<div class="fc-rain">💧 ${pop}%</div>` : ''}
      ${hasAlert ? `<div class="fc-alert">⚠️ Alert</div>` : ''}
    </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════════════
   Main check routine
══════════════════════════════════════════════════════════════ */
async function runCheck(sendAlerts = true) {
  const apiKey = $('owm-key').value.trim();
  if (!apiKey) { setSaveStatus('Enter an OpenWeatherMap API key first.', 'error'); return; }

  setStatus('Fetching weather data…', 'info', '');
  $('btn-check').disabled = true;

  try {
    const units = $('units').value;
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(apiKey, units),
      fetchForecast(apiKey, units),
    ]);

    // Save resolved coords for subsequent calls
    if (current.coord) {
      state.lat = current.coord.lat;
      state.lon = current.coord.lon;
      localStorage.setItem(KEYS.lat, state.lat);
      localStorage.setItem(KEYS.lon, state.lon);
    }

    renderCurrent(current);
    renderForecast(forecast);

    const alerts = detectAlerts(current, forecast.list);
    renderActiveAlerts(alerts);

    state.lastFetch = new Date();

    if (alerts.length === 0) {
      setStatus(`All clear in ${current.name} — last checked ${state.lastFetch.toLocaleTimeString()}`, '', 'ok');
      addLog('info', `Check complete for ${current.name} — no alerts triggered`);
    } else {
      const summary = alerts.map(a => a.title).join(', ');
      setStatus(`${alerts.length} alert(s) in ${current.name}: ${summary}`, '', 'warn');

      if (sendAlerts) {
        const msg = buildAlertMessage(current.name, current, alerts);
        try {
          await sendTelegram(msg);
          addLog('sent', `Telegram alert sent for ${current.name}: ${summary}`);
        } catch (e) {
          addLog('error', `Failed to send Telegram alert: ${e.message}`);
          setStatus(`Alerts detected but Telegram failed: ${e.message}`, '', 'error');
        }
      } else {
        addLog('info', `Check complete — ${alerts.length} alert(s) detected (alerts suppressed this run)`);
      }
    }
  } catch(e) {
    setStatus(`Error: ${e.message}`, '', 'error');
    addLog('error', e.message);
  } finally {
    $('btn-check').disabled = false;
  }
}

/* ══════════════════════════════════════════════════════════════
   Auto-refresh / countdown
══════════════════════════════════════════════════════════════ */
function startAutoCheck() {
  clearInterval(state.timer);
  clearInterval(state.countdown);
  $('countdown-text').textContent = '';

  const mins = +$('check-interval').value;
  if (mins === 0) return;

  state.secsLeft = mins * 60;
  state.countdown = setInterval(() => {
    state.secsLeft--;
    const m = Math.floor(state.secsLeft / 60);
    const s = state.secsLeft % 60;
    $('countdown-text').textContent =
      `Next check in ${m > 0 ? m + 'm ' : ''}${s < 10 ? '0' : ''}${s}s`;
    if (state.secsLeft <= 0) {
      state.secsLeft = mins * 60;
      runCheck(true);
    }
  }, 1000);
}

/* ══════════════════════════════════════════════════════════════
   GPS location
══════════════════════════════════════════════════════════════ */
function useGPS() {
  if (!navigator.geolocation) {
    setSaveStatus('Geolocation not supported in this browser.', 'error');
    return;
  }
  setSaveStatus('Getting location…', '');
  navigator.geolocation.getCurrentPosition(
    pos => {
      state.lat = pos.coords.latitude;
      state.lon = pos.coords.longitude;
      $('city-input').value = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      setSaveStatus('GPS location set', 'ok');
    },
    err => setSaveStatus(`GPS error: ${err.message}`, 'error')
  );
}

/* ══════════════════════════════════════════════════════════════
   Config panel collapse
══════════════════════════════════════════════════════════════ */
function toggleConfig() {
  const body   = $('config-body');
  const btn    = $('config-toggle');
  const hidden = body.style.display === 'none';
  body.style.display = hidden ? '' : 'none';
  btn.classList.toggle('collapsed', !hidden);
  btn.setAttribute('aria-expanded', hidden ? 'true' : 'false');
}

/* ══════════════════════════════════════════════════════════════
   Boot
══════════════════════════════════════════════════════════════ */
function boot() {
  loadSettings();
  renderLog();

  /* Range sliders */
  ['rain-threshold','wind-threshold','cold-threshold','hot-threshold'].forEach(id => {
    $(id).addEventListener('input', updateRangeLabels);
  });

  /* Units change → update labels */
  $('units').addEventListener('change', updateRangeLabels);

  /* Show/hide password */
  document.querySelectorAll('.btn-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = $(btn.dataset.target);
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });
  });

  /* Chat ID help */
  $('help-chatid').addEventListener('click', e => {
    e.preventDefault();
    const box = $('chatid-help');
    box.style.display = box.style.display === 'none' ? '' : 'none';
  });

  /* GPS */
  $('btn-locate').addEventListener('click', useGPS);

  /* Collapse */
  $('config-toggle').addEventListener('click', toggleConfig);
  $('setup-section').querySelector('.card-header').addEventListener('click', e => {
    if (!e.target.closest('.btn-collapse')) return;
    toggleConfig();
  });

  /* Save */
  $('btn-save').addEventListener('click', () => {
    saveSettings();
    setSaveStatus('Settings saved!', 'ok');
    startAutoCheck();
  });

  /* Test Telegram */
  $('btn-test').addEventListener('click', async () => {
    $('btn-test').disabled = true;
    setSaveStatus('Sending test message…', '');
    try {
      await sendTelegram('⛈️ <b>Weather Alert Bot</b>\n\nThis is a test message. Your bot is working correctly! ✅');
      setSaveStatus('Test message sent!', 'ok');
      addLog('sent', 'Test Telegram message sent successfully');
    } catch(e) {
      setSaveStatus(`Failed: ${e.message}`, 'error');
      addLog('error', `Test message failed: ${e.message}`);
    } finally {
      $('btn-test').disabled = false;
    }
  });

  /* Check Now */
  $('btn-check').addEventListener('click', () => {
    saveSettings();
    runCheck(true).then(startAutoCheck);
  });

  /* Clear log */
  $('btn-clear-log').addEventListener('click', () => {
    state.alertLog = [];
    persistLog();
    renderLog();
  });

  /* Theme */
  $('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    applyTheme(isDark ? '' : 'dark');
    localStorage.setItem(KEYS.dark, isDark ? '0' : '1');
  });

  /* Pre-fill Telegram credentials if not already saved */
  if (!$('tg-token').value) $('tg-token').value = '8798851349:AAGzPlN9ziy27LYXd-Vg1ZNOCMHxD8Gh_Hs';
  if (!$('tg-chat').value)  $('tg-chat').value  = '8451647969';

  /* Auto-start if settings already saved */
  if ($('owm-key').value && ($('city-input').value || (state.lat && state.lon))) {
    runCheck(false).then(startAutoCheck);
  }
}

document.addEventListener('DOMContentLoaded', boot);
