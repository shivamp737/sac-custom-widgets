(function () {
  'use strict';

  const STALE_ID = '9849060194DE03C79D9CD2732FA7AC8B';
  // Types excluded from transport API (unsupported or not needed)
  const SKIP_TYPES = new Set(['PREDICTIVESCENARIO', 'KPIWORKSPACE', 'APPLICATION']);
  const SUPPORTED_TYPES = new Set(['STORY', 'CUBE', 'DATASET', 'PLANNINGSEQUENCE', 'MULTIACTIONS', 'SIMULATION', 'ADDIN_WORKBOOK', 'DATAACTION', 'VIDEO_DATA_STORY']);
  const POLL_INTERVAL_MS = 3000;
  const POLL_TIMEOUT_MS = 600000;

  const TYPE_LABELS = {
    ADDIN_WORKBOOK: 'Add-In Workbook', CUBE: 'Model', DATASET: 'Dataset',
    FOLDER: 'Folder', MULTIACTIONS: 'Multi Actions',
    PLANNINGSEQUENCE: 'Planning Sequence', SIMULATION: 'Simulation',
    STORY: 'Story', KPIWORKSPACE: 'Digital Boardroom',
    APPLICATION: 'Application', DATAACTION: 'Data Action',
  };

  const C = {
    navy: '#1f3250', navyL: '#2a4a70', accent: '#1f3250',
    text: '#333', textDim: '#888', bg: '#fff',
    card: '#fafafa', border: '#e0e0e0',
    ok: '#00cc66', err: '#ff6b6b', warn: '#ffc107',
  };

  const CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :host { display:block; width:100%; height:100%;
            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            font-size:12px; background:${C.bg}; color:${C.text}; overflow:hidden; }
    .widget { display:flex; flex-direction:column; height:100%;
              border:1px solid ${C.border}; border-radius:4px; overflow:hidden; background:${C.bg}; }
    .header { display:flex; align-items:center; justify-content:space-between;
              padding:8px 12px; background:${C.navy}; flex-shrink:0; }
    .header h2 { font-size:13px; font-weight:600; color:#fff; }
    .header-right { display:flex; align-items:center; gap:6px; }
    .gear { background:transparent; color:#ccc; border:1px solid #4a6080; border-radius:4px;
            padding:3px 9px; font-size:11px; cursor:pointer; line-height:1.4; }
    .gear:hover { background:${C.navyL}; color:#fff; }
    .steps { display:flex; gap:4px; padding:8px 12px; background:#f9f9f9;
             border-bottom:1px solid ${C.border}; flex-shrink:0; }
    .step-pill { flex:1; display:flex; align-items:center; gap:6px; padding:5px 8px;
                 border-radius:3px; font-size:10px; font-weight:600; color:${C.textDim};
                 background:#fff; border:1px solid ${C.border}; }
    .step-pill.active { background:#e8eef5; color:${C.navy}; border-color:${C.navy}; }
    .step-pill.done { background:#e6f9ee; color:#006633; border-color:#00cc66; }
    .step-dot { width:16px; height:16px; border-radius:50%; background:${C.border};
                display:flex; align-items:center; justify-content:center; font-size:9px;
                font-weight:700; color:#fff; flex-shrink:0; }
    .step-pill.active .step-dot { background:${C.navy}; }
    .step-pill.done .step-dot { background:#00cc66; }
    .card { background:${C.bg}; border:1px solid ${C.border}; border-radius:4px;
            padding:14px 16px; margin:12px 12px 0; }
    .card:last-child { margin-bottom:12px; }
    .card-title { font-size:11px; font-weight:700; color:${C.navy}; text-transform:uppercase;
                  letter-spacing:.5px; border-bottom:1px solid #eee; padding-bottom:8px; margin-bottom:12px; }
    .btn { display:inline-flex; align-items:center; gap:5px; border-radius:4px;
           cursor:pointer; font-size:11px; font-weight:600; border:none; transition:background .15s; }
    .btn:disabled { opacity:.4; cursor:not-allowed; }
    .btn-primary { background:${C.navy}; color:#fff; padding:6px 14px; }
    .btn-primary:hover:not(:disabled) { background:${C.navyL}; }
    .btn-ghost { background:#fff; color:#555; border:1px solid ${C.border}; padding:5px 13px; }
    .btn-ghost:hover:not(:disabled) { background:#f0f0f0; }
    .btn-sm { padding:4px 10px; font-size:10px; }
    .row-btns { display:flex; gap:8px; margin-top:14px; justify-content:flex-end; }
    label { display:block; font-size:10px; color:${C.textDim}; margin-bottom:3px; margin-top:10px;
            text-transform:uppercase; letter-spacing:.5px; }
    input[type=text],input[type=password] { width:100%; background:#fff; border:1px solid ${C.border};
      border-radius:3px; color:${C.text}; padding:5px 8px; font-size:11px; }
    input[type=text]:focus,input[type=password]:focus { outline:none; border-color:${C.navy}; }
    .err-msg { color:${C.err}; font-size:11px; margin-top:6px; }
    .info-msg { color:${C.textDim}; font-size:11px; margin-top:6px; }
    .spinner { display:inline-block; width:12px; height:12px; border:2px solid ${C.border};
               border-top-color:${C.navy}; border-radius:50%; animation:spin .7s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .tag { display:inline-flex; align-items:center; gap:4px; background:#e8eef5;
           border:1px solid #c8d8e8; border-radius:10px; padding:2px 8px; font-size:10px; color:${C.navy}; }
    .tag-remove { background:none; border:none; color:${C.textDim}; cursor:pointer; font-size:13px;
                  line-height:1; padding:0 2px; }
    .tag-remove:hover { color:${C.err}; }
    .radio-group { display:flex; gap:14px; margin-top:6px; }
    .radio-opt { display:flex; align-items:center; gap:5px; cursor:pointer; font-size:11px; color:${C.text}; }
    .radio-opt input { accent-color:${C.navy}; cursor:pointer; }
    .toggle-row { display:flex; align-items:center; justify-content:space-between;
                  padding:8px 0; border-bottom:1px solid ${C.border}; }
    .toggle-row:last-child { border-bottom:none; }
    .toggle-label { font-size:11px; font-weight:600; color:${C.text}; }
    .toggle-sub { font-size:10px; color:${C.textDim}; margin-top:1px; }
    .toggle { position:relative; width:34px; height:18px; }
    .toggle input { opacity:0; width:0; height:0; }
    .toggle-track { position:absolute; inset:0; background:${C.border}; border-radius:20px;
                    cursor:pointer; transition:background .2s; }
    .toggle input:checked + .toggle-track { background:${C.navy}; }
    .toggle-thumb { position:absolute; top:2px; left:2px; width:14px; height:14px;
                    background:#fff; border-radius:50%; transition:transform .2s; pointer-events:none; }
    .toggle input:checked ~ .toggle-thumb { transform:translateX(16px); }
    .help-overlay { position:absolute; inset:0; background:rgba(0,0,0,.45); z-index:100;
                    display:flex; align-items:center; justify-content:center; padding:16px; }
    .help-modal { background:#fff; border-radius:6px; width:100%; max-width:520px;
                  max-height:80%; display:flex; flex-direction:column;
                  box-shadow:0 8px 32px rgba(0,0,0,.25); overflow:hidden; }
    .help-header { display:flex; align-items:center; justify-content:space-between;
                   padding:12px 16px; background:${C.navy}; flex-shrink:0; }
    .help-header h3 { font-size:13px; font-weight:700; color:#fff; margin:0; }
    .help-close { background:none; border:none; color:#aac; font-size:18px; cursor:pointer; line-height:1; padding:0 4px; }
    .help-close:hover { color:#fff; }
    .help-body { overflow-y:auto; padding:16px 20px; font-size:12px; line-height:1.7; color:${C.text}; }
    .help-body h4 { font-size:11px; font-weight:700; color:${C.navy}; text-transform:uppercase;
                    letter-spacing:.5px; border-bottom:1px solid #e0e8f0; padding-bottom:4px; margin:16px 0 8px; }
    .help-body h4:first-child { margin-top:0; }
    .help-body ul { margin:0 0 8px 18px; padding:0; }
    .help-body li { margin-bottom:3px; }
    .help-body p { margin:0 0 8px; }
    .help-body code { background:#f0f4f8; border:1px solid #dde; border-radius:3px;
                      padding:1px 5px; font-size:10px; font-family:'Courier New',monospace; }
    .help-step { display:flex; gap:10px; margin-bottom:8px; align-items:flex-start; }
    .help-step-num { background:${C.navy}; color:#fff; border-radius:50%; width:20px; height:20px; min-width:20px;
                     font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; margin-top:1px; }
    .help-table { width:100%; border-collapse:collapse; font-size:11px; margin-top:6px; }
    .help-table th { background:${C.navy}; color:#fff; padding:5px 8px; text-align:left; font-weight:600; }
    .help-table td { padding:5px 8px; border-bottom:1px solid #eee; vertical-align:top; }
    .help-table tr:nth-child(even) td { background:#f7f9fb; }
    .tree-row { display:flex; align-items:center; gap:6px; padding:6px 8px; cursor:pointer;
                border-radius:3px; font-size:12px; transition:background .1s; }
    .tree-row:hover { background:#f0f4f8; }
    .tree-row.selected { background:#e8eef5; border:1px solid rgba(31,50,80,.27); }
    .chevron { width:14px; text-align:center; font-size:11px; color:#888; flex-shrink:0; }
    .folder-icon { font-size:13px; flex-shrink:0; }
    .folder-name { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .tree-wrap { flex:1; min-height:0; overflow-y:auto; margin-bottom:10px;
                 border:1px solid #e0e0e0; border-radius:4px; padding:4px; background:#fff; }
  `;

  class TransportPackageWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._step = 0;
      this._token = '';
      this._tokenUrl = '';
      this._clientId = '';
      this._clientSecret = '';
      this._tenantPrefixOverride = '';
      this._baseUrl = '';
      this._csrfToken = '';
      this._tenantPrefix = '';
      this._allResources = [];
      this._folders = [];
      this._selectedFolderIds = new Set();
      this._packageMode = 'pertype';
      this._includeData = false;
      this._includeDeps = false;
      this._namePrefix = '';
      this._destinations = [];
      this._jobs = [];
      this._loading = false;
      this._collapsedFolders = new Set();
      this._error = '';
      this._showHelp = false;
    }

    connectedCallback() {
      this._loadSettings();
      // Attach click listener ONCE — never removed/re-added to avoid re-fire loops
      this.shadowRoot.addEventListener('click', (e) => this._handleClick(e));
      this._render();
    }

    _loadSettings() {
      try {
        const s = JSON.parse(localStorage.getItem('sac_transport_v1') || '{}');
        this._tokenUrl = s.tokenUrl || '';
        this._clientId = s.clientId || '';
        this._clientSecret = s.clientSecret || '';
        this._baseUrl = (s.baseUrl || '').replace(/\/$/, '');
        this._tenantPrefixOverride = s.tenantPrefixOverride || '';
      } catch (_) {}
    }

    _saveSettings(tokenUrl, clientId, clientSecret, baseUrl, tenantPrefixOverride) {
      this._tokenUrl = tokenUrl;
      this._clientId = clientId;
      this._clientSecret = clientSecret;
      this._baseUrl = baseUrl.replace(/\/$/, '');
      this._tenantPrefixOverride = tenantPrefixOverride;
      localStorage.setItem('sac_transport_v1', JSON.stringify({
        tokenUrl: this._tokenUrl,
        clientId: this._clientId,
        clientSecret: this._clientSecret,
        baseUrl: this._baseUrl,
        tenantPrefixOverride: this._tenantPrefixOverride,
      }));
    }

    async _fetchAccessToken() {
      const credentials = btoa(`${this._clientId}:${this._clientSecret}`);
      const r = await fetch(this._tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      if (!r.ok) throw new Error(`Token fetch failed (${r.status}). Check Client ID, Secret, and Token URL.`);
      const data = await r.json();
      if (!data.access_token) throw new Error('No access_token in token response.');
      this._token = data.access_token;
    }

    async _fetchCsrf() {
      const r = await fetch(`${this._baseUrl}/api/v1/scim/Groups`, {
        headers: {
          'Authorization': `Bearer ${this._token}`,
          'x-sap-sac-custom-auth': 'true',
          'x-csrf-token': 'fetch',
          'Accept': 'application/json',
        },
      });
      const csrf = r.headers.get('x-csrf-token') || r.headers.get('X-CSRF-Token');
      if (!csrf) throw new Error(`CSRF fetch failed (HTTP ${r.status}). Check Base URL and credentials.`);
      this._csrfToken = csrf;
    }

    _headers(extra = {}) {
      return {
        'Authorization': `Bearer ${this._token}`,
        'x-sap-sac-custom-auth': 'true',
        'x-csrf-token': this._csrfToken,
        'Accept': 'application/json',
        ...extra,
      };
    }

    async _detectTenantPrefix() {
      const r = await fetch(`${this._baseUrl}/api/v1/content/`, {
        method: 'POST',
        headers: this._headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ itemType: 'ALL', permissions: ['LIST'] }),
      });
      if (!r.ok) throw new Error(`Content API list failed: ${r.status}`);
      const data = await r.json();
      for (const item of (data.value || [])) {
        const dr = await fetch(`${this._baseUrl}/api/v1/content/${item.itemId}`, { headers: this._headers() });
        if (!dr.ok) continue;
        const d = await dr.json();
        const wave = d.waveContent || [];
        if (wave.length > 0) {
          const m = (wave[0].sourceId || '').match(/^RESOURCE:(t\.[^.:]+)/);
          if (m) { this._tenantPrefix = m[1]; return; }
        }
      }
      throw new Error('Could not auto-detect tenant prefix. Ensure at least one export package exists in your tenant.');
    }

    async _fetchFolderTree() {
      const base = `${this._baseUrl}/api/v1/filerepository/`;
      let url = base + `Resources?applyManagePrivilege=true&$expand=ancestorFolders&$filter=ancestorFolders/any(a:a/resourceId eq 'PUBLIC')`;
      const resources = [];
      while (url) {
        const r = await fetch(url, { headers: this._headers() });
        if (!r.ok) throw new Error(`Folder tree fetch failed: ${r.status}`);
        const data = await r.json();
        resources.push(...(data.value || []));
        const next = data['@odata.nextLink'];
        url = next ? base + next : null;
      }
      this._allResources = resources.filter(r => r.resourceId !== STALE_ID);
      this._folders = this._allResources.filter(r => r.resourceType === 'FOLDER');
    }

    _startPolling() {
      const pending = this._jobs.filter(j => j.jobId && j.status !== 'DONE' && j.status !== 'FAILED');
      if (!pending.length) { this._render(); return; }

      const poll = async () => {
        const start = Date.now();
        let allDone = false;

        while (!allDone && (Date.now() - start) < POLL_TIMEOUT_MS) {
          await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
          allDone = true;

          for (const job of this._jobs) {
            if (!job.jobId || job.status === 'DONE' || job.status === 'FAILED' || job.status === 'UNKNOWN') continue;
            allDone = false;
            try {
              await this._pollJob(job);
            } catch (_) {}
          }
          this._render();
        }

        // Mark any still-running jobs as UNKNOWN after timeout
        for (const job of this._jobs) {
          if (job.status === 'EXECUTING' || job.status === 'CREATED') {
            job.status = 'UNKNOWN';
            job.error = 'Timed out after 10 min — check SAC manually';
          }
        }
        this._render();
      };

      poll();
    }

    async _pollJob(job) {
      const r = await fetch(`${this._baseUrl}/api/v1/content/jobs/${job.jobId}`, {
        headers: this._headers(),
      });
      if (!r.ok) return;
      const data = await r.json();

      const status = data.state?.status || job.status;
      job.status = status;

      const objects = data.objects || [];
      job.done = objects.filter(o => o.state?.status === 'DONE').length;
      job.total = objects.length || job.total;

      if (status === 'DONE') {
        job.itemId = data.privatePackage || '';
      } else if (status === 'FAILED') {
        const failed = objects.find(o => o.state?.status === 'FAILED' && o.state?.message);
        job.error = failed?.state?.message || data.state?.message || 'Unknown error';
      }
    }

    _render() {
      this.shadowRoot.innerHTML = `<style>${CSS}</style>${this._buildHtml()}`;
      this._attachListeners();
    }

    _buildHtml() {
      const helpOverlay = this._showHelp ? this._helpHtml() : '';
      if (this._step === 0) return this._settingsHtml() + helpOverlay;
      return `
        <div class="widget">
          <div class="header">
            <h2>Transport Package Creator</h2>
            <div style="display:flex;gap:4px;">
              <button class="gear" id="btn-help" title="Help">?</button>
              <button class="gear" id="btn-settings" title="Settings">⚙</button>
            </div>
          </div>
          <div class="steps">
            ${[['1','Select Folder'],['2','Configure'],['3','Export']].map(([n, label], idx) => {
              const i = idx + 1;
              const cls = this._step > i ? 'done' : this._step === i ? 'active' : '';
              return `<div class="step-pill ${cls}"><span class="step-dot">${this._step > i ? '✓' : n}</span>${label}</div>`;
            }).join('')}
          </div>
          ${this._step === 1 ? this._step1Html() : ''}
          ${this._step === 2 ? this._step2Html() : ''}
          ${this._step === 3 ? this._step3Html() : ''}
        </div>${helpOverlay}`;
    }

    _settingsHtml() {
      return `
        <div class="widget">
          <div class="header">
            <h2>Transport Package Creator</h2>
            <button class="gear" id="btn-help" title="Help">?</button>
          </div>
          <div class="card">
            <div class="card-title">Connect to SAC</div>
            <label>SAC Base URL</label>
            <input type="text" id="inp-baseurl" value="${this._esc(this._baseUrl)}"
                   placeholder="https://tenant.ap11.analytics.cloud.sap" autocomplete="off" />
            <label>Token URL</label>
            <input type="text" id="inp-tokenurl" value="${this._esc(this._tokenUrl)}"
                   placeholder="https://tenant.authentication.ap11.hana.ondemand.com/oauth/token" autocomplete="off" />
            <label>Client ID</label>
            <input type="text" id="inp-clientid" value="${this._esc(this._clientId)}"
                   placeholder="sb-...!b..." autocomplete="off" />
            <label>Client Secret</label>
            <input type="password" id="inp-secret" value="${this._esc(this._clientSecret)}"
                   placeholder="Client secret" autocomplete="off" />
            <label>Tenant Prefix <span style="color:${C.textDim};text-transform:none;font-size:10px;">(e.g. t.FXXDUD — leave blank to auto-detect)</span></label>
            <input type="text" id="inp-prefix-override" value="${this._esc(this._tenantPrefixOverride)}"
                   placeholder="t.XXXXXX" autocomplete="off" />
            ${this._error ? `<div class="err-msg">${this._esc(this._error)}</div>` : ''}
            <div class="row-btns" style="justify-content:flex-start;">
              <button class="btn btn-primary" id="btn-connect">
                ${this._loading ? '<span class="spinner"></span>' : ''} Connect
              </button>
            </div>
          </div>
        </div>`;
    }

    _step1Html() {
      if (this._loading) {
        return `<div class="card"><div style="display:flex;align-items:center;gap:8px;">
      <span class="spinner"></span><span>Loading folder tree…</span></div></div>`;
      }
      if (!this._folders.length) {
        return `<div class="card"><div class="err-msg">No folders found in Public.</div>
      <div class="row-btns"><button class="btn btn-ghost btn-sm" id="btn-retry-tree">Retry</button></div></div>`;
      }

      const rootFolders = this._folders
        .filter(f => !f.parentFolderResourceId || f.parentFolderResourceId === 'PUBLIC')
        .sort((a, b) => a.name.localeCompare(b.name));

      const renderFolder = (folder, depth = 0) => {
        const children = this._folders
          .filter(f => f.parentFolderResourceId === folder.resourceId)
          .sort((a, b) => a.name.localeCompare(b.name));
        const isSelected = this._selectedFolderIds.has(folder.resourceId);
        const indent = depth * 16;
        const hasChildren = children.length > 0;
        const isOpen = !this._collapsedFolders.has(folder.resourceId);
        const chevron = hasChildren ? (isOpen ? '▾' : '▸') : '&nbsp;';

        return `
      <div class="tree-row ${isSelected ? 'selected' : ''}" data-id="${folder.resourceId}"
           data-name="${this._esc(folder.name)}" style="padding-left:${indent + 8}px">
        <span class="chevron" data-chevron="${folder.resourceId}">${chevron}</span>
        <span class="folder-icon">📁</span>
        <span class="folder-name">${this._esc(folder.name)}</span>
        ${isSelected ? `<span style="margin-left:auto;color:${C.ok};font-size:12px;">✓</span>` : ''}
      </div>
      <div class="tree-children" id="children-${folder.resourceId}"
           style="display:${isOpen ? 'block' : 'none'}">
        ${children.map(c => renderFolder(c, depth + 1)).join('')}
      </div>`;
      };

      const previewHtml = this._selectedFolderIds.size ? this._folderPreviewHtml() : '';

      return `
    <div class="card" style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
      <div class="card-title">Step 1 — Select a Folder</div>
      <div class="tree-wrap">${rootFolders.map(f => renderFolder(f)).join('')}</div>
      ${previewHtml}
      ${this._error ? `<div class="err-msg">${this._esc(this._error)}</div>` : ''}
      <div class="row-btns">
        <button class="btn btn-ghost" id="btn-step1-back">← Back</button>
        <button class="btn btn-primary" id="btn-step1-next"
                ${!this._selectedFolderIds.size ? 'disabled' : ''}>Next →</button>
      </div>
    </div>`;
    }

    _folderPreviewHtml() {
      const seen = new Set();
      const counts = {};
      for (const r of this._allResources) {
        if (r.resourceType === 'FOLDER' || SKIP_TYPES.has(r.resourceType)) continue;
        if (seen.has(r.resourceId)) continue;
        const isDirectChild = this._selectedFolderIds.has(r.parentFolderResourceId);
        const isDescendant = r.ancestorFolders && r.ancestorFolders.some(a => this._selectedFolderIds.has(a.resourceId));
        if (!isDirectChild && !isDescendant) continue;
        seen.add(r.resourceId);
        const label = TYPE_LABELS[r.resourceType] || r.resourceType;
        counts[label] = (counts[label] || 0) + 1;
      }
      const total = Object.values(counts).reduce((s, n) => s + n, 0);
      const parts = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${k}`).join(' · ');
      const folderNames = [...this._selectedFolderIds].map(id => {
        const f = this._folders.find(f => f.resourceId === id);
        return f ? this._esc(f.name) : id;
      }).join(', ');
      return `<div class="info-msg" style="margin-top:8px;">
    <strong>${folderNames}</strong> — ${total} items
    ${parts ? `<br><span style="font-size:11px;">${parts}</span>` : ''}
  </div>`;
    }

    _step2Html() {
      const typeGroups = this._getTypeGroups();
      const namePreview = this._buildNamePreview(typeGroups);

      return `
    <div style="flex:1;min-height:0;overflow-y:auto;">
      <div class="card">
        <div class="card-title">Step 2 — Configure</div>

        <label>Package Mode</label>
        <div class="radio-group">
          <label class="radio-opt">
            <input type="radio" name="pkgmode" value="pertype"
                   ${this._packageMode === 'pertype' ? 'checked' : ''} />
            Per type <span style="color:${C.textDim};font-size:11px;">(${typeGroups.length} packages)</span>
          </label>
          <label class="radio-opt">
            <input type="radio" name="pkgmode" value="combined"
                   ${this._packageMode === 'combined' ? 'checked' : ''} />
            Combined <span style="color:${C.textDim};font-size:11px;">(1 package)</span>
          </label>
        </div>

        <label style="margin-top:14px;">Content Options</label>
        <div style="border:1px solid ${C.border};border-radius:6px;padding:0 12px;margin-top:6px;">
          <div class="toggle-row">
            <div>
              <div class="toggle-label">Include model data</div>
              <div class="toggle-sub">Export data rows from Model/CUBE/Dataset objects</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="tog-data" ${this._includeData ? 'checked' : ''} />
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
          </div>
          <div class="toggle-row">
            <div>
              <div class="toggle-label">Include dependencies</div>
              <div class="toggle-sub">Pull in referenced objects automatically</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="tog-deps" ${this._includeDeps ? 'checked' : ''} />
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
          </div>
        </div>

        <label style="margin-top:14px;">Package Name Prefix</label>
        <input type="text" id="inp-prefix" value="${this._esc(this._namePrefix)}"
               placeholder="e.g. I746567" />
        ${namePreview ? `<div class="info-msg" style="margin-top:8px;font-size:11px;">${namePreview}</div>` : ''}
        ${this._error ? `<div class="err-msg">${this._esc(this._error)}</div>` : ''}
      </div>

      ${this._step2DestinationsHtml()}
    </div>
    <div style="flex-shrink:0;display:flex;justify-content:flex-end;gap:8px;
                padding:10px 12px;border-top:1px solid ${C.border};background:${C.bg};">
      <button class="btn btn-ghost" id="btn-step2-back">← Back</button>
      <button class="btn btn-primary" id="btn-step2-next">Next →</button>
    </div>`;
    }

    _getTypeGroups() {
      const types = new Set();
      for (const r of this._allResources) {
        if (r.resourceType === 'FOLDER' || SKIP_TYPES.has(r.resourceType)) continue;
        const isDirectChild = this._selectedFolderIds.has(r.parentFolderResourceId);
        const isDescendant = r.ancestorFolders && r.ancestorFolders.some(a => this._selectedFolderIds.has(a.resourceId));
        if (isDirectChild || isDescendant) types.add(r.resourceType);
      }
      return [...types].sort();
    }

    _buildNamePreview(typeGroups) {
      if (!this._namePrefix) return '';
      if (this._packageMode === 'combined') {
        return `Will create: <strong>${this._esc(this._namePrefix)}_COMBINED</strong>`;
      }
      const names = typeGroups.map(t => `<strong>${this._esc(this._namePrefix)}_${t}</strong>`).join(', ');
      return `Will create: ${names}`;
    }

    _step2DestinationsHtml() {
      const chips = this._destinations.map((d, i) => `
    <div class="tag" style="margin:3px 3px 3px 0;">
      <span title="${this._esc(d.tenantUrl)}">${this._esc(d.tenantUrl.replace(/^https?:\/\//, '').split('.')[0])}</span>
      <span style="color:${C.textDim};font-size:10px;margin-left:3px;">${['LIST','READ','WRITE','DELETE'].filter(p => d[p]).join('')}</span>
      <button class="tag-remove" data-dest-remove="${i}" title="Remove">×</button>
    </div>`).join('');

      return `
    <div class="card">
      <div class="card-title">Sharing Destinations</div>
      <div class="info-msg" style="margin-bottom:10px;">
        Optional. Who can access this package in the Content Network.
      </div>
      ${chips ? `<div style="display:flex;flex-wrap:wrap;margin-bottom:10px;">${chips}</div>` : ''}
      <div id="dest-form" style="display:none; background:${C.bg}; border:1px solid ${C.border};
           border-radius:6px; padding:12px; margin-bottom:10px;">
        <label>Tenant URL</label>
        <input type="text" id="dest-url" placeholder="https://partner.analytics.cloud.sap" />
        <label>OEM ID</label>
        <input type="text" id="dest-oem" placeholder="Optional" />
        <label>ERP Number</label>
        <input type="text" id="dest-erp" placeholder="Optional" />
        <label style="margin-top:10px;">Permissions</label>
        <div style="display:flex;gap:14px;margin-top:6px;font-size:13px;">
          ${['LIST','READ','WRITE','DELETE'].map(p => `
            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;">
              <input type="checkbox" id="dest-perm-${p}" ${p==='LIST'||p==='READ'?'checked':''} /> ${p}
            </label>`).join('')}
        </div>
        <div class="row-btns" style="margin-top:10px;">
          <button class="btn btn-ghost btn-sm" id="btn-dest-cancel">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-dest-add">Add</button>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" id="btn-dest-show">+ Add Destination</button>
    </div>`;
    }

    _buildObjects() {
      const byType = {};
      const seen = new Set();
      for (const r of this._allResources) {
        if (r.resourceType === 'FOLDER') continue;
        if (!SUPPORTED_TYPES.has(r.resourceType)) continue;
        if (seen.has(r.resourceId)) continue;
        const isDirectChild = this._selectedFolderIds.has(r.parentFolderResourceId);
        const isDescendant = r.ancestorFolders && r.ancestorFolders.some(a => this._selectedFolderIds.has(a.resourceId));
        if (!isDirectChild && !isDescendant) continue;
        seen.add(r.resourceId);
        if (!byType[r.resourceType]) byType[r.resourceType] = [];
        byType[r.resourceType].push(r);
      }
      return byType;
    }

    _toObjectId(r) {
      // CUBE with uppercase 32-char hex GUID → dot-separator format (confirmed working for tenant models)
      // CUBE with other ID formats (SAP standard content, lowercase alphanumeric) → standard colon format
      if (r.resourceType === 'CUBE' && /^[0-9A-F]{32}$/.test(r.resourceId)) {
        return `RESOURCE:${this._tenantPrefix}.${r.resourceId}:${r.resourceId}`;
      }
      return `RESOURCE:${this._tenantPrefix}:${r.resourceId}`;
    }

    _buildJobPayload(packageName, items, includeData) {
      const permissions = this._destinations.map(d => ({
        tenantUrl: d.tenantUrl,
        landscapeId: null,
        ...(d.oemId ? { oemId: d.oemId } : {}),
        ...(d.erpNumber ? { erpNumber: d.erpNumber } : {}),
        list: d.LIST || false,
        read: d.READ || false,
        write: d.WRITE || false,
        delete: d.DELETE || false,
      }));

      const serviceParams = JSON.stringify({
        fields: [
          { fieldType: 'name',        fieldI18n: [{ langCode: 'en', value: packageName }] },
          { fieldType: 'description', fieldI18n: [{ langCode: 'en', value: packageName }] },
          { fieldType: 'summary',     fieldI18n: [{ langCode: 'en', value: packageName }] },
        ],
        isPrivate: true,
        privateItemsData: { parentItemId: null, permissions },
      });

      return {
        type: 'EXPORT',
        serviceParameters: serviceParams,
        xsParameters: '{}',
        packageName,
        objects: items.map(r => ({
          xsParameters: '{}',
          serviceParameters: JSON.stringify({ includeData: includeData ? true : false, includeDependecies: this._includeDeps }),
          objectId: this._toObjectId(r),
          objectName: r.name || '',
          objectType: r.resourceType,
          description: `${r.name || ''} (${r.resourceType})`,
        })),
      };
    }

    async _createJobs() {
      const byType = this._buildObjects();
      this._jobs = [];

      if (this._packageMode === 'combined') {
        const allItems = Object.values(byType).flat();
        const payload = this._buildJobPayload(
          `${this._namePrefix}_COMBINED`,
          allItems,
          this._includeData
        );
        try {
          const jobId = await this._postJob(payload);
          this._jobs.push({ type: 'COMBINED', jobId, packageName: `${this._namePrefix}_COMBINED`,
                            status: 'CREATED', done: 0, total: allItems.length });
        } catch (e) {
          this._jobs.push({ type: 'COMBINED', jobId: null, packageName: `${this._namePrefix}_COMBINED`,
                            status: 'FAILED', done: 0, total: allItems.length, error: e.message });
        }
      } else {
        for (const [type, items] of Object.entries(byType)) {
          const packageName = `${this._namePrefix}_${type}`;
          const includeData = (type === 'CUBE' || type === 'DATASET') ? this._includeData : false;
          const payload = this._buildJobPayload(packageName, items, includeData);
          try {
            const jobId = await this._postJob(payload);
            this._jobs.push({ type, jobId, packageName,
                              status: 'CREATED', done: 0, total: items.length });
          } catch (e) {
            this._jobs.push({ type, jobId: null, packageName,
                              status: 'FAILED', done: 0, total: items.length, error: e.message });
          }
          this._render();
          await new Promise(r => setTimeout(r, 400));
        }
      }
    }

    async _postJob(payload) {
      console.log('[TransportWidget] POST /api/v1/content/jobs payload:', JSON.stringify(payload, null, 2));
      if (!payload.objects || payload.objects.length === 0) {
        throw new Error('No items found in selected folder. Check that the folder contains non-folder content.');
      }
      const r = await fetch(`${this._baseUrl}/api/v1/content/jobs`, {
        method: 'POST',
        headers: this._headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const body = await r.text();
        throw new Error(`Job creation failed (${r.status}): ${body.slice(0, 200)}`);
      }
      return r.json();
    }

    _step3Html() {
      const isRunning = this._jobs.some(j => j.status === 'EXECUTING' || j.status === 'CREATED');
      const isDone = this._jobs.length > 0 &&
        this._jobs.every(j => j.status === 'DONE' || j.status === 'FAILED' || j.status === 'UNKNOWN');

      return `
        <div class="card">
          <div class="card-title" style="display:flex;align-items:center;gap:8px;">
            ${isRunning ? '<span class="spinner"></span>' : ''}
            Step 3 — ${isDone ? 'Complete' : 'Creating Packages…'}
          </div>
          ${this._jobs.length === 0
            ? (() => {
                const byType = this._buildObjects();
                const total = Object.values(byType).flat().length;
                const types = Object.entries(byType).map(([t,v]) => `${t}:${v.length}`).join(', ');
                return `<div class="info-msg">Initializing… ${total} items (${types || 'none found'})</div>`;
              })()
            : this._jobs.map(j => this._jobRowHtml(j)).join('')
          }
          ${isDone ? `
            <div class="row-btns" style="margin-top:14px;">
              <button class="btn btn-ghost btn-sm" id="btn-copy-results">Copy Results</button>
              <button class="btn btn-ghost btn-sm" id="btn-step3-back">← New Export</button>
            </div>` : ''}
        </div>`;
    }

    _jobRowHtml(j) {
      const icon = j.status === 'DONE' ? `<span style="color:${C.ok}">✓</span>`
                 : j.status === 'FAILED' ? `<span style="color:${C.err}">✗</span>`
                 : j.status === 'UNKNOWN' ? `<span style="color:${C.warn}">?</span>`
                 : `<span class="spinner"></span>`;

      const detail = j.status === 'FAILED'
        ? `<div style="color:${C.err};font-size:11px;margin-top:3px;">${this._esc(j.error || '')}</div>`
        : j.status === 'DONE'
        ? `<div style="color:${C.textDim};font-size:11px;">itemId: ${this._esc(j.itemId || '')}</div>`
        : `<div style="color:${C.textDim};font-size:11px;">${j.done}/${j.total}</div>`;

      return `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;
                    border-bottom:1px solid ${C.border};">
          <div style="width:20px;text-align:center;margin-top:2px;">${icon}</div>
          <div style="flex:1;">
            <div style="font-size:13px;">${this._esc(j.packageName)}</div>
            ${detail}
          </div>
        </div>`;
    }

    _attachListeners() {
      // Click is handled by the permanent listener in connectedCallback (_handleClick).
      // Only re-attach change/input listeners here — they live on DOM elements
      // that are replaced on every render, so they must be re-added each time.
      this.shadowRoot.querySelectorAll('input[name=pkgmode]').forEach(r => {
        r.addEventListener('change', () => { this._packageMode = r.value; this._render(); });
      });
      this.shadowRoot.getElementById('tog-data')?.addEventListener('change', e => {
        this._includeData = e.target.checked; this._render();
      });
      this.shadowRoot.getElementById('tog-deps')?.addEventListener('change', e => {
        this._includeDeps = e.target.checked; this._render();
      });
      this.shadowRoot.getElementById('inp-prefix')?.addEventListener('input', e => {
        this._namePrefix = e.target.value;
        const preview = this.shadowRoot.querySelector('.info-msg');
        if (preview) preview.innerHTML = this._buildNamePreview(this._getTypeGroups());
      });
    }

    _handleClick(e) {
      const btn = e.target.closest('button, .tree-row');
      if (!btn) {
        if (e.target.id === 'help-overlay') { this._showHelp = false; this._render(); }
        return;
      }
      const id = btn.id;

      if (id === 'btn-help')       { this._showHelp = true;  this._render(); return; }
      if (id === 'btn-help-close') { this._showHelp = false; this._render(); return; }
      if (id === 'btn-settings')   { this._step = 0; this._error = ''; this._render(); return; }

      // Step 0
      if (id === 'btn-connect') { this._handleConnect(); return; }

      // Step 1
      if (id === 'btn-step1-back') { this._step = 0; this._error = ''; this._render(); return; }
      if (id === 'btn-step1-next') {
        if (!this._selectedFolderIds.size) return;
        const names = [...this._selectedFolderIds].map(fid => {
          const f = this._folders.find(f => f.resourceId === fid);
          return (f ? f.name : fid).replace(/[^a-zA-Z0-9_\-]/g, '_');
        });
        this._namePrefix = names.length === 1 ? names[0] : names.slice(0, 2).join('_');
        this._step = 2; this._render(); return;
      }
      if (id === 'btn-retry-tree') {
        this._loading = true; this._render();
        this._fetchFolderTree()
          .then(() => { this._collapsedFolders = new Set(this._folders.map(f => f.resourceId)); })
          .catch(err => { this._error = err.message; })
          .finally(() => { this._loading = false; this._render(); });
        return;
      }
      if (btn.classList.contains('tree-row')) {
        const fid = btn.dataset.id;
        if (e.target.dataset.chevron) {
          if (this._collapsedFolders.has(fid)) this._collapsedFolders.delete(fid);
          else this._collapsedFolders.add(fid);
        } else {
          if (this._selectedFolderIds.has(fid)) this._selectedFolderIds.delete(fid);
          else { this._selectedFolderIds.add(fid); this._collapsedFolders.delete(fid); }
        }
        this._render(); return;
      }

      // Step 2
      if (id === 'btn-step2-back') { this._step = 1; this._render(); return; }
      if (id === 'btn-step2-next') {
        const inp = this.shadowRoot.getElementById('inp-prefix');
        const prefix = (inp ? inp.value : this._namePrefix).trim();
        if (!prefix) { this._error = 'Package name prefix is required.'; this._render(); return; }
        this._namePrefix = prefix;
        this._error = '';
        this._jobs = [];
        this._step = 3;
        this._render();
        // Defer job creation until after render cycle completes
        setTimeout(() => { this._createJobs().then(() => this._startPolling()); }, 0);
        return;
      }
      if (id === 'btn-dest-show') {
        const form = this.shadowRoot.getElementById('dest-form');
        const showBtn = this.shadowRoot.getElementById('btn-dest-show');
        if (form) form.style.display = 'block';
        if (showBtn) showBtn.style.display = 'none';
        return;
      }
      if (id === 'btn-dest-cancel') {
        const form = this.shadowRoot.getElementById('dest-form');
        const showBtn = this.shadowRoot.getElementById('btn-dest-show');
        if (form) form.style.display = 'none';
        if (showBtn) showBtn.style.display = '';
        return;
      }
      if (id === 'btn-dest-add') {
        const url = (this.shadowRoot.getElementById('dest-url')?.value || '').trim();
        if (!url) return;
        const perms = ['LIST','READ','WRITE','DELETE'].reduce((acc, p) => {
          acc[p] = this.shadowRoot.getElementById('dest-perm-' + p)?.checked || false;
          return acc;
        }, {});
        this._destinations.push({
          tenantUrl: url,
          oemId: (this.shadowRoot.getElementById('dest-oem')?.value || '').trim(),
          erpNumber: (this.shadowRoot.getElementById('dest-erp')?.value || '').trim(),
          ...perms,
        });
        this._render(); return;
      }
      if (btn.dataset.destRemove !== undefined) {
        this._destinations.splice(parseInt(btn.dataset.destRemove, 10), 1);
        this._render(); return;
      }

      // Step 3
      if (id === 'btn-step3-back') {
        this._jobs = []; this._step = 1;
        this._selectedFolderIds = new Set();
        this._includeDeps = false;
        this._includeData = false;
        this._render(); return;
      }
      if (id === 'btn-copy-results') {
        const text = this._jobs.map(j =>
          j.status + '\t' + j.packageName + '\t' + j.done + '/' + j.total + '\t' + (j.itemId || j.error || '')
        ).join('\n');
        navigator.clipboard && navigator.clipboard.writeText(text);
        return;
      }
    }

    async _handleConnect() {
      const tokenUrl = (this.shadowRoot.getElementById('inp-tokenurl')?.value || '').trim();
      const clientId = (this.shadowRoot.getElementById('inp-clientid')?.value || '').trim();
      const clientSecret = (this.shadowRoot.getElementById('inp-secret')?.value || '').trim();
      const baseUrl = (this.shadowRoot.getElementById('inp-baseurl')?.value || '').trim();
      const tenantPrefixOverride = (this.shadowRoot.getElementById('inp-prefix-override')?.value || '').trim();
      if (!tokenUrl || !clientId || !clientSecret || !baseUrl) {
        this._error = 'All fields are required.'; this._render(); return;
      }
      this._saveSettings(tokenUrl, clientId, clientSecret, baseUrl, tenantPrefixOverride);
      if (tenantPrefixOverride) this._tenantPrefix = tenantPrefixOverride;
      this._error = '';
      this._loading = true;
      this._step = 1;
      this._render();
      try {
        await this._fetchAccessToken();
        await this._fetchCsrf();
        if (!this._tenantPrefix) await this._detectTenantPrefix();
        await this._fetchFolderTree();
        this._collapsedFolders = new Set(this._folders.map(f => f.resourceId));
        this._loading = false;
        this._render();
      } catch (e) {
        this._loading = false;
        this._error = e.message;
        this._step = 0;
        this._render();
      }
    }

    _helpHtml() {
      return `
        <div class="help-overlay" id="help-overlay">
          <div class="help-modal">
            <div class="help-header">
              <h3>Transport Package Creator — Help</h3>
              <button class="help-close" id="btn-help-close">×</button>
            </div>
            <div class="help-body">
              <h4>Prerequisites</h4>
              <ul>
                <li>Go to <strong>System → Administration → App Integration → OAuth Clients</strong></li>
                <li><strong>Authorization Grant:</strong> Client Credentials</li>
                <li><strong>Scope:</strong> Content Network (export/import access)</li>
                <li>The OAuth client user must have <strong>Manage permission on Public Files</strong></li>
              </ul>

              <h4>Setup</h4>
              <p>Click <strong>⚙</strong> and fill in:</p>
              <ul>
                <li><strong>Base URL</strong> — e.g. <code>https://tenant.ap11.analytics.cloud.sap</code></li>
                <li><strong>Token URL</strong> — e.g. <code>https://tenant.authentication.ap11.hana.ondemand.com/oauth/token</code></li>
                <li><strong>Client ID</strong> — OAuth Client ID from SAC App Integration</li>
                <li><strong>Secret</strong> — OAuth Client Secret</li>
              </ul>
              <p>Settings are saved in browser local storage — you only need to enter them once.</p>

              <h4>How to Use</h4>
              <div class="help-step"><div class="help-step-num">1</div><div>Click <strong>⚙ Settings</strong>, enter credentials and click <strong>Connect</strong>. The folder tree loads automatically.</div></div>
              <div class="help-step"><div class="help-step-num">2</div><div>Click folders to <strong>select</strong> them (✓). You can select multiple folders. Click the <strong>▸ chevron</strong> to expand/collapse without selecting.</div></div>
              <div class="help-step"><div class="help-step-num">3</div><div>Choose <strong>Package Mode</strong> — <em>Per type</em> creates one package per object type, <em>Combined</em> creates a single package for everything.</div></div>
              <div class="help-step"><div class="help-step-num">4</div><div>Set a <strong>Package Name Prefix</strong>. Packages will be named <code>PREFIX_STORY</code>, <code>PREFIX_CUBE</code>, etc.</div></div>
              <div class="help-step"><div class="help-step-num">5</div><div>Click <strong>Next →</strong> to create the transport packages. Status updates in real time as jobs complete.</div></div>

              <h4>Package Options</h4>
              <table class="help-table">
                <tr><th>Option</th><th>Description</th></tr>
                <tr><td><strong>Include model data</strong></td><td>Exports data rows from CUBE and Dataset objects. Leave off for schema-only export.</td></tr>
                <tr><td><strong>Include dependencies</strong></td><td>Automatically pulls in referenced objects (e.g. models used by a story).</td></tr>
              </table>

              <h4>Supported Object Types</h4>
              <p>Story · Model (CUBE) · Dataset · Planning Sequence · Multi Actions · Simulation · Add-In Workbook · Data Action · Video Data Story</p>
            </div>
          </div>
        </div>`;
    }

    _esc(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
  }

  customElements.define('com-shivam-transportpackage', TransportPackageWidget);
})();
