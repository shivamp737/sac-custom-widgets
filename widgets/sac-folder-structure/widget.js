/* SAC Folder Structure Widget — com-custom-sac-folder-structure */
const WIDGET_TAG = 'com-shivam-sacfolderstructure';

const WIDGET_CSS = `
.fs-root *, .fs-root *::before, .fs-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
com-shivam-sacfolderstructure { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; display: block; height: 100%; }
.fs-root { display: flex; flex-direction: column; height: 100%; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; background: #fff; }

/* Header */
.fs-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #1f3250; flex-shrink: 0; }
.fs-header-title { font-weight: 600; color: #fff; font-size: 13px; }
.fs-header-right { display: flex; align-items: center; gap: 8px; }
.fs-gear-btn { background: transparent; color: #ccc; border: 1px solid #4a6080; border-radius: 4px; padding: 3px 9px; font-size: 11px; cursor: pointer; }
.fs-gear-btn:hover { background: #2a4a70; color: #fff; }
.fs-badge { font-size: 9px; padding: 2px 7px; border-radius: 3px; font-weight: 700; letter-spacing: 0.5px; }
.fs-badge-idle    { background: #333; color: #888; }
.fs-badge-running { background: #1a4a8a; color: #66aaff; }
.fs-badge-done    { background: #1a4a2a; color: #00cc66; }
.fs-badge-error   { background: #4a1a1a; color: #ff6b6b; }

/* Settings panel */
.fs-settings { background: #fafafa; border-bottom: 1px solid #ddd; padding: 12px 16px; z-index: 10; box-shadow: 0 4px 8px rgba(0,0,0,0.10); flex-shrink: 0; }
.fs-settings-title { font-size: 10px; font-weight: 700; color: #555; letter-spacing: 0.5px; margin-bottom: 10px; }
.fs-settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
.fs-settings-grid label { display: flex; flex-direction: column; font-size: 10px; color: #888; gap: 2px; }
.fs-settings-grid input { border: 1px solid #e0e0e0; border-radius: 3px; padding: 4px 6px; font-size: 11px; color: #333; background: white; }
.fs-settings-grid input:focus { outline: none; border-color: #1f3250; }
.fs-settings-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; }
.fs-settings-actions button { border-radius: 3px; padding: 5px 12px; font-size: 11px; cursor: pointer; border: 1px solid #e0e0e0; background: white; color: #555; }

/* Toolbar */
.fs-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid #e8e8e8; flex-shrink: 0; background: #f9f9f9; }
.fs-search { flex: 1; border: 1px solid #ddd; border-radius: 3px; padding: 5px 8px; font-size: 11px; color: #333; }
.fs-search:focus { outline: none; border-color: #1f3250; }
.fs-type-filter { border: 1px solid #ddd; border-radius: 3px; padding: 5px 6px; font-size: 11px; color: #333; background: white; cursor: pointer; }
.fs-count-badge { background: #e8eef5; color: #1f3250; border-radius: 10px; padding: 2px 8px; font-size: 10px; font-weight: 700; white-space: nowrap; }
.fs-btn-primary { background: #1f3250; color: white; border: none; border-radius: 4px; padding: 6px 12px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.fs-btn-primary:hover { background: #2a4a70; }
.fs-btn-primary:disabled { background: #9ab0c8; cursor: default; }
.fs-btn-stop { background: #f5f5f5; color: #888; border: 1px solid #e0e0e0; border-radius: 4px; padding: 6px 10px; font-size: 11px; cursor: pointer; }
.fs-btn-stop:hover { background: #ffe0e0; color: #c00; }
.fs-btn-stop:disabled { opacity: 0.4; cursor: default; }
.fs-btn-csv { background: #1a4a2a; color: #00cc66; border: 1px solid #00cc66; border-radius: 3px; padding: 5px 10px; font-size: 10px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.fs-btn-csv:hover { background: #0d3a1d; }
.fs-btn-csv:disabled { opacity: 0.3; cursor: default; }

/* Body — table + log */
.fs-body { display: flex; flex-direction: column; flex: 1; overflow: hidden; }

/* Table */
.fs-table-wrap { flex: 1; overflow: auto; }
.fs-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.fs-table thead th { position: sticky; top: 0; background: #1f3250; color: #fff; font-weight: 600; padding: 7px 10px; text-align: left; white-space: nowrap; border-right: 1px solid #2a4a70; cursor: pointer; user-select: none; }
.fs-table thead th:hover { background: #2a4a70; }
.fs-table thead th.sorted-asc::after  { content: ' ▲'; font-size: 9px; }
.fs-table thead th.sorted-desc::after { content: ' ▼'; font-size: 9px; }
.fs-table tbody tr:nth-child(even) { background: #f7f9fb; }
.fs-table tbody tr:hover { background: #e8f0fb; }
.fs-table tbody td { padding: 5px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: top; white-space: nowrap; max-width: 300px; overflow: hidden; text-overflow: ellipsis; }
.fs-table tbody td.fs-path { font-size: 10px; color: #555; max-width: 400px; }
.fs-type-chip { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: 700; letter-spacing: 0.3px; }

/* Summary bar */
.fs-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 6px 12px; border-top: 1px solid #e8e8e8; background: #f5f7fa; flex-shrink: 0; }
.fs-summary-label { font-size: 10px; color: #666; font-weight: 600; margin-right: 4px; }
.fs-summary-chip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
.fs-summary-chip:hover { opacity: 0.8; }
.fs-summary-chip.active { border-color: #1f3250; }
.fs-summary-chip-count { font-weight: 700; }

/* Log (shown while fetching) */
.fs-log-wrap { border-top: 1px solid #222; background: #111; flex-shrink: 0; max-height: 120px; overflow-y: auto; padding: 6px 12px; font-family: 'Courier New', monospace; font-size: 10px; line-height: 1.7; color: #ccc; display: none; }
.fs-log-error   { color: #ff6b6b; }
.fs-log-success { color: #00cc66; }
.fs-log-warn    { color: #ffc107; }

/* Empty state */
.fs-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: #aaa; font-size: 12px; padding: 20px; }

/* Help modal */
.fs-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.fs-modal { background: #fff; border-radius: 6px; width: 560px; max-width: 92vw; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.25); overflow: hidden; }
.fs-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #1f3250; }
.fs-modal-header h2 { color: #fff; font-size: 13px; font-weight: 700; margin: 0; }
.fs-modal-close { background: transparent; border: none; color: #aac; font-size: 18px; cursor: pointer; line-height: 1; padding: 0 4px; }
.fs-modal-close:hover { color: #fff; }
.fs-modal-body { overflow-y: auto; padding: 16px 20px; font-size: 12px; line-height: 1.7; color: #333; }
.fs-modal-body h3 { font-size: 11px; font-weight: 700; color: #1f3250; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 6px; border-bottom: 1px solid #e0e8f0; padding-bottom: 4px; }
.fs-modal-body h3:first-child { margin-top: 0; }
.fs-modal-body p { margin: 0 0 8px; }
.fs-modal-body ul { padding-left: 18px; margin: 0 0 8px; }
.fs-modal-body li { margin-bottom: 3px; }
.fs-modal-body code { background: #f0f4f8; border: 1px solid #dde; border-radius: 3px; padding: 1px 5px; font-size: 10px; font-family: 'Courier New', monospace; }
.fs-modal-body table { width: 100%; border-collapse: collapse; margin: 6px 0 10px; font-size: 11px; }
.fs-modal-body th { background: #1f3250; color: #fff; padding: 5px 8px; text-align: left; font-weight: 600; }
.fs-modal-body td { padding: 4px 8px; border-bottom: 1px solid #eee; }
.fs-modal-body tr:nth-child(even) td { background: #f7f9fb; }
.fs-step { display: flex; gap: 10px; margin-bottom: 8px; }
.fs-step-num { background: #1f3250; color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
`;

// ─────────────────────────────────────────────
// TYPE CONFIG
// ─────────────────────────────────────────────

const TYPE_MAP = {
  FOLDER:           { label: 'Folder',            bg: '#e2efda', color: '#276221' },
  STORY:            { label: 'Story',              bg: '#ddeeff', color: '#0050a0' },
  CUBE:             { label: 'Model',              bg: '#fff2cc', color: '#7a6000' },
  PLANNINGSEQUENCE: { label: 'Planning Seq',       bg: '#fff2cc', color: '#7a6000' },
  DATAACTION:       { label: 'Data Action',        bg: '#fce4d6', color: '#a02000' },
  MULTIACTIONS:     { label: 'Multi Action',       bg: '#fce4d6', color: '#a02000' },
  DIMENSION:        { label: 'Dimension',          bg: '#f3e5f5', color: '#6a0080' },
  DATASET:          { label: 'Dataset',            bg: '#e0f7fa', color: '#006064' },
  KPIWORKSPACE:     { label: 'Dig. Boardroom',     bg: '#f3e5f5', color: '#6a0080' },
  PREDICTIVESCENARIO: { label: 'Predictive',       bg: '#e8f5e9', color: '#1b5e20' },
  ADDIN_WORKBOOK:   { label: 'Excel Workbook',     bg: '#e8f5e9', color: '#1b5e20' },
};

function typeLabel(raw) { return (TYPE_MAP[raw] || {}).label || raw; }
function typeBg(raw)    { return (TYPE_MAP[raw] || {}).bg || '#f0f0f0'; }
function typeColor(raw) { return (TYPE_MAP[raw] || {}).color || '#333'; }

function fmtTime(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return ts; }
}

// ─────────────────────────────────────────────
// LOCAL STORAGE
// ─────────────────────────────────────────────

function lsLoad(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}
function lsSave(key, obj) {
  try { localStorage.setItem(key, JSON.stringify(obj)); } catch {}
}

// ─────────────────────────────────────────────
// OAUTH CLIENT
// ─────────────────────────────────────────────

class OAuthClient {
  constructor(tokenUrl, clientId, clientSecret) {
    this.tokenUrl     = tokenUrl;
    this.clientId     = clientId;
    this.clientSecret = clientSecret;
    this._token       = null;
    this._expiresAt   = 0;
  }

  async fetch(signal) {
    const body = new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     this.clientId,
      client_secret: this.clientSecret,
    });
    const resp = await fetch(this.tokenUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
      signal,
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`OAuth ${resp.status}: ${text.slice(0, 200)}`);
    }
    const json = await resp.json();
    this._token     = json.access_token;
    this._expiresAt = Date.now() + ((json.expires_in || 3600) - 60) * 1000;
    return this._token;
  }

  async get(signal, force = false) {
    if (!force && this._token && Date.now() < this._expiresAt) return this._token;
    return this.fetch(signal);
  }
}

// ─────────────────────────────────────────────
// CSRF CLIENT
// ─────────────────────────────────────────────

class CsrfClient {
  constructor(baseUrl) {
    this.baseUrl    = baseUrl.replace(/\/$/, '');
    this._token     = null;
    this._lastFetch = 0;
    this._maxAgeMs  = 10 * 60 * 1000;
  }

  async fetch(bearerToken, signal) {
    const resp = await fetch(`${this.baseUrl}/api/v1/scim/Groups`, {
      method:  'GET',
      headers: {
        'Authorization':       `Bearer ${bearerToken}`,
        'x-csrf-token':        'fetch',
        'x-sap-sac-custom-auth': 'true',
        'Accept':              'application/json',
      },
      signal,
    });
    const token = resp.headers.get('x-csrf-token') || resp.headers.get('X-CSRF-Token');
    if (!token) throw new Error(`CSRF fetch failed: HTTP ${resp.status}`);
    this._token     = token;
    this._lastFetch = Date.now();
    return token;
  }

  async get(bearerToken, signal, force = false) {
    if (!force && this._token && (Date.now() - this._lastFetch) < this._maxAgeMs) return this._token;
    return this.fetch(bearerToken, signal);
  }
}

// ─────────────────────────────────────────────
// FETCH ALL RESOURCES
// ─────────────────────────────────────────────

async function fetchAllResources(baseUrl, bearerToken, csrfToken, logFn, signal) {
  const apiBase = `${baseUrl}/api/v1/filerepository/`;
  const filter  = "ancestorFolders/any(a:a/resourceId eq 'PUBLIC')";
  const resources = [];

  let url = `${apiBase}Resources?applyManagePrivilege=true&$expand=ancestorFolders&$filter=${encodeURIComponent(filter)}&$count=true`;

  while (url) {
    if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const resp = await fetch(url, {
      headers: {
        'Authorization':       `Bearer ${bearerToken}`,
        'x-sap-sac-custom-auth': 'true',
        'x-csrf-token':        csrfToken,
        'Accept':              'application/json',
      },
      signal,
    });
    if (!resp.ok) throw new Error(`File repository API: HTTP ${resp.status}`);
    const data  = await resp.json();
    const batch = data.value || [];
    resources.push(...batch);
    logFn(`Fetched ${resources.length}${data['@odata.count'] ? ' / ' + data['@odata.count'] : ''} resources...`);
    const nextLink = data['@odata.nextLink'];
    url = nextLink ? apiBase + nextLink : null;
  }

  return resources;
}

// ─────────────────────────────────────────────
// BUILD PATHS
// ─────────────────────────────────────────────

function buildPaths(resources) {
  const byId = {};
  resources.forEach(r => { byId[r.resourceId] = r; });
  const paths = {};

  function resolve(rid) {
    if (rid in paths) return paths[rid];
    const node     = byId[rid];
    if (!node) return '';
    const parentId = node.parentFolderResourceId;
    if (!parentId || parentId === 'PUBLIC') {
      paths[rid] = node.name;
    } else {
      const pp = resolve(parentId);
      paths[rid] = pp ? `${pp}/${node.name}` : node.name;
    }
    return paths[rid];
  }

  resources.forEach(r => resolve(r.resourceId));
  return paths;
}

// ─────────────────────────────────────────────
// BUILD ROWS
// ─────────────────────────────────────────────

function buildRows(resources, paths) {
  return resources.map(node => ({
    path:       paths[node.resourceId] || node.name,
    name:       node.name,
    type:       node.resourceType,
    owner:      node.createdBy || '',
    createdOn:  node.createdTime || '',
    changedOn:  node.modifiedTime || '',
    changedBy:  node.modifiedBy || '',
    resourceId: node.resourceId,
    parentId:   node.parentFolderResourceId || '',
  })).sort((a, b) => a.path.toLowerCase().localeCompare(b.path.toLowerCase()));
}

// ─────────────────────────────────────────────
// SHEETJS LOADER
// ─────────────────────────────────────────────

let _xlsxPromise = null;
function loadXlsx() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (_xlsxPromise) return _xlsxPromise;
  _xlsxPromise = new Promise((resolve, reject) => {
    const s   = document.createElement('script');
    s.src     = 'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js';
    s.onload  = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error('Failed to load SheetJS'));
    document.head.appendChild(s);
  });
  return _xlsxPromise;
}

// ─────────────────────────────────────────────
// XLSX EXPORT  (3 sheets — matches Python output)
// ─────────────────────────────────────────────

async function exportXlsx(allRows) {
  const XLSX = await loadXlsx();
  const wb   = XLSX.utils.book_new();
  const date = new Date().toISOString().slice(0, 10);

  // ── Sheet 1: SAC Structure ──────────────────
  const headers1 = ['Path', 'Name', 'Description', 'Type', 'Owner', 'Created On', 'Changed By', 'Changed On', 'Resource ID'];
  const data1    = [
    headers1,
    ...allRows.map(r => [
      r.path,
      r.name,
      '',
      typeLabel(r.type),
      r.owner,
      fmtTime(r.createdOn),
      r.changedBy,
      fmtTime(r.changedOn),
      r.resourceId,
    ]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(data1);
  ws1['!cols'] = [
    { wch: 50 }, { wch: 30 }, { wch: 28 }, { wch: 18 },
    { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 36 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'SAC Structure');

  // ── Sheet 2: Level Breakdown ────────────────
  const maxDepth = Math.max(...allRows.map(r => r.path.split('/').length - 1), 0);
  const header2  = ['Level', ...Array.from({ length: maxDepth + 1 }, (_, i) => String(i))];
  const data2    = [header2];
  allRows.forEach(r => {
    const depth = r.path.split('/').length - 1;
    const row   = new Array(maxDepth + 2).fill('');
    row[0]      = '';
    row[depth + 1] = `${r.name} (${typeLabel(r.type)})`;
    data2.push(row);
  });
  const ws2    = XLSX.utils.aoa_to_sheet(data2);
  ws2['!cols'] = [{ wch: 8 }, ...Array.from({ length: maxDepth + 1 }, () => ({ wch: 30 }))];
  XLSX.utils.book_append_sheet(wb, ws2, 'Level Breakdown');

  // ── Sheet 3: Type Breakdown ─────────────────
  const counts = {};
  allRows.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
  const sortedTypes = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const data3 = [
    ['Type', 'Count'],
    ...sortedTypes.map(([t, n]) => [typeLabel(t), n]),
    ['Total', allRows.length],
  ];
  const ws3    = XLSX.utils.aoa_to_sheet(data3);
  ws3['!cols'] = [{ wch: 25 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Type Breakdown');

  // ── Write & download ────────────────────────
  XLSX.writeFile(wb, `SAC_Folder_Structure_${date}.xlsx`);
}

// ─────────────────────────────────────────────
// WIDGET CLASS
// ─────────────────────────────────────────────

class SacFolderStructureWidget extends HTMLElement {
  constructor() {
    super();
    this._props    = {};
    this._rendered = false;
    this._allRows  = [];
    this._sortCol  = 'path';
    this._sortAsc  = true;
    this._typeFilter = '';
    this._search     = '';
  }

  connectedCallback() {
    if (!this._rendered) {
      this._injectStyles();
      this._render();
      this._bindEvents();
      this._rendered = true;
    }
  }

  onCustomWidgetAfterUpdate(changed) {
    if (changed) Object.assign(this._props, changed);
  }

  _lsKey() { return 'sac_fs_' + (this._props.instanceId || 'default'); }

  _loadSettings() {
    const s = lsLoad(this._lsKey());
    return {
      tokenUrl: s.tokenUrl || '',
      baseUrl:  s.baseUrl  || '',
      clientId: s.clientId || '',
      secret:   s.secret   || '',
    };
  }

  _injectStyles() {
    if (document.getElementById('fs-styles')) return;
    const s    = document.createElement('style');
    s.id       = 'fs-styles';
    s.textContent = WIDGET_CSS;
    document.head.appendChild(s);
  }

  _render() {
    this.innerHTML = `
      <div class="fs-root">

        <!-- HEADER -->
        <div class="fs-header">
          <span class="fs-header-title">SAC Folder Structure</span>
          <div class="fs-header-right">
            <button id="fs-gear-btn" class="fs-gear-btn">⚙ Settings</button>
            <button id="fs-help-btn" class="fs-gear-btn">? Help</button>
            <span id="fs-status" class="fs-badge fs-badge-idle">IDLE</span>
          </div>
        </div>

        <!-- SETTINGS PANEL -->
        <div id="fs-settings" class="fs-settings" style="display:none;">
          <div class="fs-settings-title">CONNECTION SETTINGS</div>
          <div class="fs-settings-grid">
            <label>Base URL (SAC Tenant)<input id="fs-baseUrl"  type="text"     placeholder="https://tenant.region.analytics.cloud.sap" /></label>
            <label>Token URL<input             id="fs-tokenUrl" type="text"     placeholder="https://tenant.authentication.region.hana.ondemand.com/oauth/token" /></label>
            <label>Client ID<input             id="fs-clientId" type="text"     placeholder="sb-..." /></label>
            <label>Secret<input                id="fs-secret"   type="password" placeholder="••••••••" /></label>
          </div>
          <div class="fs-settings-actions">
            <button id="fs-cancel-btn">Cancel</button>
            <button id="fs-save-btn" class="fs-btn-primary">Save</button>
          </div>
        </div>

        <!-- TOOLBAR -->
        <div class="fs-toolbar">
          <input id="fs-search"      class="fs-search"      type="text"  placeholder="Search name or path..." />
          <select id="fs-type-filter" class="fs-type-filter"><option value="">All Types</option></select>
          <span   id="fs-count"      class="fs-count-badge">0 items</span>
          <button id="fs-fetch-btn"  class="fs-btn-primary">▶ Fetch</button>
          <button id="fs-stop-btn"   class="fs-btn-stop" disabled>⏹</button>
          <button id="fs-csv-btn"    class="fs-btn-csv"  disabled>⬇ Excel</button>
        </div>

        <!-- BODY -->
        <div class="fs-body">
          <div id="fs-table-wrap" class="fs-table-wrap">
            <div class="fs-empty">Configure settings and click ▶ Fetch to load the folder structure.</div>
          </div>
          <div id="fs-log" class="fs-log-wrap"></div>
        </div>

        <!-- SUMMARY BAR -->
        <div id="fs-summary" class="fs-summary" style="display:none;">
          <span class="fs-summary-label">Filter by type:</span>
        </div>

      </div>
    `;
  }

  _bindEvents() {
    // Gear / Settings
    const gearBtn   = this.querySelector('#fs-gear-btn');
    const panel     = this.querySelector('#fs-settings');
    const saveBtn   = this.querySelector('#fs-save-btn');
    const cancelBtn = this.querySelector('#fs-cancel-btn');

    gearBtn.addEventListener('click', () => {
      const hidden = panel.style.display === 'none';
      if (hidden) {
        const s = this._loadSettings();
        this.querySelector('#fs-baseUrl').value  = s.baseUrl;
        this.querySelector('#fs-tokenUrl').value = s.tokenUrl;
        this.querySelector('#fs-clientId').value = s.clientId;
        this.querySelector('#fs-secret').value   = s.secret;
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    });

    saveBtn.addEventListener('click', () => {
      lsSave(this._lsKey(), {
        baseUrl:  this.querySelector('#fs-baseUrl').value.trim(),
        tokenUrl: this.querySelector('#fs-tokenUrl').value.trim(),
        clientId: this.querySelector('#fs-clientId').value.trim(),
        secret:   this.querySelector('#fs-secret').value.trim(),
      });
      panel.style.display = 'none';
      this._log('Settings saved.');
    });

    cancelBtn.addEventListener('click', () => { panel.style.display = 'none'; });

    // Help modal
    this.querySelector('#fs-help-btn').addEventListener('click', () => this._showHelp());

    // Search
    this.querySelector('#fs-search').addEventListener('input', e => {
      this._search = e.target.value.toLowerCase();
      this._renderTable();
    });

    // Type filter dropdown
    this.querySelector('#fs-type-filter').addEventListener('change', e => {
      this._typeFilter = e.target.value;
      this._renderTable();
    });

    // CSV
    this.querySelector('#fs-csv-btn').addEventListener('click', () => {
      exportXlsx(this._allRows).catch(err => this._log(`Export error: ${err.message}`));
    });

    // Fetch / Stop
    this.querySelector('#fs-fetch-btn').addEventListener('click', () => this._runFetch());
    this.querySelector('#fs-stop-btn').addEventListener('click', () => {
      if (this._abortCtl) this._abortCtl.abort();
    });
  }

  _showHelp() {
    if (document.getElementById('fs-help-modal')) return;
    const overlay = document.createElement('div');
    overlay.id        = 'fs-help-modal';
    overlay.className = 'fs-modal-overlay';
    overlay.innerHTML = `
      <div class="fs-modal">
        <div class="fs-modal-header">
          <h2>SAC Folder Structure — Help</h2>
          <button class="fs-modal-close" id="fs-modal-close-btn">✕</button>
        </div>
        <div class="fs-modal-body">

          <h3>Prerequisites</h3>
          <p>An OAuth Client must be created in SAC with the following settings:</p>
          <ul>
            <li>Go to <strong>System → Administration → App Integration → OAuth Clients</strong></li>
            <li><strong>Authorization Grant:</strong> Client Credentials</li>
            <li><strong>Access:</strong> File Repository Read</li>
            <li>The client user must have <strong>Manage permission on Public Files and Private Files</strong></li>
          </ul>

          <h3>Setup</h3>
          <p>Click <strong>⚙ Settings</strong> and fill in:</p>
          <ul>
            <li><strong>Base URL</strong> — e.g. <code>https://tenant.region.analytics.cloud.sap</code></li>
            <li><strong>Token URL</strong> — e.g. <code>https://tenant.authentication.region.hana.ondemand.com/oauth/token</code></li>
            <li><strong>Client ID</strong> — OAuth Client ID from SAC App Integration</li>
            <li><strong>Secret</strong> — OAuth Client Secret</li>
          </ul>
          <p>Settings are saved in browser local storage — you only need to enter them once.</p>

          <h3>How to Use</h3>
          <div class="fs-step"><div class="fs-step-num">1</div><div>Click <strong>⚙ Settings</strong>, enter your credentials and click Save.</div></div>
          <div class="fs-step"><div class="fs-step-num">2</div><div>Click <strong>▶ Fetch</strong> to load all resources from the Public folder. Progress is shown in the log panel.</div></div>
          <div class="fs-step"><div class="fs-step-num">3</div><div>Use the <strong>Search</strong> box to filter by name or path. Use the <strong>Type</strong> dropdown or the summary chips to filter by resource type.</div></div>
          <div class="fs-step"><div class="fs-step-num">4</div><div>Click any column header to sort. Click again to reverse the sort order.</div></div>
          <div class="fs-step"><div class="fs-step-num">5</div><div>Click <strong>⬇ Excel</strong> to download the full dataset (all resources, not just filtered view) as a .xlsx file with 3 sheets.</div></div>

          <h3>Excel Output Sheets</h3>
          <table>
            <tr><th>Sheet</th><th>Description</th></tr>
            <tr><td><strong>SAC Structure</strong></td><td>Full resource list — Path, Name, Type, Owner, Created On, Changed By, Changed On, Resource ID</td></tr>
            <tr><td><strong>Level Breakdown</strong></td><td>Resources placed in columns by folder depth (Level 0, 1, 2 …). Shows folder tree visually.</td></tr>
            <tr><td><strong>Type Breakdown</strong></td><td>Count per resource type, sorted by count, with a Total row.</td></tr>
          </table>

          <h3>Resource Types</h3>
          <table>
            <tr><th>Type</th><th>Display Label</th></tr>
            <tr><td>FOLDER</td><td>Folder</td></tr>
            <tr><td>STORY</td><td>Story</td></tr>
            <tr><td>CUBE</td><td>Model</td></tr>
            <tr><td>PLANNINGSEQUENCE</td><td>Planning Seq</td></tr>
            <tr><td>MULTIACTIONS</td><td>Multi Action</td></tr>
            <tr><td>DIMENSION</td><td>Dimension</td></tr>
            <tr><td>DATASET</td><td>Dataset</td></tr>
            <tr><td>ADDIN_WORKBOOK</td><td>Excel Workbook</td></tr>
            <tr><td>PREDICTIVESCENARIO</td><td>Predictive</td></tr>
            <tr><td>Others</td><td>Raw API type name</td></tr>
          </table>

          <h3>How It Works</h3>
          <ul>
            <li>Authenticates via <strong>OAuth 2.0 Client Credentials</strong> grant</li>
            <li>Fetches a <strong>CSRF token</strong> required for SAC browser-domain API calls</li>
            <li>Calls <code>/api/v1/filerepository/Resources</code> with <code>applyManagePrivilege=true</code> and filters to Public folder only</li>
            <li>Follows <code>@odata.nextLink</code> pagination (50 items per page)</li>
            <li>Reconstructs full folder paths from <code>parentFolderResourceId</code> references</li>
          </ul>

        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#fs-modal-close-btn').addEventListener('click', () => overlay.remove());
  }

  _log(msg) {
    const log = this.querySelector('#fs-log');
    if (!log) return;
    const line = document.createElement('div');
    const ts   = new Date().toTimeString().slice(0, 8);
    line.textContent = `[${ts}] ${msg}`;
    if (/error|fail/i.test(msg))   line.classList.add('fs-log-error');
    else if (/warn/i.test(msg))    line.classList.add('fs-log-warn');
    else if (/done|ok|saved/i.test(msg)) line.classList.add('fs-log-success');
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  _setStatus(s) {
    const badge = this.querySelector('#fs-status');
    if (!badge) return;
    badge.textContent = s.toUpperCase();
    badge.className   = 'fs-badge fs-badge-' + s;
  }

  async _runFetch() {
    const cfg = this._loadSettings();
    if (!cfg.baseUrl || !cfg.tokenUrl || !cfg.clientId || !cfg.secret) {
      this._log('Configure settings first (⚙ Settings).');
      return;
    }

    // Show log, reset state
    const logWrap = this.querySelector('#fs-log');
    logWrap.innerHTML   = '';
    logWrap.style.display = 'block';
    this.querySelector('#fs-table-wrap').innerHTML = '<div class="fs-empty">Loading...</div>';
    this.querySelector('#fs-fetch-btn').disabled   = true;
    this.querySelector('#fs-stop-btn').disabled    = false;
    this.querySelector('#fs-csv-btn').disabled     = true;
    this._setStatus('running');

    this._abortCtl = new AbortController();
    const signal   = this._abortCtl.signal;

    try {
      this._log('Fetching OAuth token...');
      const oauth = new OAuthClient(cfg.tokenUrl, cfg.clientId, cfg.secret);
      const token = await oauth.fetch(signal);
      this._log('Token OK');

      this._log('Fetching CSRF token...');
      const csrf  = new CsrfClient(cfg.baseUrl);
      const csrfToken = await csrf.fetch(token, signal);
      this._log('CSRF OK');

      this._log('Fetching resources (Public folder)...');
      const resources = await fetchAllResources(cfg.baseUrl, token, csrfToken, (m) => this._log(m), signal);
      this._log(`Total: ${resources.length} resources`);

      this._log('Building paths...');
      const paths = buildPaths(resources);
      this._allRows = buildRows(resources, paths);

      this._renderTypeFilter();
      this._renderSummary();
      this._renderTable();

      this.querySelector('#fs-csv-btn').disabled = false;
      this._setStatus('done');
      this._log('Done.');
    } catch (err) {
      if (err.name === 'AbortError') {
        this._log('Stopped by user.');
        this._setStatus('idle');
      } else {
        this._log(`Error: ${err.message}`);
        this._setStatus('error');
      }
    } finally {
      this.querySelector('#fs-fetch-btn').disabled = false;
      this.querySelector('#fs-stop-btn').disabled  = true;
      this._abortCtl = null;
    }
  }

  _filteredRows() {
    return this._allRows.filter(r => {
      const matchType   = !this._typeFilter || r.type === this._typeFilter;
      const matchSearch = !this._search
        || r.name.toLowerCase().includes(this._search)
        || r.path.toLowerCase().includes(this._search);
      return matchType && matchSearch;
    });
  }

  _renderTypeFilter() {
    const sel    = this.querySelector('#fs-type-filter');
    const types  = [...new Set(this._allRows.map(r => r.type))].sort();
    const cur    = sel.value;
    sel.innerHTML = '<option value="">All Types</option>';
    types.forEach(t => {
      const o   = document.createElement('option');
      o.value   = t;
      o.text    = `${typeLabel(t)} (${this._allRows.filter(r => r.type === t).length})`;
      sel.appendChild(o);
    });
    if (types.includes(cur)) sel.value = cur;
  }

  _renderSummary() {
    const summary = this.querySelector('#fs-summary');
    const counts  = {};
    this._allRows.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });

    const chips = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => {
        const active = this._typeFilter === type ? 'active' : '';
        return `<span class="fs-summary-chip ${active}"
          style="background:${typeBg(type)};color:${typeColor(type)};"
          data-type="${type}">
          ${typeLabel(type)} <span class="fs-summary-chip-count">${count}</span>
        </span>`;
      }).join('');

    summary.innerHTML = `<span class="fs-summary-label">Filter by type:</span>${chips}
      <span class="fs-summary-chip" data-type="" style="background:#f0f0f0;color:#555;">
        All <span class="fs-summary-chip-count">${this._allRows.length}</span>
      </span>`;
    summary.style.display = 'flex';

    summary.querySelectorAll('.fs-summary-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this._typeFilter = chip.dataset.type;
        this.querySelector('#fs-type-filter').value = this._typeFilter;
        this._renderSummary();
        this._renderTable();
      });
    });
  }

  _renderTable() {
    const rows = this._filteredRows();

    // Sort
    rows.sort((a, b) => {
      const va = (a[this._sortCol] || '').toString().toLowerCase();
      const vb = (b[this._sortCol] || '').toString().toLowerCase();
      return this._sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });

    // Count
    const countBadge = this.querySelector('#fs-count');
    if (countBadge) countBadge.textContent = `${rows.length} item${rows.length !== 1 ? 's' : ''}`;

    const cols = [
      { key: 'path',      label: 'Path' },
      { key: 'name',      label: 'Name' },
      { key: 'type',      label: 'Type' },
      { key: 'owner',     label: 'Owner' },
      { key: 'createdOn', label: 'Created' },
      { key: 'changedOn', label: 'Modified' },
    ];

    const headerCells = cols.map(c => {
      const cls = c.key === this._sortCol
        ? (this._sortAsc ? 'sorted-asc' : 'sorted-desc') : '';
      return `<th class="${cls}" data-col="${c.key}">${c.label}</th>`;
    }).join('');

    const bodyRows = rows.map(r => `
      <tr>
        <td class="fs-path" title="${r.path}">${r.path}</td>
        <td title="${r.name}">${r.name}</td>
        <td><span class="fs-type-chip" style="background:${typeBg(r.type)};color:${typeColor(r.type)};">${typeLabel(r.type)}</span></td>
        <td>${r.owner}</td>
        <td>${fmtTime(r.createdOn)}</td>
        <td>${fmtTime(r.changedOn)}</td>
      </tr>`).join('');

    const wrap = this.querySelector('#fs-table-wrap');
    if (rows.length === 0) {
      wrap.innerHTML = '<div class="fs-empty">No results match your filter.</div>';
      return;
    }

    wrap.innerHTML = `
      <table class="fs-table">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>`;

    // Sort click
    wrap.querySelectorAll('thead th').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (this._sortCol === col) {
          this._sortAsc = !this._sortAsc;
        } else {
          this._sortCol = col;
          this._sortAsc = true;
        }
        this._renderTable();
      });
    });
  }
}

customElements.define(WIDGET_TAG, SacFolderStructureWidget);
