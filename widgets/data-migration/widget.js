/* SAC Migration Widget — com-custom-sac-migration-widget */
const WIDGET_TAG = 'com-custom-sac-migration-widget';

const WIDGET_CSS = `
.mw-root *, .mw-root *::before, .mw-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
com-custom-sac-migration-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; display: block; height: 100%; }
.mw-root { display: flex; flex-direction: column; height: 100%; min-height: 300px; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; position: relative; }
.mw-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f5f5f5; border-bottom: 1px solid #e0e0e0; flex-shrink: 0; }
.mw-header-title { font-weight: 600; color: #333; font-size: 13px; }
.mw-gear-btn { background: #444; color: #ccc; border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; }
.mw-gear-btn:hover { background: #555; }
.mw-settings { background: #fafafa; border-bottom: 1px solid #ddd; padding: 12px 16px; z-index: 10; box-shadow: 0 4px 8px rgba(0,0,0,0.10); flex-shrink: 0; max-height: 60%; overflow-y: auto; }
.mw-settings-title { font-size: 10px; font-weight: 700; color: #555; letter-spacing: 0.5px; margin-bottom: 10px; }
.mw-settings-cols { display: flex; gap: 16px; }
.mw-settings-col { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.mw-col-header { font-size: 10px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
.mw-col-src { color: #0070f3; }
.mw-col-dst { color: #e67e22; }
.mw-settings-col label { display: flex; flex-direction: column; font-size: 10px; color: #888; gap: 2px; }
.mw-settings-col input { border: 1px solid #e0e0e0; border-radius: 3px; padding: 4px 6px; font-size: 11px; color: #333; background: white; }
.mw-settings-col input:focus { outline: none; border-color: #0070f3; }
.mw-settings-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; }
.mw-settings-actions button { border-radius: 3px; padding: 5px 12px; font-size: 11px; cursor: pointer; border: 1px solid #e0e0e0; background: white; color: #555; }
.mw-body { display: flex; flex: 1; overflow: hidden; }
.mw-left { width: 38%; flex-shrink: 0; border-right: 1px solid #e0e0e0; padding: 12px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
.mw-field { display: flex; flex-direction: column; gap: 3px; }
.mw-field label { font-size: 10px; font-weight: 600; color: #555; }
.mw-field input { border: 1px solid #e0e0e0; border-radius: 3px; padding: 5px 7px; font-size: 11px; color: #333; background: #f9f9f9; }
.mw-field input:focus { outline: none; border-color: #0070f3; background: white; }
.mw-field-row { display: flex; gap: 8px; }
.mw-field-row .mw-field { flex: 1; }
.mw-actions { display: flex; gap: 6px; margin-top: auto; padding-top: 8px; }
.mw-btn-run { flex: 1; }
.mw-btn-stop { background: #f5f5f5; color: #888; border: 1px solid #e0e0e0; border-radius: 4px; padding: 8px 10px; font-size: 13px; cursor: pointer; }
.mw-btn-stop:hover { background: #ffe0e0; color: #c00; }
.mw-btn-stop:disabled { opacity: 0.4; cursor: default; }
.mw-btn-primary { background: #0070f3; color: white; border: none; border-radius: 4px; padding: 8px 12px; font-size: 11px; font-weight: 600; cursor: pointer; }
.mw-btn-primary:hover { background: #005fd4; }
.mw-btn-primary:disabled { background: #b0d0fb; cursor: default; }
.mw-right { flex: 1; display: flex; flex-direction: column; background: #111; overflow: hidden; }
.mw-log-header { display: flex; justify-content: space-between; align-items: center; padding: 7px 12px; border-bottom: 1px solid #222; flex-shrink: 0; }
.mw-log-header span { color: #aaa; font-size: 10px; font-weight: 600; }
.mw-log-header-left { display: flex; align-items: center; gap: 8px; }
.mw-btn-download { background: #1a3a1a; color: #00cc66; border: 1px solid #00cc66; border-radius: 3px; padding: 2px 8px; font-size: 9px; font-weight: 600; cursor: pointer; letter-spacing: 0.3px; }
.mw-btn-download:hover { background: #004400; }
.mw-btn-download:disabled { opacity: 0.3; cursor: default; }
.mw-log-body { flex: 1; overflow-y: auto; padding: 10px 12px; font-family: 'Courier New', Courier, monospace; font-size: 10px; line-height: 1.8; color: #ccc; }
.mw-log-hint { color: #555; }
.mw-log-error { color: #ff6b6b; }
.mw-log-success { color: #00ff88; }
.mw-log-warn { color: #ffc107; }
.mw-badge { font-size: 9px; padding: 2px 7px; border-radius: 3px; font-weight: 700; letter-spacing: 0.5px; }
.mw-badge-idle    { background: #333; color: #888; }
.mw-badge-running { background: #1a4a8a; color: #66aaff; }
.mw-badge-done    { background: #1a4a2a; color: #00cc66; }
.mw-badge-error   { background: #4a1a1a; color: #ff6b6b; }
`;

function lsLoad(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}

function lsSave(key, obj) {
  try { localStorage.setItem(key, JSON.stringify(obj)); } catch {}
}

// ─────────────────────────────────────────────
// RETRY HELPER
// ─────────────────────────────────────────────

async function fetchWithRetry(fn, { maxAttempts = 3, onRetry = null } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastErr = err;
      if (attempt < maxAttempts) {
        const delay = Math.min(30000, 2000 * Math.pow(1.8, attempt - 1) + Math.random() * 1000);
        if (onRetry) onRetry(attempt, err, delay);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

// ─────────────────────────────────────────────
// OAUTH CLIENT
// ─────────────────────────────────────────────

class OAuthClient {
  constructor(tokenUrl, clientId, clientSecret) {
    this.tokenUrl = tokenUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this._token = null;
    this._expiresAt = 0;
  }

  async fetch(signal) {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    const resp = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal,
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`OAuth ${resp.status}: ${text.slice(0, 200)}`);
    }
    const json = await resp.json();
    this._token = json.access_token;
    this._expiresAt = Date.now() + ((json.expires_in || 3600) - 60) * 1000;
    return this._token;
  }

  async get(signal, force = false) {
    if (!force && this._token && Date.now() < this._expiresAt) {
      return this._token;
    }
    return this.fetch(signal);
  }
}

// ─────────────────────────────────────────────
// CSRF CLIENT
// ─────────────────────────────────────────────

class CsrfClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this._token = null;
    this._lastFetch = 0;
    this._maxAgeMs = 10 * 60 * 1000; // 10 minutes
  }

  async fetch(bearerToken, signal) {
    const url = `${this.baseUrl}/api/v1/csrf`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'x-csrf-token': 'fetch',
        'x-sap-sac-custom-auth': 'true',
        'Accept': 'application/json',
      },
      signal,
    });
    const token = resp.headers.get('x-csrf-token') || resp.headers.get('X-CSRF-Token');
    if (!resp.ok || !token) {
      throw new Error(`CSRF fetch failed: HTTP ${resp.status}, token=${token}`);
    }
    this._token = token;
    this._lastFetch = Date.now();
    return token;
  }

  async get(bearerToken, signal, force = false) {
    if (!force && this._token && (Date.now() - this._lastFetch) < this._maxAgeMs) {
      return this._token;
    }
    return this.fetch(bearerToken, signal);
  }
}

// ─────────────────────────────────────────────
// SOURCE CLIENT
// ─────────────────────────────────────────────

class SourceClient {
  constructor(baseUrl, oauthClient) {
    this.base = baseUrl.replace(/\/$/, '');
    this._oauth = oauthClient;
    this._cachedToken = null;
  }

  async _headers(signal) {
    const token = await this._oauth.get(signal);
    return { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
  }

  async metadata(modelId, signal) {
    const url = `${this.base}/api/v1/dataexport/providers/sac/${modelId}/$metadata?$format=JSON`;
    const resp = await fetch(url, { headers: await this._headers(signal), signal });
    if (!resp.ok) throw new Error(`GET $metadata: HTTP ${resp.status}`);
    return resp.json();
  }

  async factCount(modelId, odataFilter, signal) {
    let url = `${this.base}/api/v1/dataexport/providers/sac/${modelId}/FactData?$count=true&$top=0`;
    if (odataFilter && odataFilter.trim()) {
      url += `&$filter=${encodeURIComponent(odataFilter.trim())}`;
    }
    const resp = await fetch(url, { headers: await this._headers(signal), signal });
    if (!resp.ok) throw new Error(`GET FactData count: HTTP ${resp.status}`);
    const json = await resp.json();
    return parseInt(json['@odata.count'] || 0, 10);
  }

  // Async generator that yields pages (arrays of row objects)
  async *iterFactPages(modelId, filterExpr, baseFilter, pageSize, signal) {
    const filters = [];
    if (baseFilter && baseFilter.trim()) filters.push(`(${baseFilter.trim()})`);
    if (filterExpr && filterExpr.trim()) filters.push(`(${filterExpr.trim()})`);

    let url = `${this.base}/api/v1/dataexport/providers/sac/${modelId}/FactData?pagesize=${pageSize}`;
    if (filters.length) url += `&$filter=${encodeURIComponent(filters.join(' and '))}`;

    let pageNo = 0;
    while (url) {
      if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const resp = await fetch(url, { headers: await this._headers(signal), signal });
      if (!resp.ok) throw new Error(`GET FactData page ${pageNo + 1}: HTTP ${resp.status}`);
      const json = await resp.json();
      const rows = json.value || [];
      pageNo++;
      yield rows;
      url = json['@odata.nextLink'] || json['odata.nextLink'] || null;
    }
  }

  async aggregationGroups(modelId, dims, baseFilter, signal) {
    let url = `${this.base}/api/v1/dataexport/providers/sac/${modelId}/FactDataAggregation?$select=${dims.join(',')}&$count=true`;
    if (baseFilter && baseFilter.trim()) url += `&$filter=${encodeURIComponent(baseFilter.trim())}`;
    const resp = await fetch(url, { headers: await this._headers(signal), signal });
    if (!resp.ok) throw new Error(`GET FactDataAggregation: HTTP ${resp.status}`);
    const json = await resp.json();
    return json.value || [];
  }

  async masterData(modelId, dimName, signal) {
    const all = [];
    let url = `${this.base}/api/v1/dataexport/providers/sac/${modelId}/${dimName}Master`;
    while (url) {
      const resp = await fetch(url, { headers: { ...await this._headers(signal), 'Accept': 'application/json' }, signal });
      if (!resp.ok) throw new Error(`GET ${dimName}Master: HTTP ${resp.status}`);
      const json = await resp.json();
      all.push(...(json.value || []));
      url = json['@odata.nextLink'] || json['odata.nextLink'] || null;
    }
    return all;
  }
}

// ─────────────────────────────────────────────
// FIELD DISCOVERY
// ─────────────────────────────────────────────

function discoverFields(metadataJson) {
  const DECIMAL_LIKE = new Set(['Edm.Decimal', 'Edm.Double', 'Edm.Int64', 'Edm.Int32', 'Edm.Int16']);
  const dims = [], measures = [], masterKeys = {};
  let factEntity = null;

  for (const [nsName, nsVal] of Object.entries(metadataJson)) {
    if (nsName.startsWith('$') || typeof nsVal !== 'object') continue;
    for (const [etName, etVal] of Object.entries(nsVal)) {
      if (typeof etVal !== 'object') continue;
      if (etVal.$Kind === 'EntityType') {
        if (etName.toLowerCase().endsWith('factdata') && !factEntity) {
          factEntity = etVal;
        }
        if (etName === 'MasterData') {
          for (const kval of (etVal.$Key || [])) {
            if (kval.includes('___')) {
              const [dim, key] = kval.split('___', 2);
              masterKeys[dim] = key;
            }
          }
        }
      }
    }
  }

  if (factEntity) {
    for (const [name, spec] of Object.entries(factEntity)) {
      if (name.startsWith('@') || name.startsWith('$')) continue;
      if (typeof spec === 'object' && spec.$Type) {
        (DECIMAL_LIKE.has(spec.$Type) ? measures : dims).push(name);
      }
    }
    for (const k of (factEntity.$Key || [])) {
      if (!dims.includes(k)) dims.push(k);
    }
  }

  return {
    dims: [...new Set(dims)],
    measures: [...new Set(measures)],
    masterKeys,
  };
}

function transformRows(rows, dims, measures) {
  const keep = new Set([...dims, ...measures]);
  return rows.map(r => {
    const out = {};
    for (const k of keep) if (k in r) out[k] = r[k];
    return out;
  });
}

// ─────────────────────────────────────────────
// DESTINATION CLIENT
// ─────────────────────────────────────────────

class DestinationClient {
  constructor(baseUrl, oauthClient, csrfToken) {
    this.base = baseUrl.replace(/\/$/, '');
    this._oauth = oauthClient;
    this.csrf = csrfToken;
  }

  async _headers(signal) {
    const token = await this._oauth.get(signal);
    return {
      'Authorization': `Bearer ${token}`,
      'X-CSRF-Token': this.csrf,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async createJob(modelId, signal) {
    const url = `${this.base}/api/v1/dataimport/models/${modelId}/factData`;
    const resp = await fetch(url, { method: 'POST', headers: await this._headers(signal), body: '{}', signal });
    if (!resp.ok) throw new Error(`createJob HTTP ${resp.status}`);
    const json = await resp.json();
    const jobId = json.jobID || json.id || json.jobId;
    if (!jobId) throw new Error(`createJob: no jobId in response: ${JSON.stringify(json)}`);
    return jobId;
  }

  async uploadChunk(jobId, rows, signal) {
    const url = `${this.base}/api/v1/dataimport/jobs/${jobId}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: await this._headers(signal),
      body: JSON.stringify({ Data: rows }),
      signal,
    });
    if (!resp.ok) throw new Error(`uploadChunk HTTP ${resp.status}`);
    return resp.json();
  }

  async validate(jobId, signal) {
    const url = `${this.base}/api/v1/dataimport/jobs/${jobId}/validate`;
    const resp = await fetch(url, { method: 'POST', headers: await this._headers(signal), body: '{}', signal });
    if (!resp.ok) throw new Error(`validate HTTP ${resp.status}`);
    return resp.json();
  }

  async run(jobId, signal) {
    const url = `${this.base}/api/v1/dataimport/jobs/${jobId}/run`;
    const resp = await fetch(url, { method: 'POST', headers: await this._headers(signal), body: '{}', signal });
    if (!resp.ok) throw new Error(`run HTTP ${resp.status}`);
    return resp.json();
  }

  async status(jobId, signal) {
    const url = `${this.base}/api/v1/dataimport/jobs/${jobId}/status`;
    const resp = await fetch(url, { method: 'GET', headers: await this._headers(signal), signal });
    if (!resp.ok) throw new Error(`status HTTP ${resp.status}`);
    return resp.json();
  }
}

// ─────────────────────────────────────────────
// JOB POLLING
// ─────────────────────────────────────────────

async function pollJobs(dst, jobIds, logFn, signal) {
  const TERMINAL = new Set(['COMPLETED', 'FAILED', 'CANCELLED', 'CANCELED']);
  const pending = new Set(jobIds);
  const results = {};

  while (pending.size > 0) {
    if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
    for (const jobId of [...pending]) {
      try {
        const st = await dst.status(jobId, signal);
        const status = (st.jobStatus || st.status || '').toUpperCase();
        const desc = st.jobStatusDescription || st.description || '';
        logFn(`⏳ Job ${jobId}: ${status} ${desc}`);
        if (TERMINAL.has(status)) {
          pending.delete(jobId);
          results[jobId] = status;
        }
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        logFn(`⚠️ Status check error for job ${jobId}: ${err.message}`);
      }
    }
    if (pending.size > 0) {
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  return results;
}

// ─────────────────────────────────────────────
// GROUP DISCOVERY (PARALLELIZATION)
// ─────────────────────────────────────────────

async function discoverGroups(src, modelId, dimExpr, masterKeys, baseFilter, logFn, signal) {
  if (!dimExpr || !dimExpr.trim()) return [];

  const parts = dimExpr.trim().split(/\s+and\s+/i).map(s => s.trim()).filter(Boolean);
  const dimsAttrs = parts.map(ex => {
    if (ex.includes('.')) { const [d, a] = ex.split('.', 2); return { dim: d, attr: a }; }
    return { dim: ex, attr: null };
  });

  // Only fetch master data for dimensions that need attribute grouping
  const masterData = {};
  for (const { dim, attr } of dimsAttrs) {
    if (attr) {
      const keyCol = masterKeys[dim] || 'ID';
      logFn(`🔐 Master key for ${dim} = ${keyCol} (attr: ${attr})`);
      const rows = await src.masterData(modelId, dim, signal);
      masterData[dim] = { keyCol, rows };
    }
  }

  const selectDims = dimsAttrs.map(da => da.dim);
  const aggRows = await src.aggregationGroups(modelId, selectDims, baseFilter, signal);
  logFn(`🧩 FactDataAggregation returned ${aggRows.length} combinations`);

  if (dimsAttrs.length === 1) {
    const { dim, attr } = dimsAttrs[0];
    const keysWithData = [...new Set(aggRows.map(r => r[dim]).filter(v => v != null && v !== ''))].sort();

    if (!attr) {
      // No master data needed — build one group per distinct member key
      const groups = keysWithData.map(mk => ({
        group_label: `${dim}=${mk}`,
        filters: [{ dimension: dim, members: [mk] }],
      }));
      logFn(`🧩 Built ${groups.length} groups for ${dim}`);
      return groups;
    }

    // Attribute grouping: map member keys → attribute values via master data
    const { keyCol, rows } = masterData[dim];
    const attrToMembers = {};
    const memberToAttr = {};
    for (const row of rows) {
      const mk = row[keyCol];
      const av = row[attr];
      if (mk != null && mk !== '' && av != null && av !== '') {
        memberToAttr[mk] = av;
        if (!attrToMembers[av]) attrToMembers[av] = [];
        attrToMembers[av].push(mk);
      }
    }
    const keysSet = new Set(keysWithData);
    const attrValues = [...new Set(keysWithData.map(mk => memberToAttr[mk]).filter(Boolean))].sort();
    const groups = [];
    for (const av of attrValues) {
      const mems = (attrToMembers[av] || []).filter(mk => keysSet.has(mk));
      if (mems.length) {
        groups.push({ group_label: `${dim}.${attr}=${av}`, filters: [{ dimension: dim, members: mems }] });
      }
    }
    logFn(`🧩 Built ${groups.length} groups for ${dim}.${attr}`);
    return groups;
  }

  // Multi-dimension: build groups from aggRows directly when no attrs; use master data when attrs needed
  const combos = new Map();
  for (const rr of aggRows) {
    const mks = [], displayVals = [];
    let ok = true;
    for (const { dim, attr } of dimsAttrs) {
      const mk = rr[dim];
      if (mk == null || mk === '') { ok = false; break; }
      mks.push(mk);
      if (attr) {
        const { keyCol, rows } = masterData[dim];
        const av = rows.find(r => r[keyCol] === mk)?.[attr];
        if (!av) { ok = false; break; }
        displayVals.push(String(av));
      } else {
        displayVals.push(String(mk));
      }
    }
    if (ok) combos.set(displayVals.join('|'), mks);
  }

  const groups = [];
  for (const [dispKey, mks] of [...combos.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const dispVals = dispKey.split('|');
    const labelParts = [], filters = [];
    for (let i = 0; i < dimsAttrs.length; i++) {
      const { dim, attr } = dimsAttrs[i];
      labelParts.push(`${attr ? dim + '.' + attr : dim}=${dispVals[i]}`);
      filters.push({ dimension: dim, members: [mks[i]] });
    }
    groups.push({ group_label: labelParts.join(' AND '), filters });
  }

  logFn(`🧩 Built ${groups.length} groups for ${parts.join(' AND ')}`);
  return groups;
}

// ─────────────────────────────────────────────
// MIGRATION RUNNER
// ─────────────────────────────────────────────

function buildGroupFilter(group) {
  const parts = (group.filters || []).map(f => {
    if (!f.dimension || !f.members || !f.members.length) return '';
    const orParts = f.members.map(m => `${f.dimension} eq '${String(m).replace(/'/g, "''")}'`);
    return `(${orParts.join(' or ')})`;
  }).filter(Boolean);
  return parts.join(' and ');
}

const MAX_ROWS_PER_JOB = 10_000_000;

async function processGroup(src, dst, srcModelId, dstModelId, group, dims, measures, batchSize, baseFilter, logFn, signal) {
  const label = group.group_label;
  const groupFilter = buildGroupFilter(group);
  let jobId = await dst.createJob(dstModelId, signal);
  logFn(`🔗 [${label}] Job: ${jobId}`);

  let rowsInJob = 0;
  let totalRowsThisGroup = 0;
  let pageNo = 0;
  const jobIds = [];

  for await (const pageRows of src.iterFactPages(srcModelId, groupFilter, baseFilter, batchSize, signal)) {
    if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
    pageNo++;
    logFn(`📦 [${label}] Page ${pageNo}: ${pageRows.length} rows`);
    if (!pageRows.length) continue;

    const transformed = transformRows(pageRows, dims, measures);
    let idx = 0;
    while (idx < transformed.length) {
      if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const remaining = MAX_ROWS_PER_JOB - rowsInJob;
      if (remaining <= 0) {
        await dst.validate(jobId, signal);
        await dst.run(jobId, signal);
        logFn(`🏁 [${label}] Job ${jobId} submitted (10M cap)`);
        jobIds.push(jobId);
        jobId = await dst.createJob(dstModelId, signal);
        logFn(`🔁 [${label}] New job: ${jobId}`);
        rowsInJob = 0;
        continue;
      }
      const toSend = Math.min(remaining, transformed.length - idx);
      const chunk = transformed.slice(idx, idx + toSend);
      await dst.uploadChunk(jobId, chunk, signal);
      rowsInJob += chunk.length;
      totalRowsThisGroup += chunk.length;
      idx += chunk.length;
      logFn(`⬆️ [${label}] Uploaded ${totalRowsThisGroup.toLocaleString()} rows so far`);
    }
  }

  const valResult = await dst.validate(jobId, signal);
  const failedRows = valResult.failedNumberRows || 0;
  const dimInvalidValues = {};
  if (failedRows > 0) {
    logFn(`⚠️ [${label}] Validation: ${failedRows.toLocaleString()} failed rows`);
    try {
      const inv = await dst.invalidRows(jobId, signal);
      const rows = inv.failedRows || inv.invalidRows || [];
      for (const item of rows) {
        const row = item.row || item;
        const reason = (item.reason || item.message || item.error || item.description || '').trim();
        const m = reason.match(/Invalid column value for:\s*(.+)/i);
        if (m) {
          const dim = m[1].trim();
          const val = row[dim];
          if (val != null && val !== '') {
            if (!dimInvalidValues[dim]) dimInvalidValues[dim] = new Set();
            dimInvalidValues[dim].add(val);
          }
        }
      }
    } catch (e) {
      logFn(`⚠️ [${label}] Could not fetch invalid row details: ${e.message}`);
    }
  } else {
    logFn(`✅ [${label}] Validation passed (0 failed rows)`);
  }
  await dst.run(jobId, signal);
  logFn(`🏁 [${label}] Job ${jobId} submitted`);
  jobIds.push(jobId);

  return { jobIds, totalRows: totalRowsThisGroup, failedRows, dimInvalidValues };
}

async function runMigration({ settings, odataFilter, dimExpr, batchSize, parallelJobs, logFn, signal }) {
  const startTime = Date.now();

  logFn('🔑 Fetching source OAuth token...');
  const srcOAuth = new OAuthClient(settings.sourceTokenUrl, settings.sourceClientId, settings.sourceSecret);
  const srcToken = await srcOAuth.fetch(signal);
  logFn('✅ Source token obtained');

  logFn('🔑 Fetching destination OAuth token...');
  const dstOAuth = new OAuthClient(settings.destTokenUrl, settings.destClientId, settings.destSecret);
  const dstToken = await dstOAuth.fetch(signal);
  logFn('✅ Destination token obtained');

  logFn('🛡️ Fetching CSRF token...');
  const csrfClient = new CsrfClient(settings.destBaseUrl);
  const csrfToken = await csrfClient.fetch(dstToken, signal);
  logFn('✅ CSRF token obtained');

  const src = new SourceClient(settings.sourceBaseUrl, srcOAuth);
  const dst = new DestinationClient(settings.destBaseUrl, dstOAuth, csrfToken);

  // Proactively refresh CSRF every 10 minutes
  const csrfRefreshTimer = setInterval(async () => {
    try {
      const newToken = await dstOAuth.get(signal);
      const newCsrf = await csrfClient.fetch(newToken, signal);
      dst.csrf = newCsrf;
    } catch {}
  }, 10 * 60 * 1000);

  try {
    logFn('🔎 Fetching model metadata...');
    const metadata = await src.metadata(settings.sourceModelId, signal);
    const { dims, measures, masterKeys } = discoverFields(metadata);
    logFn(`🧭 Discovered ${dims.length} dimensions, ${measures.length} measures`);

    logFn('📊 Fetching total row count...');
    const total = await src.factCount(settings.sourceModelId, odataFilter, signal);
    logFn(`✅ Total rows to migrate: ${total.toLocaleString()}`);

    if (total === 0) {
      logFn('⚠️ 0 rows from source — nothing to migrate');
      return { rowsMigrated: 0, elapsed: Date.now() - startTime };
    }

    logFn('🧩 Discovering parallelization groups...');
    const groups = await discoverGroups(src, settings.sourceModelId, dimExpr, masterKeys, odataFilter, logFn, signal);

    const workGroups = groups.length > 0
      ? groups
      : [{ group_label: 'single-stream', filters: [] }];

    if (groups.length === 0) {
      logFn('🧩 No grouping configured — single stream mode');
    } else {
      logFn(`🧩 ${groups.length} parallel groups discovered`);
    }

    const allJobIds = [];
    let totalRowsMigrated = 0;
    let totalFailedRows = 0;
    let allDimInvalidValues = {};
    let groupsDone = 0;

    for (let i = 0; i < workGroups.length; i += parallelJobs) {
      if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const batch = workGroups.slice(i, i + parallelJobs);
      logFn(`🚀 Processing groups ${i + 1}–${i + batch.length} of ${workGroups.length}`);

      const batchResults = await Promise.all(
        batch.map(group =>
          fetchWithRetry(
            () => processGroup(src, dst, settings.sourceModelId, settings.destModelId, group, dims, measures, batchSize, odataFilter, logFn, signal),
            {
              maxAttempts: 3,
              onRetry: (attempt, err) => logFn(`↩️ Retrying group ${group.group_label} (attempt ${attempt}): ${err.message}`),
            }
          ).catch(err => {
            if (err.name === 'AbortError') throw err;
            logFn(`❌ Group ${group.group_label} failed after retries: ${err.message}`);
            return { jobIds: [], totalRows: 0 };
          })
        )
      );

      for (const result of batchResults) {
        allJobIds.push(...result.jobIds);
        totalRowsMigrated += result.totalRows;
        totalFailedRows += result.failedRows || 0;
        for (const [dim, vals] of Object.entries(result.dimInvalidValues || {})) {
          if (!allDimInvalidValues[dim]) allDimInvalidValues[dim] = new Set();
          for (const v of vals) allDimInvalidValues[dim].add(v);
        }
        groupsDone++;
      }
      logFn(`✅ ${groupsDone}/${workGroups.length} groups submitted`);
    }

    logFn(`🔎 Polling ${allJobIds.length} job(s) until complete...`);
    const results = await pollJobs(dst, allJobIds, logFn, signal);

    const completed = Object.values(results).filter(s => s === 'COMPLETED').length;
    const failed = Object.values(results).filter(s => s === 'FAILED').length;

    const elapsed = Date.now() - startTime;
    const hh = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
    const mm = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
    const ss = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');

    const successRows = totalRowsMigrated - totalFailedRows;

    logFn('');
    logFn('---------------------------------------');
    logFn(`Start Time: ${new Date(startTime).toISOString()}`);
    logFn(`Source SAC Tenant: ${settings.sourceBaseUrl}`);
    logFn(`Source Model: ${settings.sourceModelId}`);
    logFn(`Filters Applied: ${odataFilter || '(none)'}`);
    logFn(`Grouping Dimension: ${dimExpr || '(none)'}`);
    logFn(`# of Groups: ${workGroups.length}`);
    logFn('---------------------------------------');
    logFn(`Destination SAC Tenant: ${settings.destBaseUrl}`);
    logFn(`Destination Model: ${settings.destModelId}`);
    logFn('---------------------------------------');
    logFn(`Batch Size used: ${batchSize.toLocaleString()}`);
    logFn(`# of Parallel Processes: ${parallelJobs}`);
    logFn(`# of Upload Jobs: ${allJobIds.length}`);
    logFn('---------------------------------------');
    logFn(`Total Rows in all jobs: ${totalRowsMigrated.toLocaleString()}`);

    if (totalFailedRows > 0) {
      if (!dimExpr && totalFailedRows >= 2000) {
        logFn(`⚠️  WARNING: Single-stream mode — SAC caps failed row reporting at ~2,000 per job.`);
        logFn(`   Actual rejection count may be higher. Re-run with a parallelization dimension for accurate reporting.`);
      }
      logFn(`Number of Failed Rows: ${totalFailedRows.toLocaleString()}`);
      logFn(`Total Successful Rows uploaded: ${successRows.toLocaleString()}`);
      if (successRows === 0) {
        logFn(`⚠️  WARNING: 0 rows successfully transferred — all rows were rejected.`);
      }
      const dimEntries = Object.entries(allDimInvalidValues);
      if (dimEntries.length > 0) {
        logFn('---------------------------------------');
        logFn('Invalid values blocking transfer (add these to destination model master data):');
        for (const [dim, vals] of dimEntries.sort()) {
          const sorted = [...vals].sort();
          logFn(`  ${dim}: ${sorted.length} unique invalid value(s)`);
          sorted.slice(0, 50).forEach(v => logFn(`    - ${v}`));
          if (sorted.length > 50) logFn(`    ... and ${sorted.length - 50} more`);
        }
      }
    } else {
      logFn(`Number of Failed Rows: 0`);
      logFn(`Total Successful Rows uploaded: ${successRows.toLocaleString()}`);
    }

    logFn('---------------------------------------');
    logFn(`Jobs: ${completed} completed, ${failed} failed`);
    logFn(`Total Elapsed Time: ${hh}:${mm}:${ss}`);
    logFn('🎉 Done.');

    return { rowsMigrated: totalRowsMigrated, rowsFailed: totalFailedRows, elapsed, jobsCompleted: completed, jobsFailed: failed };
  } finally {
    clearInterval(csrfRefreshTimer);
  }
}

class SacMigrationWidget extends HTMLElement {
  constructor() {
    super();
    this._props = {};
    this._rendered = false;
  }

  connectedCallback() {
    if (!this._rendered) {
      this._render();
      this._setupSettingsPanel();
      this._setupRunControls();
      this._rendered = true;
    }
  }

  _loadSettings() {
    // Widget Properties are the defaults; localStorage overrides them
    const stored = lsLoad(this._lsKey());
    const p = this._props;
    return {
      sourceBaseUrl:  stored.sourceBaseUrl  ?? p.sourceBaseUrl  ?? '',
      sourceTokenUrl: stored.sourceTokenUrl ?? p.sourceTokenUrl ?? '',
      sourceClientId: stored.sourceClientId ?? p.sourceClientId ?? '',
      sourceSecret:   stored.sourceSecret   ?? p.sourceSecret   ?? '',
      sourceModelId:  stored.sourceModelId  ?? p.sourceModelId  ?? '',
      destBaseUrl:    stored.destBaseUrl    ?? p.destBaseUrl    ?? '',
      destTokenUrl:   stored.destTokenUrl   ?? p.destTokenUrl   ?? '',
      destClientId:   stored.destClientId   ?? p.destClientId   ?? '',
      destSecret:     stored.destSecret     ?? p.destSecret     ?? '',
      destModelId:    stored.destModelId    ?? p.destModelId    ?? '',
    };
  }

  _setupSettingsPanel() {
    const panel   = this.querySelector('#mw-settings');
    const gearBtn = this.querySelector('#mw-settings-btn');
    const saveBtn = this.querySelector('#mw-save-btn');
    const cancelBtn = this.querySelector('#mw-cancel-btn');

    gearBtn.addEventListener('click', () => {
      const isHidden = panel.style.display === 'none';
      if (isHidden) {
        // Populate inputs from current settings before showing
        const s = this._loadSettings();
        this.querySelector('#s-baseUrl').value  = s.sourceBaseUrl;
        this.querySelector('#s-tokenUrl').value = s.sourceTokenUrl;
        this.querySelector('#s-clientId').value = s.sourceClientId;
        this.querySelector('#s-secret').value   = s.sourceSecret;
        this.querySelector('#s-modelId').value  = s.sourceModelId;
        this.querySelector('#d-baseUrl').value  = s.destBaseUrl;
        this.querySelector('#d-tokenUrl').value = s.destTokenUrl;
        this.querySelector('#d-clientId').value = s.destClientId;
        this.querySelector('#d-secret').value   = s.destSecret;
        this.querySelector('#d-modelId').value  = s.destModelId;
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    });

    saveBtn.addEventListener('click', () => {
      lsSave(this._lsKey(), {
        sourceBaseUrl:  this.querySelector('#s-baseUrl').value.trim(),
        sourceTokenUrl: this.querySelector('#s-tokenUrl').value.trim(),
        sourceClientId: this.querySelector('#s-clientId').value.trim(),
        sourceSecret:   this.querySelector('#s-secret').value.trim(),
        sourceModelId:  this.querySelector('#s-modelId').value.trim(),
        destBaseUrl:    this.querySelector('#d-baseUrl').value.trim(),
        destTokenUrl:   this.querySelector('#d-tokenUrl').value.trim(),
        destClientId:   this.querySelector('#d-clientId').value.trim(),
        destSecret:     this.querySelector('#d-secret').value.trim(),
        destModelId:    this.querySelector('#d-modelId').value.trim(),
      });
      panel.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
      panel.style.display = 'none';
    });
  }

  _lsKey() {
    return 'sac_mw_' + (this._props.instanceId || 'default');
  }

  _render() {
    // Inject styles once into document head (avoids re-injection on re-render)
    if (!document.getElementById('mw-styles')) {
      const s = document.createElement('style');
      s.id = 'mw-styles';
      s.textContent = WIDGET_CSS;
      document.head.appendChild(s);
    }
    this.innerHTML = `
      <div class="mw-root">

        <!-- HEADER BAR -->
        <div class="mw-header">
          <span class="mw-header-title">SAC Data Migration</span>
          <button id="mw-settings-btn" class="mw-gear-btn">⚙️ Settings</button>
        </div>

        <!-- SETTINGS PANEL (hidden by default) -->
        <div class="mw-settings" id="mw-settings" style="display:none;">
          <div class="mw-settings-title">CONNECTION SETTINGS</div>
          <div class="mw-settings-cols">
            <div class="mw-settings-col">
              <div class="mw-col-header mw-col-src">SOURCE</div>
              <label>Base URL<input id="s-baseUrl" type="text" /></label>
              <label>Token URL<input id="s-tokenUrl" type="text" /></label>
              <label>Client ID<input id="s-clientId" type="text" /></label>
              <label>Secret<input id="s-secret" type="password" /></label>
              <label>Model ID<input id="s-modelId" type="text" /></label>
            </div>
            <div class="mw-settings-col">
              <div class="mw-col-header mw-col-dst">DESTINATION</div>
              <label>Base URL<input id="d-baseUrl" type="text" /></label>
              <label>Token URL<input id="d-tokenUrl" type="text" /></label>
              <label>Client ID<input id="d-clientId" type="text" /></label>
              <label>Secret<input id="d-secret" type="password" /></label>
              <label>Model ID<input id="d-modelId" type="text" /></label>
            </div>
          </div>
          <div class="mw-settings-actions">
            <button id="mw-cancel-btn">Cancel</button>
            <button id="mw-save-btn" class="mw-btn-primary">💾 Save</button>
          </div>
        </div>

        <!-- BODY: split panel -->
        <div class="mw-body">

          <!-- LEFT PANEL -->
          <div class="mw-left">
            <div class="mw-field">
              <label>OData Filter</label>
              <input id="mw-filter" type="text" placeholder="e.g. Version eq 'public.Actual'" />
            </div>
            <div class="mw-field">
              <label>Dimension for Parallelization</label>
              <input id="mw-dim" type="text" placeholder="e.g. Version or Version and Date" />
            </div>
            <div class="mw-field-row">
              <div class="mw-field">
                <label>Batch Size</label>
                <input id="mw-batch" type="number" value="100000" min="1000" />
              </div>
              <div class="mw-field">
                <label>Parallel Jobs</label>
                <input id="mw-parallel" type="number" value="20" min="1" max="50" />
              </div>
            </div>
            <div class="mw-actions">
              <button id="mw-run-btn" class="mw-btn-primary mw-btn-run">▶ Run Migration</button>
              <button id="mw-stop-btn" class="mw-btn-stop">⏹</button>
            </div>
          </div>

          <!-- RIGHT PANEL (log) -->
          <div class="mw-right">
            <div class="mw-log-header">
              <div class="mw-log-header-left">
                <span>📋 LOG</span>
                <button id="mw-download-btn" class="mw-btn-download" disabled>⬇ Download Log</button>
              </div>
              <span id="mw-status" class="mw-badge mw-badge-idle">IDLE</span>
            </div>
            <div id="mw-log" class="mw-log-body">
              <div class="mw-log-hint">Configure settings and click ▶ Run Migration</div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  _log(msg) {
    const log = this.querySelector('#mw-log');
    if (!log) return;
    const line = document.createElement('div');
    const ts = new Date().toTimeString().slice(0, 8);
    line.textContent = `[${ts}] ${msg}`;
    // Colour coding based on content
    if (/❌|error|fail/i.test(msg))   line.classList.add('mw-log-error');
    else if (/⚠️|warn/i.test(msg))    line.classList.add('mw-log-warn');
    else if (/✅|done|complet/i.test(msg)) line.classList.add('mw-log-success');
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  _setStatus(status) {
    const badge = this.querySelector('#mw-status');
    if (!badge) return;
    badge.textContent = status.toUpperCase();
    badge.className = 'mw-badge mw-badge-' + status.toLowerCase();
  }

  _setupRunControls() {
    const runBtn      = this.querySelector('#mw-run-btn');
    const stopBtn     = this.querySelector('#mw-stop-btn');
    const downloadBtn = this.querySelector('#mw-download-btn');

    downloadBtn.addEventListener('click', () => {
      const lines = Array.from(this.querySelectorAll('#mw-log div')).map(d => d.textContent);
      if (!lines.length) return;
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const ts   = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href     = url;
      a.download = `sac_migration_${ts}.log`;
      a.click();
      URL.revokeObjectURL(url);
    });

    runBtn.addEventListener('click', async () => {
      const settings = this._loadSettings();
      // Basic validation
      if (!settings.sourceBaseUrl || !settings.destBaseUrl) {
        this._log('❌ Please configure Source and Destination settings first.');
        return;
      }

      const odataFilter  = this.querySelector('#mw-filter').value.trim();
      const dimExpr      = this.querySelector('#mw-dim').value.trim();
      const batchSize    = parseInt(this.querySelector('#mw-batch').value, 10) || 100000;
      const parallelJobs = parseInt(this.querySelector('#mw-parallel').value, 10) || 20;

      // Clear log and set running state
      this.querySelector('#mw-log').innerHTML = '';
      downloadBtn.disabled = true;
      this._setStatus('running');
      runBtn.disabled = true;
      stopBtn.disabled = false;

      this._abortController = new AbortController();
      const signal = this._abortController.signal;

      try {
        const result = await runMigration({
          settings,
          odataFilter,
          dimExpr,
          batchSize,
          parallelJobs,
          logFn: (msg) => this._log(msg),
          signal,
        });
        if (!signal.aborted) {
          this._setStatus('done');
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          this._log('⛔ Migration stopped by user');
          this._setStatus('idle');
        } else {
          this._log(`❌ ${err.message}`);
          this._setStatus('error');
        }
      } finally {
        runBtn.disabled = false;
        stopBtn.disabled = true;
        downloadBtn.disabled = false;
        this._abortController = null;
      }
    });

    stopBtn.addEventListener('click', () => {
      if (this._abortController) {
        this._abortController.abort();
      }
    });

    // Stop button disabled until a run is in progress
    stopBtn.disabled = true;
  }

  // SAC calls this for each Widget Property
  set(name, value) {
    this._props[name] = value;
  }
}

customElements.define(WIDGET_TAG, SacMigrationWidget);
