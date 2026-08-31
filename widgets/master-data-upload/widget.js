/* SAC Master Data Upload Widget — com-custom-md-upload */
(function () {

  // ── Load SheetJS from CDN (jsdelivr confirmed to work in SAC) ─────────────
  let _xlsxPromise = null;
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (_xlsxPromise) return _xlsxPromise;
    _xlsxPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      s.onload = () => resolve(window.XLSX);
      s.onerror = () => reject(new Error('Failed to load SheetJS'));
      document.head.appendChild(s);
    });
    return _xlsxPromise;
  }

  // ── Column mapping: Excel header → SAC field name ─────────────────────────
  const COL_MAP = {
    'Material Number':      'ID',
    'Description':          'Description',
    'Material Type':        'Material_Type',
    'Material Group':       'Material_Group',
    'Base Unit of Measure': 'UoM',
    'Weight (KG)':          'Weight',
    'Plant':                'Plant',
    'Status':               'Status',
  };

  // ── CSS ───────────────────────────────────────────────────────────────────
  const CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :host { display: block; height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; }
    .root { display: flex; flex-direction: column; height: 100%; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #1F4E79; flex-shrink: 0; }
    .header-title { font-weight: 700; color: #fff; font-size: 13px; letter-spacing: 0.3px; }
    .gear-btn { background: rgba(255,255,255,0.15); color: #fff; border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; }
    .gear-btn:hover { background: rgba(255,255,255,0.25); }

    /* Settings panel */
    .settings { background: #fafafa; border-bottom: 1px solid #ddd; padding: 12px 16px; flex-shrink: 0; max-height: 55%; overflow-y: auto; }
    .settings-title { font-size: 10px; font-weight: 700; color: #555; letter-spacing: 0.5px; margin-bottom: 10px; }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
    .settings-grid label { display: flex; flex-direction: column; font-size: 10px; color: #888; gap: 2px; }
    .settings-grid input { border: 1px solid #e0e0e0; border-radius: 3px; padding: 4px 6px; font-size: 11px; color: #333; background: white; }
    .settings-grid input:focus { outline: none; border-color: #1F4E79; }
    .settings-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; }
    .settings-actions button { border-radius: 3px; padding: 5px 12px; font-size: 11px; cursor: pointer; border: 1px solid #e0e0e0; background: white; color: #555; }
    .btn-save { background: #1F4E79 !important; color: white !important; border-color: #1F4E79 !important; }

    /* Body */
    .body { display: flex; flex: 1; overflow: hidden; }

    /* Left panel */
    .left { width: 42%; flex-shrink: 0; border-right: 1px solid #e0e0e0; padding: 12px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }

    .section-label { font-size: 10px; font-weight: 700; color: #555; letter-spacing: 0.4px; margin-bottom: 4px; }

    /* Drop zone */
    .drop-zone { border: 2px dashed #ccc; border-radius: 6px; padding: 16px 10px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
    .drop-zone:hover, .drop-zone.drag-over { border-color: #1F4E79; background: #EEF4FB; }
    .drop-zone .dz-icon { font-size: 22px; margin-bottom: 4px; }
    .drop-zone .dz-text { color: #888; font-size: 11px; }
    .drop-zone .dz-filename { font-weight: 600; color: #1F4E79; font-size: 11px; margin-top: 4px; }
    input[type=file] { display: none; }

    /* Stats row */
    .stats { display: flex; gap: 8px; }
    .stat-box { flex: 1; background: #f5f5f5; border-radius: 4px; padding: 8px; text-align: center; border: 1px solid #e8e8e8; }
    .stat-num { font-size: 18px; font-weight: 700; color: #1F4E79; line-height: 1; }
    .stat-lbl { font-size: 9px; color: #888; margin-top: 2px; letter-spacing: 0.3px; }
    .stat-box.delta .stat-num { color: #e67e22; }
    .stat-box.ok .stat-num { color: #27ae60; }

    /* Actions */
    .actions { display: flex; flex-direction: column; gap: 6px; margin-top: auto; padding-top: 8px; }
    .btn { border-radius: 4px; padding: 8px 12px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; transition: background 0.15s; }
    .btn-primary { background: #1F4E79; color: white; }
    .btn-primary:hover { background: #163d61; }
    .btn-primary:disabled { background: #a0bcd8; cursor: default; }
    .btn-success { background: #27ae60; color: white; }
    .btn-success:hover { background: #219150; }
    .btn-success:disabled { background: #a8d5b8; cursor: default; }
    .btn-secondary { background: #f0f0f0; color: #555; border: 1px solid #ddd; }
    .btn-secondary:hover { background: #e4e4e4; }
    .btn-export { background: #6c3483; color: white; }
    .btn-export:hover { background: #5b2c6f; }
    .btn-export:disabled { background: #c3a8d1; cursor: default; }

    /* Delta table */
    .delta-table-wrap { overflow-x: auto; max-height: 140px; border: 1px solid #e0e0e0; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th { background: #1F4E79; color: white; padding: 4px 6px; text-align: left; white-space: nowrap; position: sticky; top: 0; }
    td { padding: 3px 6px; border-bottom: 1px solid #f0f0f0; white-space: nowrap; }
    tr:nth-child(even) td { background: #f9f9f9; }

    /* Right panel — log */
    .right { flex: 1; display: flex; flex-direction: column; background: #111; overflow: hidden; }
    .log-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; border-bottom: 1px solid #222; flex-shrink: 0; }
    .log-header span { color: #aaa; font-size: 10px; font-weight: 700; }
    .badge { font-size: 9px; padding: 2px 7px; border-radius: 3px; font-weight: 700; letter-spacing: 0.5px; }
    .badge-idle    { background: #333; color: #888; }
    .badge-running { background: #1a4a8a; color: #66aaff; }
    .badge-done    { background: #1a4a2a; color: #00cc66; }
    .badge-error   { background: #4a1a1a; color: #ff6b6b; }
    .log-body { flex: 1; overflow-y: auto; padding: 10px 12px; font-family: 'Courier New', monospace; font-size: 10px; line-height: 1.8; color: #ccc; }
    .log-hint   { color: #555; }
    .log-error  { color: #ff6b6b; }
    .log-success{ color: #00ff88; }
    .log-warn   { color: #ffc107; }
    .log-info   { color: #66aaff; }
  `;

  // ── Widget Class ──────────────────────────────────────────────────────────
  class MasterDataUploadWidget extends HTMLElement {

    constructor() {
      super();
      this._props = {};
      this._excelRecords = [];   // normalized records from Excel
      this._existingIds  = new Set();
      this._deltaRecords = [];
      this._rendered     = false;
    }

    connectedCallback() {
      if (!this._rendered) {
        this._render();
        this._bindEvents();
        this._rendered = true;
      }
    }

    set(name, value) { this._props[name] = value; }

    // ── Settings helpers ─────────────────────────────────────────────────────
    _settings() {
      const p = this._props;
      return {
        baseUrl:    (p.baseUrl    || '').replace(/\/$/, ''),
        tokenUrl:   p.tokenUrl   || '',
        clientId:   p.clientId   || '',
        secret:     p.clientSecret || '',
        dimId:      p.dimensionId || '',
        namespace:  p.namespace  || 'sac_public_dimensions',
      };
    }

    // ── Fetch dimension info ──────────────────────────────────────────────────
    async _fetchDimensionName(s) {
      try {
        const token = await this._getToken(s);
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        // Try list endpoint first (handles paginated OData or plain array)
        let url = `${s.baseUrl}/api/v1/dataimport/publicDimensions`;
        while (url) {
          const r = await fetch(url, { headers });
          if (!r.ok) break;
          const data = await r.json();
          const list = Array.isArray(data) ? data : (data.publicDimensions || data.value || []);
          const match = list.find(d => (d.publicDimensionID || '') === s.dimId);
          if (match) return match;
          url = (!Array.isArray(data) && data['@odata.nextLink']) || null;
        }

        // Fallback: try metadata endpoint for the specific dimension
        const mr = await fetch(`${s.baseUrl}/api/v1/dataimport/publicDimensions/${s.dimId}/metadata`, { headers });
        if (mr.ok) {
          const meta = await mr.json();
          // metadata may contain dimensionName or label fields
          const name = meta.dimensionName || meta.name || meta.label || meta.description || null;
          if (name) return { publicDimensionID: s.dimId, publicDimensionName: name, publicDimensionDescription: name, publicDimensionURL: `${s.baseUrl}/api/v1/dataimport/publicDimensions/${s.dimId}` };
        }
        return null;
      } catch (e) { this._log(`⚠ Dim lookup error: ${e.message}`, 'warn'); return null; }
    }

    // ── Auth ─────────────────────────────────────────────────────────────────
    async _getToken(s) {
      const r = await fetch(s.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id:  s.clientId,
          client_secret: s.secret,
        }).toString(),
      });
      if (!r.ok) throw new Error(`Token fetch failed: HTTP ${r.status}`);
      return (await r.json()).access_token;
    }

    async _getCsrfAndCookie(s, token) {
      const r = await fetch(`${s.baseUrl}/api/v1/csrf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': 'fetch',
          'x-sap-sac-custom-auth': 'true',
          'Accept': 'application/json',
        },
      });
      const csrf   = r.headers.get('x-csrf-token') || r.headers.get('X-CSRF-Token');
      const cookie = r.headers.get('set-cookie');
      if (!csrf) throw new Error('CSRF token not returned');
      return { csrf, cookie };
    }

    // ── Excel parsing ─────────────────────────────────────────────────────────
    async _parseExcel(file) {
      const XLSX = await loadXlsx();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const wb = XLSX.read(e.target.result, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
            // Normalize column names
            const normalized = rows.map(row => {
              const out = {};
              for (const [excelCol, sacCol] of Object.entries(COL_MAP)) {
                out[sacCol] = row[excelCol] !== undefined ? String(row[excelCol]) : '';
              }
              return out;
            }).filter(r => r.ID);
            resolve(normalized);
          } catch (err) { reject(err); }
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsArrayBuffer(file);
      });
    }

    // ── Fetch existing SAC members ────────────────────────────────────────────
    async _fetchExistingIds(s, token) {
      let url = `${s.baseUrl}/api/v1/dataexport/providers/${s.namespace}/${s.dimId}/PublicDimensionData`;
      const ids = new Set();
      while (url) {
        const r = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        if (!r.ok) throw new Error(`Export API: HTTP ${r.status}`);
        const data = await r.json();
        for (const rec of (data.value || [])) {
          const id = (rec.ID || '').trim();
          if (id && id !== '#') ids.add(id);
        }
        url = data['@odata.nextLink'] || null;
      }
      return ids;
    }

    // ── Import job ────────────────────────────────────────────────────────────
    async _importRecords(s, token, csrf, cookie, records) {
      const hdrs = {
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': csrf,
        'x-sap-sac-custom-auth': 'true',
        'Cookie': cookie,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Create job
      const jr = await fetch(
        `${s.baseUrl}/api/v1/dataimport/publicDimensions/${s.dimId}/publicDimensionData`,
        { method: 'POST', headers: hdrs, body: JSON.stringify({ JobSettings: { importMethod: 'Update' } }) }
      );
      if (!jr.ok) throw new Error(`Create job: HTTP ${jr.status} — ${await jr.text()}`);
      const { jobID } = await jr.json();
      this._log(`Job created: ${jobID}`, 'info');

      // Upload data
      const ur = await fetch(`${s.baseUrl}/api/v1/dataimport/jobs/${jobID}`, {
        method: 'POST', headers: hdrs, body: JSON.stringify({ Data: records }),
      });
      if (!ur.ok) throw new Error(`Upload data: HTTP ${ur.status}`);
      const ui = await ur.json();
      this._log(`Uploaded ${ui.upsertedNumberRows || records.length} rows (${ui.failedNumberRows || 0} failed)`);

      // Run
      const rr = await fetch(`${s.baseUrl}/api/v1/dataimport/jobs/${jobID}/run`, {
        method: 'POST', headers: hdrs, body: '{}',
      });
      if (!rr.ok) throw new Error(`Run job: HTTP ${rr.status}`);

      // Poll status
      const readHdrs = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Cookie': cookie };
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const sr = await fetch(`${s.baseUrl}/api/v1/dataimport/jobs/${jobID}/status`, { headers: readHdrs });
        const st = await sr.json();
        const status = st.jobStatus || '';
        this._log(`Status: ${status}`);
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
          return st;
        }
      }
      throw new Error('Job polling timed out');
    }

    // ── Log ──────────────────────────────────────────────────────────────────
    _log(msg, type) {
      const body = this.querySelector('#log-body');
      if (!body) return;
      const line = document.createElement('div');
      const ts = new Date().toTimeString().slice(0, 8);
      line.textContent = `[${ts}] ${msg}`;
      if (type === 'error' || /❌|fail/i.test(msg))   line.className = 'log-error';
      else if (type === 'info' || /ℹ|job|fetch/i.test(msg)) line.className = 'log-info';
      else if (/✅|complet|success/i.test(msg)) line.className = 'log-success';
      else if (/⚠|warn/i.test(msg))            line.className = 'log-warn';
      body.appendChild(line);
      body.scrollTop = body.scrollHeight;
    }

    _setStatus(s) {
      const b = this.querySelector('#status-badge');
      if (!b) return;
      b.textContent = s.toUpperCase();
      b.className = `badge badge-${s.toLowerCase()}`;
    }

    _updateStats() {
      const el = (id, val) => { const e = this.querySelector(`#${id}`); if (e) e.textContent = val; };
      el('stat-excel', this._excelRecords.length);
      el('stat-sac',   this._existingIds.size);
      el('stat-delta', this._deltaRecords.length);
    }

    _renderDeltaTable() {
      const wrap = this.querySelector('#delta-wrap');
      if (!wrap) return;
      if (!this._deltaRecords.length) { wrap.innerHTML = ''; return; }
      const cols = Object.keys(this._deltaRecords[0]);
      wrap.innerHTML = `
        <div class="section-label" style="margin-top:6px;">New Records (${this._deltaRecords.length})</div>
        <div class="delta-table-wrap">
          <table>
            <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
            <tbody>
              ${this._deltaRecords.map(r => `<tr>${cols.map(c => `<td>${r[c] || ''}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }

    // ── Render ────────────────────────────────────────────────────────────────
    _render() {
      if (!document.getElementById('md-upload-styles')) {
        const s = document.createElement('style');
        s.id = 'md-upload-styles';
        s.textContent = CSS;
        document.head.appendChild(s);
      }

      this.innerHTML = `
        <div class="root">

          <div class="header">
            <div>
              <span class="header-title">📦 Master Data Upload</span>
              <div id="header-dim-name" style="font-size:10px; color:rgba(255,255,255,0.65); margin-top:1px;"></div>
            </div>
            <button id="gear-btn" class="gear-btn">⚙ Settings</button>
          </div>

          <div id="settings-panel" style="display:none;" class="settings">
            <div class="settings-title">CONNECTION SETTINGS</div>
            <div class="settings-grid">
              <label>SAC Base URL<input id="s-baseUrl"    type="text"     /></label>
              <label>Token URL   <input id="s-tokenUrl"   type="text"     /></label>
              <label>Client ID   <input id="s-clientId"   type="text"     /></label>
              <label>Client Secret<input id="s-secret"   type="password" /></label>
              <label>Dimension ID<input id="s-dimId"      type="text"     /></label>
              <label>Namespace   <input id="s-namespace"  type="text"     /></label>
            </div>
            <div id="dim-name-row" style="margin-top:8px; display:none; background:#EEF4FB; border:1px solid #c5d9ee; border-radius:4px; padding:8px 10px;">
              <div style="font-size:10px; font-weight:700; color:#1F4E79; letter-spacing:0.4px; margin-bottom:6px;">DIMENSION INFO</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px 12px;">
                <div><div style="font-size:9px;color:#888;">ID</div><div id="dim-info-id" style="font-size:11px;color:#333;font-weight:600;word-break:break-all;"></div></div>
                <div><div style="font-size:9px;color:#888;">Name</div><div id="dim-info-name" style="font-size:11px;color:#333;font-weight:600;"></div></div>
                <div style="grid-column:1/-1;"><div style="font-size:9px;color:#888;">Description</div><div id="dim-info-desc" style="font-size:11px;color:#333;"></div></div>
                <div style="grid-column:1/-1;"><div style="font-size:9px;color:#888;">URL</div><div id="dim-info-url" style="font-size:10px;color:#1F4E79;word-break:break-all;"></div></div>
              </div>
            </div>
            <div class="settings-actions">
              <button id="cancel-btn">Cancel</button>
              <button id="save-btn" class="btn-save">💾 Save</button>
            </div>
          </div>

          <div class="body">

            <div class="left">

              <div>
                <div class="section-label">1 — Upload Excel File</div>
                <div class="drop-zone" id="drop-zone">
                  <div class="dz-icon">📄</div>
                  <div class="dz-text">Drop Excel file here or click to browse</div>
                  <div class="dz-filename" id="file-name"></div>
                </div>
                <input type="file" id="file-input" accept=".xlsx,.xls" />
              </div>

              <div>
                <div class="section-label">2 — Summary</div>
                <div class="stats">
                  <div class="stat-box">
                    <div class="stat-num" id="stat-excel">—</div>
                    <div class="stat-lbl">EXCEL ROWS</div>
                  </div>
                  <div class="stat-box ok">
                    <div class="stat-num" id="stat-sac">—</div>
                    <div class="stat-lbl">IN SAC</div>
                  </div>
                  <div class="stat-box delta">
                    <div class="stat-num" id="stat-delta">—</div>
                    <div class="stat-lbl">TO UPLOAD</div>
                  </div>
                </div>
              </div>

              <div id="delta-wrap"></div>

              <div class="actions">
                <button id="btn-fetch"  class="btn btn-primary">🔍 Fetch SAC Data</button>
                <button id="btn-compare" class="btn btn-secondary" disabled>⚖ Compare</button>
                <button id="btn-import" class="btn btn-success"   disabled>⬆ Import New Records</button>
                <button id="btn-export" class="btn btn-export">⬇ Export SAC Data</button>
              </div>

            </div>

            <div class="right">
              <div class="log-header">
                <span>📋 LOG</span>
                <span id="status-badge" class="badge badge-idle">IDLE</span>
              </div>
              <div id="log-body" class="log-body">
                <div class="log-hint">Configure settings → Upload Excel → Fetch SAC Data → Compare → Import</div>
              </div>
            </div>

          </div>
        </div>`;
    }

    // ── Event binding ─────────────────────────────────────────────────────────
    _bindEvents() {

      // Settings panel toggle
      this.querySelector('#gear-btn').addEventListener('click', () => {
        const panel = this.querySelector('#settings-panel');
        const isHidden = panel.style.display === 'none';
        if (isHidden) {
          const s = this._settings();
          this.querySelector('#s-baseUrl').value   = s.baseUrl;
          this.querySelector('#s-tokenUrl').value  = s.tokenUrl;
          this.querySelector('#s-clientId').value  = s.clientId;
          this.querySelector('#s-secret').value    = s.secret;
          this.querySelector('#s-dimId').value     = s.dimId;
          this.querySelector('#s-namespace').value = s.namespace;
          // Show cached dimension info if available
          const nameRow = this.querySelector('#dim-name-row');
          if (this._props._dimInfo !== undefined) {
            const m = this._props._dimInfo;
            this.querySelector('#dim-info-id').textContent   = (m && m.publicDimensionID)          || s.dimId;
            this.querySelector('#dim-info-name').textContent = (m && m.publicDimensionName)        || '(not found)';
            this.querySelector('#dim-info-desc').textContent = (m && m.publicDimensionDescription) || '—';
            this.querySelector('#dim-info-url').textContent  = (m && m.publicDimensionURL)         || '—';
            nameRow.style.display = 'block';
          } else {
            nameRow.style.display = 'none';
          }
        }
        panel.style.display = isHidden ? 'block' : 'none';
      });

      this.querySelector('#save-btn').addEventListener('click', async () => {
        this._props.baseUrl      = this.querySelector('#s-baseUrl').value.trim();
        this._props.tokenUrl     = this.querySelector('#s-tokenUrl').value.trim();
        this._props.clientId     = this.querySelector('#s-clientId').value.trim();
        this._props.clientSecret = this.querySelector('#s-secret').value.trim();
        this._props.dimensionId  = this.querySelector('#s-dimId').value.trim();
        this._props.namespace    = this.querySelector('#s-namespace').value.trim();
        this.querySelector('#settings-panel').style.display = 'none';
        this._log('Settings saved.', 'info');

        // Resolve dimension name
        const s = this._settings();
        if (s.dimId && s.baseUrl && s.tokenUrl && s.clientId && s.secret) {
          const nameRow = this.querySelector('#dim-name-row');
          nameRow.style.display = 'block';
          this.querySelector('#dim-info-id').textContent   = '…';
          this.querySelector('#dim-info-name').textContent = '…';
          this.querySelector('#dim-info-desc').textContent = '…';
          this.querySelector('#dim-info-url').textContent  = '…';
          const match = await this._fetchDimensionName(s);
          this._props._dimInfo = match;
          if (match) {
            this.querySelector('#dim-info-id').textContent   = match.publicDimensionID || s.dimId;
            this.querySelector('#dim-info-name').textContent = match.publicDimensionName || '—';
            this.querySelector('#dim-info-desc').textContent = match.publicDimensionDescription || '—';
            this.querySelector('#dim-info-url').textContent  = match.publicDimensionURL || '—';
            const headerDim = this.querySelector('#header-dim-name');
            if (headerDim) headerDim.textContent = match.publicDimensionDescription || match.publicDimensionName || '';
            this._log(`Dimension: ${match.publicDimensionDescription || match.publicDimensionName || s.dimId}`, 'info');
          } else {
            this.querySelector('#dim-info-id').textContent   = s.dimId;
            this.querySelector('#dim-info-name').textContent = '(not found)';
            this.querySelector('#dim-info-desc').textContent = '—';
            this.querySelector('#dim-info-url').textContent  = '—';
            this._log('⚠ Dimension ID not found in tenant.', 'warn');
          }
        }
      });

      this.querySelector('#cancel-btn').addEventListener('click', () => {
        this.querySelector('#settings-panel').style.display = 'none';
      });

      // File upload
      const dropZone  = this.querySelector('#drop-zone');
      const fileInput = this.querySelector('#file-input');

      dropZone.addEventListener('click', () => fileInput.click());
      dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
      dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) this._handleFile(file);
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) this._handleFile(fileInput.files[0]);
      });

      // Fetch
      this.querySelector('#btn-fetch').addEventListener('click', () => this._doFetch());

      // Compare
      this.querySelector('#btn-compare').addEventListener('click', () => this._doCompare());

      // Import
      this.querySelector('#btn-import').addEventListener('click', () => this._doImport());

      // Export
      this.querySelector('#btn-export').addEventListener('click', () => this._doExport());
    }

    async _handleFile(file) {
      this._log(`Reading file: ${file.name}...`, 'info');
      try {
        this._excelRecords = await this._parseExcel(file);
        this.querySelector('#file-name').textContent = `✔ ${file.name}`;
        this._log(`✅ ${this._excelRecords.length} records loaded from Excel.`, 'success');
        this._updateStats();
        this.querySelector('#btn-compare').disabled = this._existingIds.size === 0;
      } catch (err) {
        this._log(`❌ Parse error: ${err.message}`, 'error');
      }
    }

    async _doFetch() {
      const s = this._settings();
      if (!s.baseUrl || !s.tokenUrl || !s.clientId || !s.secret || !s.dimId) {
        this._log('❌ Please configure all settings first.', 'error'); return;
      }
      this._setStatus('running');
      this._log('Fetching OAuth token...', 'info');
      try {
        const token = await this._getToken(s);
        this._log('✅ Token obtained.');
        this._log(`Fetching existing members from SAC dimension...`, 'info');
        this._existingIds = await this._fetchExistingIds(s, token);
        this._log(`✅ ${this._existingIds.size} existing members found in SAC.`, 'success');
        this._updateStats();
        this._setStatus('done');
        if (this._excelRecords.length > 0) {
          this.querySelector('#btn-compare').disabled = false;
        }
      } catch (err) {
        this._log(`❌ ${err.message}`, 'error');
        this._setStatus('error');
      }
    }

    _doCompare() {
      if (!this._excelRecords.length) { this._log('❌ No Excel data loaded.', 'error'); return; }
      if (!this._existingIds.size)    { this._log('❌ No SAC data fetched yet.', 'error'); return; }
      this._deltaRecords = this._excelRecords.filter(r => !this._existingIds.has(r.ID));
      this._log(`⚖ Compare complete: ${this._deltaRecords.length} new / ${this._excelRecords.length - this._deltaRecords.length} already in SAC.`);
      this._updateStats();
      this._renderDeltaTable();
      this.querySelector('#btn-import').disabled = this._deltaRecords.length === 0;
      if (this._deltaRecords.length === 0) this._log('✅ All records already exist in SAC. Nothing to import.', 'success');
    }

    async _doImport() {
      if (!this._deltaRecords.length) { this._log('Nothing to import.'); return; }
      const s = this._settings();
      this._setStatus('running');
      this.querySelector('#btn-import').disabled = true;
      try {
        this._log('Fetching token + CSRF...', 'info');
        const token = await this._getToken(s);
        const { csrf, cookie } = await this._getCsrfAndCookie(s, token);
        this._log('✅ Auth ready. Starting import...', 'success');
        const result = await this._importRecords(s, token, csrf, cookie, this._deltaRecords);
        const info = result.additionalInformation || {};
        this._log(`✅ Import ${result.jobStatus}. ${info.totalNumberRowsInJob || this._deltaRecords.length} rows, ${info.failedNumberRows || 0} failed.`, 'success');
        this._setStatus('done');
        // Refresh SAC count
        const token2 = await this._getToken(s);
        this._existingIds = await this._fetchExistingIds(s, token2);
        this._deltaRecords = [];
        this._updateStats();
        this._renderDeltaTable();
        this.querySelector('#btn-import').disabled = true;
      } catch (err) {
        this._log(`❌ ${err.message}`, 'error');
        this._setStatus('error');
        this.querySelector('#btn-import').disabled = false;
      }
    }
    async _doExport() {
      const s = this._settings();
      if (!s.baseUrl || !s.tokenUrl || !s.clientId || !s.secret || !s.dimId) {
        this._log('❌ Please configure all settings first.', 'error'); return;
      }
      this._setStatus('running');
      const btn = this.querySelector('#btn-export');
      btn.disabled = true;
      this._log('Starting export — fetching token...', 'info');
      try {
        const XLSX = await loadXlsx();
        const token = await this._getToken(s);
        this._log('✅ Token obtained. Fetching SAC dimension data...', 'info');

        // Fetch all pages and collect full records (not just IDs)
        let url = `${s.baseUrl}/api/v1/dataexport/providers/${s.namespace}/${s.dimId}/PublicDimensionData`;
        const allRecords = [];
        while (url) {
          const r = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
          });
          if (!r.ok) throw new Error(`Export API: HTTP ${r.status}`);
          const data = await r.json();
          for (const rec of (data.value || [])) {
            if ((rec.ID || '').trim() && (rec.ID || '').trim() !== '#') {
              allRecords.push(rec);
            }
          }
          url = data['@odata.nextLink'] || null;
        }
        this._log(`✅ ${allRecords.length} records fetched. Building Excel...`, 'success');

        if (!allRecords.length) {
          this._log('⚠ No records found in SAC dimension.', 'warn');
          this._setStatus('done');
          btn.disabled = false;
          return;
        }

        // Reverse COL_MAP: SAC field → Excel column name
        const reverseMap = Object.fromEntries(Object.entries(COL_MAP).map(([k, v]) => [v, k]));

        // Build rows using friendly Excel column names where available
        const sacFields = Object.keys(allRecords[0]);
        const excelRows = allRecords.map(rec => {
          const row = {};
          for (const field of sacFields) {
            const colName = reverseMap[field] || field;
            row[colName] = rec[field] ?? '';
          }
          return row;
        });

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelRows);

        // Auto-width columns (approximate)
        const colKeys = Object.keys(excelRows[0]);
        const colWidths = colKeys.map(k => ({
          wch: Math.max(k.length, ...excelRows.slice(0, 50).map(r => String(r[k] || '').length)) + 2
        }));
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'SAC Master Data');

        // Download
        const today = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `SAC_Material_Export_${today}.xlsx`);
        this._log(`✅ Export downloaded: SAC_Material_Export_${today}.xlsx`, 'success');
        this._setStatus('done');
      } catch (err) {
        this._log(`❌ Export failed: ${err.message}`, 'error');
        this._setStatus('error');
      } finally {
        btn.disabled = false;
      }
    }

  }

  customElements.define('com-custom-md-upload', MasterDataUploadWidget);

})();
