(function(){

var PAGE_SIZE=100;
var ROWS_PER_PAGE=50;

function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}

function escapeCSV(val){
  var str=String(val||"");
  if(str.indexOf(",")>=0||str.indexOf('"')>=0||str.indexOf("\n")>=0){return '"'+str.replace(/"/g,'""')+'"';}
  return str;
}

function downloadCSV(rows,headers,filename){
  var lines=[];
  lines.push(headers.map(escapeCSV).join(","));
  for(var i=0;i<rows.length;i++){
    var cells=[];
    for(var j=0;j<headers.length;j++){cells.push(escapeCSV(rows[i][headers[j]]));}
    lines.push(cells.join(","));
  }
  var blob=new Blob(["\uFEFF"+lines.join("\r\n")],{type:"text/csv;charset=utf-8;"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function downloadExcel(rows,headers,filename){
  var html='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html+='<head><meta charset="UTF-8"></head><body><table border="1">';
  html+='<tr>';
  for(var h=0;h<headers.length;h++){html+='<th style="background:#0A6ED1;color:#fff;font-weight:bold;padding:6px 10px">'+esc(headers[h])+'</th>';}
  html+='</tr>';
  for(var i=0;i<rows.length;i++){
    html+='<tr>';
    for(var j=0;j<headers.length;j++){html+='<td style="padding:4px 10px">'+esc(rows[i][headers[j]]||"")+'</td>';}
    html+='</tr>';
  }
  html+='</table></body></html>';
  var blob=new Blob(["\uFEFF"+html],{type:"application/vnd.ms-excel;charset=utf-8"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function copyToClipboard(rows,headers){
  var lines=[];
  lines.push(headers.join("\t"));
  for(var i=0;i<rows.length;i++){
    var cells=[];
    for(var j=0;j<headers.length;j++){cells.push(String(rows[i][headers[j]]||""));}
    lines.push(cells.join("\t"));
  }
  if(navigator.clipboard){navigator.clipboard.writeText(lines.join("\n"));return true;}
  return false;
}

function sortData(data,col,asc){
  return data.slice().sort(function(a,b){
    var va=String(a[col]||"").toLowerCase();
    var vb=String(b[col]||"").toLowerCase();
    if(va<vb)return asc?-1:1;
    if(va>vb)return asc?1:-1;
    return 0;
  });
}

function filterData(data,headers,query){
  if(!query)return data;
  var q=query.toLowerCase();
  return data.filter(function(row){
    for(var i=0;i<headers.length;i++){
      if(String(row[headers[i]]||"").toLowerCase().indexOf(q)>=0)return true;
    }
    return false;
  });
}

function buildTable(rows,headers,page,sortCol,sortAsc){
  if(!rows||rows.length===0)return '<div class="empty">No data found.</div>';
  var start=(page-1)*ROWS_PER_PAGE;
  var pageRows=rows.slice(start,start+ROWS_PER_PAGE);
  var html='<table><thead><tr>';
  for(var h=0;h<headers.length;h++){
    var arrow="";
    if(headers[h]===sortCol){arrow=sortAsc?" &#9650;":" &#9660;";}
    html+='<th data-col="'+esc(headers[h])+'">'+esc(headers[h])+arrow+'</th>';
  }
  html+='</tr></thead><tbody>';
  for(var i=0;i<pageRows.length;i++){
    html+='<tr>';
    for(var j=0;j<headers.length;j++){html+='<td title="'+esc(pageRows[i][headers[j]])+'">'+esc(pageRows[i][headers[j]])+'</td>';}
    html+='</tr>';
  }
  html+='</tbody></table>';
  return html;
}

function buildPagination(total,page){
  var pages=Math.ceil(total/ROWS_PER_PAGE);
  if(pages<=1)return '';
  var html='<div class="pagi">';
  html+='<button class="pg-btn" data-pg="1" '+(page===1?'disabled':'')+'>&#171;</button>';
  html+='<button class="pg-btn" data-pg="'+(page-1)+'" '+(page===1?'disabled':'')+'>&#8249;</button>';
  html+='<span class="pg-info">Page '+page+' of '+pages+' ('+total+' rows)</span>';
  html+='<button class="pg-btn" data-pg="'+(page+1)+'" '+(page===pages?'disabled':'')+'>&#8250;</button>';
  html+='<button class="pg-btn" data-pg="'+pages+'" '+(page===pages?'disabled':'')+'>&#187;</button>';
  html+='</div>';
  return html;
}

function buildSummary(usersData){
  if(!usersData||usersData.length===0)return '';
  var active=0;var inactive=0;var roles={};
  for(var i=0;i<usersData.length;i++){
    if(usersData[i].Active==="true")active++;else inactive++;
    var r=(usersData[i].Roles||"").split("; ");
    for(var j=0;j<r.length;j++){if(r[j]){roles[r[j]]=(roles[r[j]]||0)+1;}}
  }
  var topRoles=Object.keys(roles).sort(function(a,b){return roles[b]-roles[a];}).slice(0,5);
  var html='<div class="summary">';
  html+='<span class="chip chip-b">Total: '+usersData.length+'</span>';
  html+='<span class="chip chip-g">Active: '+active+'</span>';
  html+='<span class="chip chip-r">Inactive: '+inactive+'</span>';
  if(topRoles.length>0){
    html+='<span class="chip-label">Top roles:</span>';
    for(var k=0;k<topRoles.length;k++){html+='<span class="chip chip-o">'+esc(topRoles[k])+' ('+roles[topRoles[k]]+')</span>';}
  }
  html+='</div>';
  return html;
}

function tmpl(){
  return '<style>'+
  ':host{display:block;width:100%;height:100%;font-family:"72","Segoe UI",sans-serif}'+
  '.shell{box-sizing:border-box;width:100%;height:100%;padding:16px;background:#fff;display:flex;flex-direction:column;gap:10px;overflow-y:auto}'+
  '.title{font-size:16px;font-weight:700;color:#0a6ed1;display:flex;align-items:center;gap:8px}'+
  '.badge{display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600}'+
  '.badge-on{background:#e6f4ea;color:#107e3e}.badge-off{background:#fce4e4;color:#bb0000}'+
  '.btns{display:flex;gap:6px;flex-wrap:wrap;align-items:center}'+
  '.btn-sep{width:1px;height:24px;background:#d0d0d0;margin:0 4px}'+
  '.btn{padding:8px 16px;border:none;border-radius:4px;font-size:13px;font-family:inherit;font-weight:600;cursor:pointer}'+
  '.btn:disabled{opacity:0.5;cursor:not-allowed}'+
  '.btn-b{background:#0a6ed1;color:#fff}.btn-g{background:#107e3e;color:#fff}.btn-o{background:#e9730c;color:#fff}.btn-d{background:#6a6d70;color:#fff}.btn-p{background:#8e44ad;color:#fff}'+
  '.st{padding:8px 12px;border-radius:4px;font-size:12px;display:none}'+
  '.st.vis{display:block}'+
  '.st-i{background:#e8f0fe;color:#0a6ed1;border:1px solid #b3d4fc}'+
  '.st-s{background:#e6f4ea;color:#107e3e;border:1px solid #a8dab5}'+
  '.st-e{background:#fce4e4;color:#bb0000;border:1px solid #f5b5b5}'+
  '.tabs{display:flex;gap:0;border-bottom:2px solid #e5e5e5}'+
  '.tab{padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:none;color:#6a6d70;border-bottom:2px solid transparent;margin-bottom:-2px}'+
  '.tab.active{color:#0a6ed1;border-bottom-color:#0a6ed1}'+
  '.toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px}'+
  '.search{padding:6px 10px;border:1px solid #bfbfbf;border-radius:4px;font-size:12px;font-family:inherit;flex:1;min-width:150px;max-width:300px}'+
  '.summary{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px}'+
  '.chip{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600}'+
  '.chip-b{background:#e8f0fe;color:#0a6ed1}.chip-g{background:#e6f4ea;color:#107e3e}.chip-r{background:#fce4e4;color:#bb0000}.chip-o{background:#fef3e0;color:#e9730c}'+
  '.chip-label{font-size:11px;color:#6a6d70;font-weight:600}'+
  '.tbl-wrap{flex:1;overflow:auto;border:1px solid #e5e5e5;border-radius:8px;margin-top:4px}'+
  'table{width:100%;border-collapse:collapse;font-size:12px}'+
  'th{position:sticky;top:0;background:#0b3d69;color:#fff;padding:8px 10px;text-align:left;white-space:nowrap;cursor:pointer;user-select:none}'+
  'th:hover{background:#0b63b6}'+
  'td{padding:6px 10px;border-bottom:1px solid #e5e5e5;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  'tbody tr:nth-child(even){background:#f8fafc}'+
  'tbody tr:hover{background:#eef6ff}'+
  '.empty{padding:30px;text-align:center;color:#6a6d70}'+
  '.pagi{display:flex;align-items:center;justify-content:center;gap:8px;padding:8px;font-size:12px}'+
  '.pg-btn{padding:4px 10px;border:1px solid #bfbfbf;border-radius:4px;background:#fff;cursor:pointer;font-size:13px}'+
  '.pg-btn:disabled{opacity:0.4;cursor:not-allowed}'+
  '.pg-info{color:#6a6d70;font-weight:600}'+
  '.spinner{display:inline-block;width:14px;height:14px;border:2px solid #b3d4fc;border-top:2px solid #0a6ed1;border-radius:50%;animation:spin 0.8s linear infinite;margin-right:6px;vertical-align:middle}'+
  '@keyframes spin{to{transform:rotate(360deg)}}'+
  'tbody tr.clickable{cursor:pointer}'+
  '.tab.hidden{display:none}'+
  '.detail-card{padding:4px 0;display:flex;flex-direction:column;gap:16px}'+
  '.detail-back{background:none;border:none;color:#0a6ed1;font-size:13px;font-weight:600;cursor:pointer;padding:0;font-family:inherit;display:flex;align-items:center;gap:4px}'+
  '.detail-back:hover{text-decoration:underline}'+
  '.detail-header{display:flex;align-items:center;gap:12px}'+
  '.detail-avatar{width:48px;height:48px;border-radius:50%;background:#0a6ed1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;flex-shrink:0}'+
  '.detail-name{font-size:18px;font-weight:700;color:#32363a}'+
  '.detail-email{font-size:13px;color:#6a6d70;margin-top:2px}'+
  '.detail-status{display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600;margin-left:4px}'+
  '.detail-status.on{background:#e6f4ea;color:#107e3e}.detail-status.off{background:#fce4e4;color:#bb0000}'+
  '.detail-grid{display:grid;grid-template-columns:140px 1fr;gap:0;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden}'+
  '.detail-grid .dg-label{padding:10px 14px;font-size:12px;font-weight:600;color:#6a6d70;background:#f8fafc;border-bottom:1px solid #e5e5e5}'+
  '.detail-grid .dg-value{padding:10px 14px;font-size:13px;color:#32363a;border-bottom:1px solid #e5e5e5;word-break:break-word}'+
  '.detail-grid .dg-label:last-of-type,.detail-grid .dg-value:last-of-type{border-bottom:none}'+
  '.detail-section{font-size:14px;font-weight:700;color:#32363a;margin-top:4px}'+
  '.detail-chips{display:flex;gap:6px;flex-wrap:wrap}'+
  '.detail-chip{display:inline-block;padding:5px 12px;border-radius:14px;font-size:12px;font-weight:600}'+
  '.dc-role{background:#e8f0fe;color:#0a6ed1}.dc-group{background:#fef3e0;color:#e9730c}.dc-team{background:#f3e8fd;color:#8e44ad}'+
  '.detail-hint{font-size:12px;color:#6a6d70;font-style:italic}'+
  '.add-member-row{display:flex;gap:8px;align-items:center;padding:8px 0;flex-wrap:wrap}'+
  '.split-view{display:flex;gap:12px;flex:1;overflow:hidden}'+
  '.split-view .tbl-wrap{flex:1;overflow:auto;margin-top:0}'+
  '.split-panel{flex:1;display:flex;flex-direction:column;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden}'+
  '.split-panel-title{padding:8px 12px;font-size:13px;font-weight:700;color:#32363a;background:#f8fafc;border-bottom:1px solid #e5e5e5}'+
  '.member-checklist{flex:1;overflow-y:auto;padding:4px 0}'+
  '.member-check{display:flex;align-items:center;gap:8px;padding:5px 12px;font-size:12px;cursor:pointer}'+
  '.member-check:hover{background:#eef6ff}'+
  '.member-check input{width:15px;height:15px;cursor:pointer}'+
  '.member-check .mc-name{font-weight:600;color:#32363a}.member-check .mc-display{color:#6a6d70}'+
  '.checklist-search{padding:6px 10px;border:none;border-bottom:1px solid #e5e5e5;font-size:12px;font-family:inherit;width:100%;box-sizing:border-box;outline:none}'+
  '.bulk-cards{display:flex;gap:16px;flex-wrap:wrap;padding:8px 0}'+
  '.bulk-card{flex:1;min-width:280px;border:1px solid #e5e5e5;border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:10px}'+
  '.bulk-card-title{font-size:14px;font-weight:700;color:#32363a}'+
  '.bulk-card-desc{font-size:12px;color:#6a6d70}'+
  '.bulk-preview{overflow:auto;border:1px solid #e5e5e5;border-radius:8px;margin-top:4px;max-height:200px}'+
  '.analytics-grid{display:flex;gap:16px;flex-wrap:wrap;padding:8px 0}'+
  '.analytics-card{flex:1;min-width:300px;border:1px solid #e5e5e5;border-radius:8px;display:flex;flex-direction:column;overflow:hidden}'+
  '.analytics-card-header{padding:10px 14px;font-size:13px;font-weight:700;color:#fff;display:flex;justify-content:space-between;align-items:center}'+
  '.ac-blue{background:#0a6ed1}.ac-orange{background:#e9730c}.ac-purple{background:#8e44ad}'+
  '.analytics-card-body{padding:0;flex:1;overflow-y:auto;max-height:250px}'+
  '.analytics-card-body table{width:100%;border-collapse:collapse;font-size:12px}'+
  '.analytics-card-body th{position:sticky;top:0;background:#f8fafc;padding:6px 10px;text-align:left;font-weight:600;color:#6a6d70;border-bottom:1px solid #e5e5e5}'+
  '.analytics-card-body td{padding:5px 10px;border-bottom:1px solid #f0f0f0}'+
  '.analytics-stat{font-size:22px;font-weight:700;padding:16px;text-align:center;color:#32363a}'+
  '.analytics-row{display:flex;gap:16px;flex-wrap:wrap;padding:4px 0}'+
  '.stat-box{flex:1;min-width:120px;border:1px solid #e5e5e5;border-radius:8px;padding:12px;text-align:center}'+
  '.stat-box .stat-num{font-size:24px;font-weight:700}.stat-box .stat-label{font-size:11px;color:#6a6d70;margin-top:4px}'+
  '</style>'+
  '<div class="shell">'+
  '<div class="title">SAC Security Export <span class="badge badge-off" id="badge">Not Connected</span></div>'+
  '<div class="btns">'+
  '<button class="btn btn-g" id="btnUsers" disabled>Load Users</button>'+
  '<button class="btn btn-g" id="btnTeams" disabled>Load Teams</button>'+
  '<button class="btn btn-p" id="btnGroups" disabled>Load Roles</button>'+
  '<div class="btn-sep"></div>'+
  '<button class="btn btn-d" id="btnDownload" disabled>Download CSV</button>'+
  '<button class="btn btn-d" id="btnDownloadExcel" disabled>Download Excel</button>'+
  '<button class="btn btn-d" id="btnCopy" disabled>Copy</button>'+
  '<button class="btn btn-o" id="btnExportAll" disabled>Export All</button>'+
  '<button class="btn btn-p" id="btnTeamMatrix" disabled>Team Matrix</button>'+
  '<div class="btn-sep"></div>'+
  '<button class="btn btn-o" id="btnCreateTeam" disabled>Create Team</button>'+
  '</div>'+
  '<div class="st" id="status"></div>'+
  '<div id="summaryWrap"></div>'+
  '<div class="tabs">'+
  '<button class="tab active" id="tabUsers">Users (0)</button>'+
  '<button class="tab" id="tabTeams">Teams (0)</button>'+
  '<button class="tab" id="tabGroups">Roles (0)</button>'+
  '<button class="tab hidden" id="tabDetail">User Detail</button>'+
  '<button class="tab" id="tabBulk">Bulk</button>'+
  '<button class="tab" id="tabAnalytics">Analytics</button>'+
  '</div>'+
  '<div class="toolbar">'+
  '<input type="text" class="search" id="search" placeholder="Search..." />'+
  '</div>'+
  '<div class="tbl-wrap" id="tableWrap">'+
  '<div class="empty">No data loaded. Set credentials in Builder panel, then click Load.</div>'+
  '</div>'+
  '<div class="tbl-wrap" id="detailWrap" style="display:none"></div>'+
  '<div id="pagiWrap"></div>'+
  '</div>';
}

class SecExport extends HTMLElement{

constructor(){
  super();
  this._token=null;
  this._props={tenantUrl:"",tokenUrl:"",clientId:"",clientSecret:""};
  this._usersData=[];this._teamsData=[];this._groupsData=[];
  this._usersRaw=[];this._teamsRaw=[];this._groupsRaw=[];
  this._selectedUser=null;
  this._teamView="list";this._roleView="list";
  this._selectedTeamName=null;this._selectedRoleName=null;
  this._csrfToken=null;
  this._pendingNewMembers=null;
  this._userHeaders=["UserName","DisplayName","Email","Active","Roles","Groups"];
  this._teamHeaders=["ID","DisplayName","UserID","UserName"];
  this._groupHeaders=["RoleName","Description","UserID","UserName"];
  this._activeTab="users";
  this._page=1;
  this._sortCol=null;this._sortAsc=true;
  this._searchQuery="";
  this._autoConnected=false;
  this.attachShadow({mode:"open"});
  this.shadowRoot.innerHTML=tmpl();
}

connectedCallback(){
  var self=this;
  this.shadowRoot.getElementById("btnUsers").addEventListener("click",function(){self._loadUsers();});
  this.shadowRoot.getElementById("btnTeams").addEventListener("click",function(){self._loadTeams();});
  this.shadowRoot.getElementById("btnGroups").addEventListener("click",function(){self._loadGroups();});
  this.shadowRoot.getElementById("btnDownload").addEventListener("click",function(){self._download();});
  this.shadowRoot.getElementById("btnDownloadExcel").addEventListener("click",function(){self._downloadExcel();});
  this.shadowRoot.getElementById("btnExportAll").addEventListener("click",function(){self._exportAll();});
  this.shadowRoot.getElementById("btnCopy").addEventListener("click",function(){self._copy();});
  this.shadowRoot.getElementById("btnCreateTeam").addEventListener("click",function(){self._showCreateTeamForm();});
  this.shadowRoot.getElementById("btnTeamMatrix").addEventListener("click",function(){self._downloadTeamMatrix();});
  this.shadowRoot.getElementById("tabUsers").addEventListener("click",function(){self._switchTab("users");});
  this.shadowRoot.getElementById("tabTeams").addEventListener("click",function(){self._switchTab("teams");});
  this.shadowRoot.getElementById("tabGroups").addEventListener("click",function(){self._switchTab("groups");});
  this.shadowRoot.getElementById("tabDetail").addEventListener("click",function(){if(self._selectedUser!==null)self._switchTab("detail");});
  this.shadowRoot.getElementById("tabBulk").addEventListener("click",function(){self._switchTab("bulk");});
  this.shadowRoot.getElementById("tabAnalytics").addEventListener("click",function(){self._switchTab("analytics");});
  this.shadowRoot.getElementById("search").addEventListener("input",function(){
    self._searchQuery=this.value;
    self._page=1;
    self._showTable();
  });
  this.shadowRoot.getElementById("tableWrap").addEventListener("click",function(e){
    var th=e.target.closest("th");
    if(th&&th.dataset.col){
      if(self._sortCol===th.dataset.col){self._sortAsc=!self._sortAsc;}
      else{self._sortCol=th.dataset.col;self._sortAsc=true;}
      self._page=1;
      self._showTable();
      return;
    }
    var tr=e.target.closest("tbody tr");
    if(tr){
      var idx=Array.prototype.indexOf.call(tr.parentNode.children,tr);
      var filtered=self._getFilteredSorted();
      var actualIdx=(self._page-1)*ROWS_PER_PAGE+idx;
      if(actualIdx<0||actualIdx>=filtered.length)return;
      var row=filtered[actualIdx];

      if(self._activeTab==="users"){
        var userName=row.UserName;
        for(var i=0;i<self._usersRaw.length;i++){
          if(self._usersRaw[i].userName===userName){self._selectedUser=self._usersRaw[i];break;}
        }
        if(self._selectedUser)self._switchTab("detail");
      }else if(self._activeTab==="teams"&&self._teamView==="list"){
        self._selectedTeamName=row.ID;
        self._teamView="members";
        self._page=1;self._sortCol=null;self._searchQuery="";self._el("search").value="";
        self._showTable();
      }else if(self._activeTab==="groups"&&self._roleView==="list"){
        self._selectedRoleName=row.RoleName;
        self._roleView="members";
        self._page=1;self._sortCol=null;self._searchQuery="";self._el("search").value="";
        self._showTable();
      }
    }
  });
  this.shadowRoot.getElementById("pagiWrap").addEventListener("click",function(e){
    var btn=e.target.closest(".pg-btn");
    if(btn&&btn.dataset.pg){
      self._page=parseInt(btn.dataset.pg);
      self._showTable();
    }
  });
  this._render();
}

onCustomWidgetBeforeUpdate(changed){
  if(changed){
    if(changed.tenantUrl!==undefined)this._props.tenantUrl=changed.tenantUrl;
    if(changed.tokenUrl!==undefined)this._props.tokenUrl=changed.tokenUrl;
    if(changed.clientId!==undefined)this._props.clientId=changed.clientId;
    if(changed.clientSecret!==undefined)this._props.clientSecret=changed.clientSecret;
  }
}

onCustomWidgetAfterUpdate(changed){
  this.onCustomWidgetBeforeUpdate(changed);
  this._render();
  if(!this._autoConnected&&this._props.tokenUrl&&this._props.clientId&&this._props.clientSecret){
    this._autoConnected=true;
    this._autoConnect();
  }
}

_render(){this._showTable();}

_el(id){return this.shadowRoot.getElementById(id);}

_setStatus(msg,type,loading){
  var el=this._el("status");
  el.innerHTML=(loading?'<span class="spinner"></span>':'')+esc(msg);
  el.className="st vis st-"+type;
}

_setConnected(on){
  var b=this._el("badge");
  b.textContent=on?"Connected":"Not Connected";
  b.className="badge "+(on?"badge-on":"badge-off");
  this._el("btnUsers").disabled=!on;
  this._el("btnTeams").disabled=!on;
  this._el("btnGroups").disabled=!on;
  var hasData=this._usersData.length>0||this._teamsData.length>0||this._groupsData.length>0;
  this._el("btnDownload").disabled=!hasData;
  this._el("btnDownloadExcel").disabled=!hasData;
  this._el("btnExportAll").disabled=!hasData;
  this._el("btnCopy").disabled=!hasData;
  this._el("btnCreateTeam").disabled=!on;
  this._el("btnTeamMatrix").disabled=!(this._usersData.length>0&&this._teamsData.length>0);
}

_disableAll(off){
  this._el("btnUsers").disabled=off;
  this._el("btnTeams").disabled=off;
  this._el("btnGroups").disabled=off;
  this._el("btnDownload").disabled=off;
  this._el("btnDownloadExcel").disabled=off;
  this._el("btnExportAll").disabled=off;
  this._el("btnCopy").disabled=off;
  this._el("btnCreateTeam").disabled=off;
  this._el("btnTeamMatrix").disabled=off;
}

_autoConnect(){
  var self=this;
  var tokenUrl=this._props.tokenUrl;
  var clientId=this._props.clientId;
  var clientSecret=this._props.clientSecret;
  if(!tokenUrl||!clientId||!clientSecret){
    this._setStatus("Set credentials in the Builder panel.","e");
    return;
  }
  this._setStatus("Connecting...","i",true);
  var body="grant_type=client_credentials&client_id="+encodeURIComponent(clientId)+"&client_secret="+encodeURIComponent(clientSecret);
  fetch(tokenUrl,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:body}).then(function(resp){
    if(!resp.ok)return resp.text().then(function(t){throw new Error(resp.status+": "+t);});
    return resp.json();
  }).then(function(data){
    self._token=data.access_token;
    self._setStatus("Fetching CSRF token...","i",true);
    return self._fetchCsrfToken();
  }).then(function(){
    self._setStatus("Connected!","s");
    self._setConnected(true);
  }).catch(function(err){
    self._token=null;
    self._setConnected(false);
    self._setStatus("Connection failed: "+err.message,"e");
  });
}

_fetchCsrfToken(){
  var self=this;
  var baseUrl=(this._props.tenantUrl||"").replace(/\/+$/,"");
  return fetch(baseUrl+"/api/v1/scim2/Users?count=1",{
    headers:{"Authorization":"Bearer "+self._token,"x-sap-sac-custom-auth":"true","x-csrf-token":"fetch"}
  }).then(function(resp){
    self._csrfToken=resp.headers.get("x-csrf-token")||null;
  });
}

_writeHeaders(){
  return{"Authorization":"Bearer "+this._token,"x-sap-sac-custom-auth":"true","x-csrf-token":this._csrfToken||"","Content-Type":"application/json"};
}

_postTeam(body){
  var baseUrl=(this._props.tenantUrl||"").replace(/\/+$/,"");
  return fetch(baseUrl+"/api/v1/scim/Groups",{method:"POST",headers:this._writeHeaders(),body:JSON.stringify(body)}).then(function(resp){
    if(!resp.ok)return resp.text().then(function(t){throw new Error(resp.status+": "+t);});
    return resp.json();
  });
}

_getTeam(teamId){
  var self=this;
  var baseUrl=(this._props.tenantUrl||"").replace(/\/+$/,"");
  return fetch(baseUrl+"/api/v1/scim/Groups/"+encodeURIComponent(teamId),{
    headers:{"Authorization":"Bearer "+self._token,"x-sap-sac-custom-auth":"true"}
  }).then(function(resp){
    if(!resp.ok)return resp.text().then(function(t){throw new Error(resp.status+": "+t);});
    return resp.json();
  });
}

_putTeam(teamId,body){
  var baseUrl=(this._props.tenantUrl||"").replace(/\/+$/,"");
  return fetch(baseUrl+"/api/v1/scim/Groups/"+encodeURIComponent(teamId),{method:"PUT",headers:this._writeHeaders(),body:JSON.stringify(body)}).then(function(resp){
    if(!resp.ok)return resp.text().then(function(t){throw new Error(resp.status+": "+t);});
    return resp.json();
  });
}

_getActiveData(){
  if(this._activeTab==="users")return{data:this._usersData,headers:this._userHeaders,name:"users"};
  if(this._activeTab==="teams"){
    if(this._teamView==="members")return{data:this._getTeamMembers(this._selectedTeamName),headers:["UserName","DisplayName"],name:"team_members"};
    return{data:this._getDistinctTeams(),headers:["ID","DisplayName","Members"],name:"teams"};
  }
  if(this._roleView==="members")return{data:this._getRoleMembers(this._selectedRoleName),headers:["UserID","UserName"],name:"role_members"};
  return{data:this._getDistinctRoles(),headers:["RoleName","Description","Members"],name:"roles"};
}

_getFilteredSorted(){
  var info=this._getActiveData();
  var d=filterData(info.data,info.headers,this._searchQuery);
  if(this._sortCol&&info.headers.indexOf(this._sortCol)>=0){d=sortData(d,this._sortCol,this._sortAsc);}
  return d;
}

_switchTab(tab){
  this._activeTab=tab;
  this._page=1;this._sortCol=null;this._sortAsc=true;this._searchQuery="";
  this._el("search").value="";
  if(tab==="teams"){this._teamView="list";this._selectedTeamName=null;}
  if(tab==="groups"){this._roleView="list";this._selectedRoleName=null;}
  this._el("tabUsers").className="tab"+(tab==="users"?" active":"");
  this._el("tabTeams").className="tab"+(tab==="teams"?" active":"");
  this._el("tabGroups").className="tab"+(tab==="groups"?" active":"");
  this._el("tabDetail").className="tab"+(this._selectedUser!==null?"":" hidden")+(tab==="detail"?" active":"");
  this._el("tabBulk").className="tab"+(tab==="bulk"?" active":"");
  this._el("tabAnalytics").className="tab"+(tab==="analytics"?" active":"");
  var isDetail=tab==="detail";
  var isBulk=tab==="bulk";
  var isAnalytics=tab==="analytics";
  var isSpecial=isDetail||isBulk||isAnalytics;
  this._el("tableWrap").style.display=isSpecial?"none":"";
  this._el("detailWrap").style.display=isSpecial?"":"none";
  this._el("pagiWrap").style.display=isSpecial?"none":"";
  this._el("search").parentNode.style.display=isSpecial?"none":"";
  if(isDetail){this._showUserDetail();}
  else if(isBulk){this._showBulkTab();}
  else if(isAnalytics){this._showAnalyticsTab();}
  else{this._showTable();}
}

_showTable(){
  var self=this;
  var wrap=this._el("tableWrap");
  var pagiWrap=this._el("pagiWrap");
  var summaryWrap=this._el("summaryWrap");
  if(!wrap)return;
  var distinctTeams=this._getDistinctTeams();
  var distinctRoles=this._getDistinctRoles();
  this._el("tabUsers").textContent="Users ("+this._usersData.length+")";
  this._el("tabTeams").textContent="Teams ("+distinctTeams.length+")";
  this._el("tabGroups").textContent="Roles ("+distinctRoles.length+")";
  var filtered=this._getFilteredSorted();
  var info=this._getActiveData();
  wrap.innerHTML=buildTable(filtered,info.headers,this._page,this._sortCol,this._sortAsc);
  pagiWrap.innerHTML=buildPagination(filtered.length,this._page);

  var isTeamMembers=this._activeTab==="teams"&&this._teamView==="members";
  var isRoleMembers=this._activeTab==="groups"&&this._roleView==="members";
  var isListView=(this._activeTab==="teams"&&this._teamView==="list")||(this._activeTab==="groups"&&this._roleView==="list");

  if(this._activeTab==="users"){
    summaryWrap.innerHTML=buildSummary(this._usersData);
    var rows=wrap.querySelectorAll("tbody tr");
    for(var i=0;i<rows.length;i++){rows[i].classList.add("clickable");}
  }else if(isTeamMembers){
    var addBtn=this._csrfToken?'<button class="btn btn-g" id="btnAddMember" style="margin-left:auto">Add Member</button>':'';
    var html='<div class="summary"><button class="detail-back" id="backToList">&#8592; Back to Teams</button><span class="chip chip-b">'+esc(this._selectedTeamName)+'</span><span class="chip chip-g">'+filtered.length+' members</span>'+addBtn+'</div>';

    if(this._pendingNewMembers!==null){
      html+='<div class="add-member-row"><button class="btn btn-g" id="btnSaveMembers">Save</button><button class="btn btn-d" id="btnCancelAdd">Cancel</button><span style="font-size:12px;color:#6a6d70;margin-left:8px" id="checkCount">0 selected</span></div>';
    }

    summaryWrap.innerHTML=html;

    if(this._pendingNewMembers!==null){
      var existingMembers=filtered.map(function(m){return m.UserName;});
      var available=[];
      for(var i=0;i<self._usersRaw.length;i++){
        var u=self._usersRaw[i];
        if(existingMembers.indexOf(u.userName)<0){available.push({userName:u.userName||"",displayName:u.displayName||""});}
      }
      var checkHtml='<div class="split-panel"><div class="split-panel-title">Available Users ('+available.length+')</div>';
      checkHtml+='<input class="checklist-search" id="checklistFilter" placeholder="Filter users..." />';
      checkHtml+='<div class="member-checklist" id="memberChecklist">';
      for(var a=0;a<available.length;a++){
        var checked=this._pendingNewMembers.indexOf(available[a].userName)>=0?'checked':'';
        checkHtml+='<label class="member-check" data-uname="'+esc(available[a].userName)+'" data-dname="'+esc(available[a].displayName)+'"><input type="checkbox" value="'+esc(available[a].userName)+'" '+checked+' /><span class="mc-name">'+esc(available[a].userName)+'</span><span class="mc-display">'+esc(available[a].displayName)+'</span></label>';
      }
      if(available.length===0){checkHtml+='<div style="padding:10px;font-size:12px;color:#6a6d70;text-align:center">No available users. Load Users first.</div>';}
      checkHtml+='</div></div>';

      var tableHtml=buildTable(filtered,info.headers,this._page,this._sortCol,this._sortAsc);
      wrap.innerHTML='<div class="split-view"><div class="tbl-wrap" style="border:none">'+tableHtml+'</div>'+checkHtml+'</div>';

      var checklist=wrap.querySelector("#memberChecklist");
      var countEl=summaryWrap.querySelector("#checkCount");
      var filterInput=wrap.querySelector("#checklistFilter");

      function updateCount(){countEl.textContent=self._pendingNewMembers.length+" selected";}
      updateCount();

      checklist.addEventListener("change",function(e){
        if(e.target.type==="checkbox"){
          var val=e.target.value;
          var idx=self._pendingNewMembers.indexOf(val);
          if(e.target.checked&&idx<0){self._pendingNewMembers.push(val);}
          else if(!e.target.checked&&idx>=0){self._pendingNewMembers.splice(idx,1);}
          updateCount();
        }
      });

      filterInput.addEventListener("input",function(){
        var q=this.value.toLowerCase().trim();
        var labels=checklist.querySelectorAll(".member-check");
        for(var i=0;i<labels.length;i++){
          var uname=(labels[i].dataset.uname||"").toLowerCase();
          var dname=(labels[i].dataset.dname||"").toLowerCase();
          labels[i].style.display=(!q||uname.indexOf(q)>=0||dname.indexOf(q)>=0)?"":"none";
        }
      });

      summaryWrap.querySelector("#btnSaveMembers").addEventListener("click",function(){self._saveNewMembers();});
      summaryWrap.querySelector("#btnCancelAdd").addEventListener("click",function(){self._pendingNewMembers=null;self._showTable();});
    }

    summaryWrap.querySelector("#backToList").addEventListener("click",function(){self._teamView="list";self._selectedTeamName=null;self._pendingNewMembers=null;self._page=1;self._sortCol=null;self._searchQuery="";self._el("search").value="";self._showTable();});
    var addMemberBtn=summaryWrap.querySelector("#btnAddMember");
    if(addMemberBtn)addMemberBtn.addEventListener("click",function(){
      if(self._usersRaw.length===0){self._setStatus("Load Users first to add members.","e");return;}
      self._pendingNewMembers=[];self._showTable();
    });
  }else if(isRoleMembers){
    summaryWrap.innerHTML='<div class="summary"><button class="detail-back" id="backToList">&#8592; Back to Roles</button><span class="chip chip-b">'+esc(this._selectedRoleName)+'</span><span class="chip chip-g">'+filtered.length+' members</span></div>';
    summaryWrap.querySelector("#backToList").addEventListener("click",function(){self._roleView="list";self._selectedRoleName=null;self._page=1;self._sortCol=null;self._searchQuery="";self._el("search").value="";self._showTable();});
  }else{summaryWrap.innerHTML="";}

  if(isListView){
    var rows=wrap.querySelectorAll("tbody tr");
    for(var i=0;i<rows.length;i++){rows[i].classList.add("clickable");}
  }

  var hasData=this._usersData.length>0||this._teamsData.length>0||this._groupsData.length>0;
  this._el("btnDownload").disabled=!hasData;
  this._el("btnDownloadExcel").disabled=!hasData;
  this._el("btnExportAll").disabled=!hasData;
  this._el("btnCopy").disabled=!hasData;
}

_getDistinctTeams(){
  var map={};
  for(var i=0;i<this._teamsData.length;i++){
    var t=this._teamsData[i];
    if(!map[t.ID]){map[t.ID]={ID:t.ID,DisplayName:t.DisplayName,Members:0};}
    if(t.UserID)map[t.ID].Members++;
  }
  return Object.keys(map).map(function(k){return map[k];});
}

_getDistinctRoles(){
  var map={};
  for(var i=0;i<this._groupsData.length;i++){
    var r=this._groupsData[i];
    if(!map[r.RoleName]){map[r.RoleName]={RoleName:r.RoleName,Description:r.Description,Members:0};}
    if(r.UserID)map[r.RoleName].Members++;
  }
  return Object.keys(map).map(function(k){return map[k];});
}

_getTeamMembers(teamName){
  return this._teamsData.filter(function(t){return t.ID===teamName&&t.UserID;}).map(function(t){return{UserName:t.UserID,DisplayName:t.UserName};});
}

_getRoleMembers(roleName){
  return this._groupsData.filter(function(r){return r.RoleName===roleName&&r.UserID;}).map(function(r){return{UserID:r.UserID,UserName:r.UserName};});
}

_getUserTeams(userName){
  var teams=[];var seen={};
  for(var i=0;i<this._teamsData.length;i++){
    var t=this._teamsData[i];
    if(t.UserName===userName&&!seen[t.ID]){teams.push(t.ID);seen[t.ID]=true;}
  }
  return teams;
}

_getUserRolesFromData(userName){
  var roles=[];var seen={};
  for(var i=0;i<this._groupsData.length;i++){
    var g=this._groupsData[i];
    if(g.UserName===userName&&!seen[g.RoleName]){roles.push(g.RoleName);seen[g.RoleName]=true;}
  }
  return roles;
}

_showUserDetail(){
  var wrap=this._el("detailWrap");
  var u=this._selectedUser;
  if(!u){wrap.innerHTML='<div class="empty">No user selected.</div>';return;}
  var self=this;

  var emails=u.emails||[];
  var email=emails.length>0?(emails[0].value||""):"";
  var isActive=u.active===true||u.active==="true";
  var displayName=u.displayName||u.userName||"";
  var initials=(displayName.charAt(0)||"?").toUpperCase();
  var givenName=(u.name||{}).givenName||"";
  var familyName=(u.name||{}).familyName||"";
  var sacExt=u["urn:sap:params:scim:schemas:extension:sac:2.0:user-custom-parameters"]||{};
  var entExt=u["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"]||{};
  var isConcurrent=sacExt.isConcurrent===true;
  var managerId=(entExt.manager||{}).managerId||"";

  var roles=(u.roles||[]).map(function(r){return r.display||r.value||"";}).filter(function(r){return r;});
  var teams=(u.groups||[]).map(function(g){return g.display||"";}).filter(function(g){return g;});

  var html='<div class="detail-card">';
  html+='<div style="display:flex;justify-content:space-between;align-items:center">';
  html+='<button class="detail-back" id="detailBack">&#8592; Back to Users</button>';
  html+='</div>';

  html+='<div class="detail-header">';
  html+='<div class="detail-avatar">'+esc(initials)+'</div>';
  html+='<div>';
  html+='<div class="detail-name">'+esc(displayName)+'<span class="detail-status '+(isActive?'on':'off')+'">'+(isActive?'Active':'Inactive')+'</span></div>';
  if(email){html+='<div class="detail-email">'+esc(email)+'</div>';}
  html+='</div>';
  html+='</div>';

  html+='<div class="detail-grid">';
  html+='<div class="dg-label">Username</div><div class="dg-value">'+esc(u.userName||"")+'</div>';
  html+='<div class="dg-label">Display Name</div><div class="dg-value">'+esc(displayName)+'</div>';
  html+='<div class="dg-label">Given Name</div><div class="dg-value">'+esc(givenName||"—")+'</div>';
  html+='<div class="dg-label">Family Name</div><div class="dg-value">'+esc(familyName||"—")+'</div>';
  html+='<div class="dg-label">Email</div><div class="dg-value">'+esc(email||"—")+'</div>';
  html+='<div class="dg-label">Manager ID</div><div class="dg-value">'+esc(managerId||"—")+'</div>';
  html+='<div class="dg-label">Concurrent</div><div class="dg-value">'+(isConcurrent?'Yes':'No')+'</div>';
  html+='<div class="dg-label">Status</div><div class="dg-value"><span class="detail-status '+(isActive?'on':'off')+'">'+(isActive?'Active':'Inactive')+'</span></div>';
  html+='<div class="dg-label">User ID</div><div class="dg-value">'+esc(u.id||"—")+'</div>';
  html+='</div>';

  html+='<div class="detail-section">SAC Roles ('+roles.length+')</div>';
  if(roles.length>0){
    html+='<div class="detail-chips">';
    for(var i=0;i<roles.length;i++){html+='<span class="detail-chip dc-role">'+esc(roles[i])+'</span>';}
    html+='</div>';
  }else{html+='<div class="detail-hint">No SAC roles assigned</div>';}

  html+='<div class="detail-section">Teams ('+teams.length+')</div>';
  if(teams.length>0){
    html+='<div class="detail-chips">';
    for(var i=0;i<teams.length;i++){html+='<span class="detail-chip dc-team">'+esc(teams[i])+'</span>';}
    html+='</div>';
  }else{html+='<div class="detail-hint">No teams assigned</div>';}

  html+='</div>';
  wrap.innerHTML=html;

  wrap.querySelector("#detailBack").addEventListener("click",function(){self._switchTab("users");});
}

_showCreateTeamForm(){
  var self=this;
  this._activeTab="detail";
  this._el("tabUsers").className="tab";
  this._el("tabTeams").className="tab";
  this._el("tabGroups").className="tab";
  this._el("tabDetail").className="tab hidden";
  this._el("tableWrap").style.display="none";
  this._el("detailWrap").style.display="";
  this._el("pagiWrap").style.display="none";
  this._el("search").parentNode.style.display="none";
  this._el("summaryWrap").innerHTML="";

  var wrap=this._el("detailWrap");
  var html='<div class="detail-card">';
  html+='<button class="detail-back" id="createTeamBack">&#8592; Back</button>';
  html+='<div class="detail-section">Create New Team</div>';
  html+='<div class="detail-grid">';
  html+='<div class="dg-label">Team ID</div><div class="dg-value"><input type="text" id="newTeamId" placeholder="Enter team ID..." style="padding:6px 10px;border:1px solid #0a6ed1;border-radius:4px;font-size:13px;font-family:inherit;width:100%;box-sizing:border-box" /></div>';
  html+='<div class="dg-label">Display Name</div><div class="dg-value"><input type="text" id="newTeamName" placeholder="Enter display name..." style="padding:6px 10px;border:1px solid #0a6ed1;border-radius:4px;font-size:13px;font-family:inherit;width:100%;box-sizing:border-box" /></div>';
  html+='</div>';
  html+='<div style="display:flex;gap:8px;margin-top:4px">';
  html+='<button class="btn btn-g" id="btnSubmitTeam">Create</button>';
  html+='<button class="btn btn-d" id="btnCancelCreateTeam">Cancel</button>';
  html+='</div>';
  html+='</div>';
  wrap.innerHTML=html;

  wrap.querySelector("#createTeamBack").addEventListener("click",function(){self._switchTab("teams");});
  wrap.querySelector("#btnCancelCreateTeam").addEventListener("click",function(){self._switchTab("teams");});
  wrap.querySelector("#btnSubmitTeam").addEventListener("click",function(){self._submitCreateTeam();});
}

_submitCreateTeam(){
  var self=this;
  var wrap=this._el("detailWrap");
  var teamId=wrap.querySelector("#newTeamId").value.trim();
  var teamName=wrap.querySelector("#newTeamName").value.trim();
  if(!teamId||!teamName){this._setStatus("Team ID and Display Name are required.","e");return;}

  var body={
    schemas:["urn:ietf:params:scim:schemas:core:2.0:Group"],
    id:teamId,
    displayName:teamName,
    members:[]
  };

  this._setStatus("Creating team...","i",true);
  this._disableAll(true);
  this._postTeam(body).then(function(){
    self._setStatus("Team '"+teamName+"' created!","s");
    self._switchTab("teams");
  }).catch(function(err){
    self._setStatus("Create failed: "+err.message,"e");
  }).finally(function(){self._setConnected(!!self._token);});
}

_saveNewMembers(){
  var self=this;
  var teamId=this._selectedTeamName;
  var newUsers=this._pendingNewMembers;
  if(!teamId||!newUsers||newUsers.length===0){this._setStatus("No members to add.","e");return;}

  this._setStatus("Updating team...","i",true);
  this._disableAll(true);

  this._getTeam(teamId).then(function(team){
    var members=team.members||[];
    for(var i=0;i<newUsers.length;i++){
      var exists=false;
      for(var j=0;j<members.length;j++){if(members[j].value===newUsers[i]){exists=true;break;}}
      if(!exists)members.push({value:newUsers[i]});
    }
    var body={
      schemas:team.schemas||["urn:ietf:params:scim:schemas:core:2.0:Group"],
      id:team.id,
      displayName:team.displayName,
      members:members
    };
    return self._putTeam(teamId,body);
  }).then(function(){
    self._pendingNewMembers=null;
    self._setStatus(newUsers.length+" member(s) added to "+teamId+"!","s");
    self._loadTeams();
  }).catch(function(err){
    self._setStatus("Update failed: "+err.message,"e");
  }).finally(function(){self._setConnected(!!self._token);});
}

_showBulkTab(){
  var self=this;
  var wrap=this._el("detailWrap");
  this._el("summaryWrap").innerHTML="";
  var html='<div class="detail-card">';
  html+='<div class="detail-section">Bulk Operations</div>';
  html+='<div class="bulk-cards">';

  html+='<div class="bulk-card">';
  html+='<div class="bulk-card-title">Bulk Create Teams</div>';
  html+='<div class="bulk-card-desc">Upload a CSV with columns: <b>TeamID, DisplayName</b></div>';
  html+='<button class="btn btn-g" id="btnBulkTeamsUpload">Upload CSV</button>';
  html+='<input type="file" id="bulkTeamsFile" accept=".csv" style="display:none" />';
  html+='<div id="bulkTeamsPreview"></div>';
  html+='</div>';

  html+='<div class="bulk-card">';
  html+='<div class="bulk-card-title">Bulk Add Users to Teams</div>';
  html+='<div class="bulk-card-desc">Upload a CSV with columns: <b>TeamID, UserName</b></div>';
  html+='<button class="btn btn-g" id="btnBulkMembersUpload">Upload CSV</button>';
  html+='<input type="file" id="bulkMembersFile" accept=".csv" style="display:none" />';
  html+='<div id="bulkMembersPreview"></div>';
  html+='</div>';

  html+='</div></div>';
  wrap.innerHTML=html;

  wrap.querySelector("#btnBulkTeamsUpload").addEventListener("click",function(){wrap.querySelector("#bulkTeamsFile").click();});
  wrap.querySelector("#bulkTeamsFile").addEventListener("change",function(){if(this.files&&this.files[0]){self._handleBulkTeamsFile(this.files[0],wrap.querySelector("#bulkTeamsPreview"));this.value="";}});
  wrap.querySelector("#btnBulkMembersUpload").addEventListener("click",function(){wrap.querySelector("#bulkMembersFile").click();});
  wrap.querySelector("#bulkMembersFile").addEventListener("change",function(){if(this.files&&this.files[0]){self._handleBulkMembersFile(this.files[0],wrap.querySelector("#bulkMembersPreview"));this.value="";}});
}

_handleBulkTeamsFile(file,previewEl){
  var self=this;
  var reader=new FileReader();
  reader.onload=function(e){
    var lines=e.target.result.split(/\r?\n/).filter(function(l){return l.trim();});
    if(lines.length<2){self._setStatus("CSV must have a header row and data rows.","e");return;}
    var headers=lines[0].split(",").map(function(h){return h.trim();});
    var idIdx=headers.indexOf("TeamID");
    var nameIdx=headers.indexOf("DisplayName");
    if(idIdx<0||nameIdx<0){self._setStatus("CSV must have TeamID and DisplayName columns.","e");return;}
    var rows=[];
    for(var i=1;i<lines.length;i++){
      var cells=lines[i].split(",").map(function(c){return c.trim().replace(/^"|"$/g,"");});
      rows.push({TeamID:cells[idIdx]||"",DisplayName:cells[nameIdx]||""});
    }
    var html='<div class="bulk-preview"><table><thead><tr><th>TeamID</th><th>DisplayName</th></tr></thead><tbody>';
    for(var i=0;i<rows.length;i++){html+='<tr><td>'+esc(rows[i].TeamID)+'</td><td>'+esc(rows[i].DisplayName)+'</td></tr>';}
    html+='</tbody></table></div>';
    html+='<div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-g" id="btnApplyBulkTeams">Create '+rows.length+' Teams</button></div>';
    previewEl.innerHTML=html;
    previewEl.querySelector("#btnApplyBulkTeams").addEventListener("click",function(){self._applyBulkCreateTeams(rows);});
  };
  reader.readAsText(file);
}

_applyBulkCreateTeams(rows){
  var self=this;
  if(!rows||rows.length===0)return;
  this._setStatus("Creating "+rows.length+" teams...","i",true);
  this._disableAll(true);
  var idx=0;var ok=0;var fail=0;
  function next(){
    if(idx>=rows.length){
      self._setStatus("Done: "+ok+" created, "+fail+" failed.","s");
      self._setConnected(!!self._token);
      return;
    }
    var r=rows[idx];
    self._setStatus("Creating team "+(idx+1)+"/"+rows.length+" ("+r.TeamID+")...","i",true);
    var body={schemas:["urn:ietf:params:scim:schemas:core:2.0:Group"],id:r.TeamID,displayName:r.DisplayName,members:[]};
    self._postTeam(body).then(function(){ok++;}).catch(function(){fail++;}).finally(function(){idx++;next();});
  }
  next();
}

_handleBulkMembersFile(file,previewEl){
  var self=this;
  var reader=new FileReader();
  reader.onload=function(e){
    var lines=e.target.result.split(/\r?\n/).filter(function(l){return l.trim();});
    if(lines.length<2){self._setStatus("CSV must have a header row and data rows.","e");return;}
    var headers=lines[0].split(",").map(function(h){return h.trim();});
    var tidIdx=headers.indexOf("TeamID");
    var unIdx=headers.indexOf("UserName");
    if(tidIdx<0||unIdx<0){self._setStatus("CSV must have TeamID and UserName columns.","e");return;}
    var rows=[];
    for(var i=1;i<lines.length;i++){
      var cells=lines[i].split(",").map(function(c){return c.trim().replace(/^"|"$/g,"");});
      rows.push({TeamID:cells[tidIdx]||"",UserName:cells[unIdx]||""});
    }
    // Group by team
    var teamMap={};
    for(var i=0;i<rows.length;i++){
      if(!teamMap[rows[i].TeamID])teamMap[rows[i].TeamID]=[];
      teamMap[rows[i].TeamID].push(rows[i].UserName);
    }
    var teamNames=Object.keys(teamMap);
    var html='<div class="bulk-preview"><table><thead><tr><th>TeamID</th><th>Users to Add</th></tr></thead><tbody>';
    for(var i=0;i<teamNames.length;i++){html+='<tr><td>'+esc(teamNames[i])+'</td><td>'+esc(teamMap[teamNames[i]].join(", "))+'</td></tr>';}
    html+='</tbody></table></div>';
    html+='<div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-g" id="btnApplyBulkMembers">Add Users to '+teamNames.length+' Teams</button></div>';
    previewEl.innerHTML=html;
    previewEl.querySelector("#btnApplyBulkMembers").addEventListener("click",function(){self._applyBulkAddMembers(teamMap);});
  };
  reader.readAsText(file);
}

_applyBulkAddMembers(teamMap){
  var self=this;
  var teamIds=Object.keys(teamMap);
  if(teamIds.length===0)return;
  this._setStatus("Updating "+teamIds.length+" teams...","i",true);
  this._disableAll(true);
  var idx=0;var ok=0;var fail=0;
  function next(){
    if(idx>=teamIds.length){
      self._setStatus("Done: "+ok+" teams updated, "+fail+" failed.","s");
      self._setConnected(!!self._token);
      return;
    }
    var tid=teamIds[idx];
    var newUsers=teamMap[tid];
    self._setStatus("Updating "+tid+" ("+(idx+1)+"/"+teamIds.length+")...","i",true);
    self._getTeam(tid).then(function(team){
      var members=team.members||[];
      for(var u=0;u<newUsers.length;u++){
        var exists=false;
        for(var m=0;m<members.length;m++){if(members[m].value===newUsers[u]){exists=true;break;}}
        if(!exists)members.push({value:newUsers[u]});
      }
      var body={schemas:team.schemas||["urn:ietf:params:scim:schemas:core:2.0:Group"],id:team.id,displayName:team.displayName,members:members};
      return self._putTeam(tid,body);
    }).then(function(){ok++;}).catch(function(){fail++;}).finally(function(){idx++;next();});
  }
  next();
}

_showAnalyticsTab(){
  var self=this;
  var wrap=this._el("detailWrap");
  this._el("summaryWrap").innerHTML="";

  var users=this._usersData;
  var teamsData=this._teamsData;
  var groupsData=this._groupsData;

  if(users.length===0){
    wrap.innerHTML='<div class="empty">Load Users, Teams, and Roles first to see analytics.</div>';
    return;
  }

  // --- Compute stats ---
  var totalUsers=users.length;
  var activeCount=0;var inactiveCount=0;
  for(var i=0;i<users.length;i++){if(users[i].Active==="true")activeCount++;else inactiveCount++;}

  // Users with no teams
  var usersInTeams={};
  for(var i=0;i<teamsData.length;i++){if(teamsData[i].UserID)usersInTeams[teamsData[i].UserID]=true;}
  var noTeamUsers=[];
  for(var i=0;i<users.length;i++){if(!usersInTeams[users[i].UserName])noTeamUsers.push(users[i]);}

  // Security audit: per-team active/inactive breakdown
  var teamAudit={};
  var usersRawMap={};
  for(var i=0;i<this._usersRaw.length;i++){usersRawMap[this._usersRaw[i].userName]=this._usersRaw[i].active;}
  for(var i=0;i<teamsData.length;i++){
    var t=teamsData[i];
    if(!t.UserID)continue;
    if(!teamAudit[t.ID])teamAudit[t.ID]={name:t.ID,displayName:t.DisplayName,active:0,inactive:0,total:0};
    var isActive=usersRawMap[t.UserID]===true||usersRawMap[t.UserID]==="true";
    if(isActive)teamAudit[t.ID].active++;else teamAudit[t.ID].inactive++;
    teamAudit[t.ID].total++;
  }
  var auditList=Object.keys(teamAudit).map(function(k){return teamAudit[k];}).sort(function(a,b){return b.inactive-a.inactive;});

  // --- Build HTML ---
  var html='<div class="detail-card">';
  html+='<div class="detail-section">Analytics Dashboard</div>';

  // Summary stats
  html+='<div class="analytics-row">';
  html+='<div class="stat-box"><div class="stat-num" style="color:#0a6ed1">'+totalUsers+'</div><div class="stat-label">Total Users</div></div>';
  html+='<div class="stat-box"><div class="stat-num" style="color:#107e3e">'+activeCount+'</div><div class="stat-label">Active</div></div>';
  html+='<div class="stat-box"><div class="stat-num" style="color:#bb0000">'+inactiveCount+'</div><div class="stat-label">Inactive</div></div>';
  html+='<div class="stat-box"><div class="stat-num" style="color:#e9730c">'+noTeamUsers.length+'</div><div class="stat-label">No Teams</div></div>';
  html+='</div>';

  // Cards
  html+='<div class="analytics-grid">';

  // Card 1: Users with no teams
  html+='<div class="analytics-card"><div class="analytics-card-header ac-orange">Users Without Teams <span>'+noTeamUsers.length+'</span></div>';
  html+='<div class="analytics-card-body">';
  if(noTeamUsers.length>0){
    html+='<table><thead><tr><th>UserName</th><th>DisplayName</th><th>Active</th></tr></thead><tbody>';
    for(var i=0;i<noTeamUsers.length;i++){
      var u=noTeamUsers[i];
      html+='<tr><td>'+esc(u.UserName)+'</td><td>'+esc(u.DisplayName)+'</td><td>'+esc(u.Active)+'</td></tr>';
    }
    html+='</tbody></table>';
  }else{html+='<div style="padding:16px;text-align:center;color:#6a6d70">All users have teams assigned</div>';}
  html+='</div></div>';

  html+='</div>';

  // Card 3: Security audit (full width)
  html+='<div class="analytics-card" style="min-width:100%"><div class="analytics-card-header ac-blue">Security Audit — Active/Inactive per Team <span>'+auditList.length+' teams</span></div>';
  html+='<div class="analytics-card-body" style="max-height:300px">';
  if(auditList.length>0){
    html+='<table><thead><tr><th>Team ID</th><th>Display Name</th><th>Total</th><th>Active</th><th>Inactive</th></tr></thead><tbody>';
    for(var i=0;i<auditList.length;i++){
      var a=auditList[i];
      var rowStyle=a.inactive>0?' style="background:#fef3e0"':'';
      html+='<tr'+rowStyle+'><td>'+esc(a.name)+'</td><td>'+esc(a.displayName)+'</td><td>'+a.total+'</td><td style="color:#107e3e;font-weight:600">'+a.active+'</td><td style="color:#bb0000;font-weight:600">'+a.inactive+'</td></tr>';
    }
    html+='</tbody></table>';
  }else{html+='<div style="padding:16px;text-align:center;color:#6a6d70">Load Teams to see audit data</div>';}
  html+='</div></div>';

  html+='</div>';
  wrap.innerHTML=html;
}

_fetchAll(endpoint,label){
  var self=this;
  var baseUrl=(this._props.tenantUrl||"").replace(/\/+$/,"");
  if(!baseUrl)return Promise.reject(new Error("Tenant URL not set. Check Builder panel."));
  if(!this._token)return Promise.reject(new Error("Not connected. Check Builder credentials."));
  var results=[];
  var startIndex=1;
  function nextPage(){
    self._setStatus("Fetching "+label+" ("+results.length+" so far)...","i",true);
    return fetch(baseUrl+endpoint+"?startIndex="+startIndex+"&count="+PAGE_SIZE,{
      headers:{"Authorization":"Bearer "+self._token,"x-sap-sac-custom-auth":"true"}
    }).then(function(resp){
      if(!resp.ok)return resp.text().then(function(t){throw new Error(resp.status+": "+t);});
      return resp.json();
    }).then(function(data){
      var total=data.totalResults||0;
      var res=data.Resources||[];
      for(var i=0;i<res.length;i++)results.push(res[i]);
      if(results.length>=total||res.length===0)return results;
      startIndex=startIndex+PAGE_SIZE;
      return nextPage();
    });
  }
  return nextPage();
}

_loadUsers(){
  var self=this;
  this._disableAll(true);
  this._fetchAll("/api/v1/scim2/Users","users").then(function(users){
    self._usersData=[];
    self._usersRaw=users;
    for(var i=0;i<users.length;i++){
      var u=users[i];var em=u.emails||[];
      var ro=(u.roles||[]).map(function(r){return r.display||r.value||"";}).join("; ");
      var gr=(u.groups||[]).map(function(g){return g.display||"";}).join("; ");
      self._usersData.push({UserName:u.userName||"",DisplayName:u.displayName||"",Email:em.length>0?(em[0].value||""):"",Active:String(u.active),Roles:ro,Groups:gr});
    }
    self._switchTab("users");
    self._setStatus("Loaded "+self._usersData.length+" users!","s");
  }).catch(function(err){self._setStatus("Error: "+err.message,"e");
  }).finally(function(){self._setConnected(!!self._token);});
}

_loadTeams(){
  var self=this;
  this._disableAll(true);
  this._fetchAll("/api/v1/scim/Groups","teams").then(function(teams){
    self._teamsData=[];
    self._teamsRaw=teams;
    var userMap={};
    for(var u=0;u<self._usersRaw.length;u++){userMap[self._usersRaw[u].userName]=self._usersRaw[u].displayName||"";}
    for(var i=0;i<teams.length;i++){
      var t=teams[i];var members=t.members||[];
      if(members.length===0){self._teamsData.push({ID:t.id||"",DisplayName:t.displayName||"",UserID:"",UserName:""});}
      else{for(var j=0;j<members.length;j++){var mid=members[j].value||"";self._teamsData.push({ID:t.id||"",DisplayName:t.displayName||"",UserID:mid,UserName:userMap[mid]||mid});}}
    }
    self._switchTab("teams");
    self._setStatus("Loaded "+teams.length+" teams ("+self._teamsData.length+" rows)!","s");
  }).catch(function(err){self._setStatus("Error: "+err.message,"e");
  }).finally(function(){self._setConnected(!!self._token);});
}

_loadGroups(){
  var self=this;
  this._disableAll(true);
  this._fetchAll("/api/v1/scim3/Groups","roles").then(function(groups){
    self._groupsData=[];
    self._groupsRaw=groups;
    for(var i=0;i<groups.length;i++){
      var g=groups[i];var members=g.members||[];
      if(members.length===0){self._groupsData.push({RoleName:g.displayName||"",Description:g.description||"",UserID:"",UserName:""});}
      else{for(var j=0;j<members.length;j++){self._groupsData.push({RoleName:g.displayName||"",Description:g.description||"",UserID:members[j].value||"",UserName:members[j].display||""});}}
    }
    self._switchTab("groups");
    self._setStatus("Loaded "+groups.length+" roles ("+self._groupsData.length+" rows)!","s");
  }).catch(function(err){self._setStatus("Error: "+err.message,"e");
  }).finally(function(){self._setConnected(!!self._token);});
}

_download(){
  if(this._activeTab==="teams"&&this._teamsData.length>0){
    downloadCSV(this._teamsData,this._teamHeaders,"sac_teams_export.csv");
    this._setStatus("Downloaded teams CSV ("+this._teamsData.length+" rows)!","s");
  }else if(this._activeTab==="groups"&&this._groupsData.length>0){
    downloadCSV(this._groupsData,this._groupHeaders,"sac_roles_export.csv");
    this._setStatus("Downloaded roles CSV ("+this._groupsData.length+" rows)!","s");
  }else{
    var info=this._getActiveData();
    var filtered=this._getFilteredSorted();
    if(filtered.length===0){this._setStatus("No data to download.","e");return;}
    downloadCSV(filtered,info.headers,"sac_"+info.name+"_export.csv");
    this._setStatus("Downloaded "+info.name+" CSV ("+filtered.length+" rows)!","s");
  }
}

_downloadExcel(){
  if(this._activeTab==="teams"&&this._teamsData.length>0){
    downloadExcel(this._teamsData,this._teamHeaders,"sac_teams_export.xls");
    this._setStatus("Downloaded teams Excel ("+this._teamsData.length+" rows)!","s");
  }else if(this._activeTab==="groups"&&this._groupsData.length>0){
    downloadExcel(this._groupsData,this._groupHeaders,"sac_roles_export.xls");
    this._setStatus("Downloaded roles Excel ("+this._groupsData.length+" rows)!","s");
  }else{
    var info=this._getActiveData();
    var filtered=this._getFilteredSorted();
    if(filtered.length===0){this._setStatus("No data to download.","e");return;}
    downloadExcel(filtered,info.headers,"sac_"+info.name+"_export.xls");
    this._setStatus("Downloaded "+info.name+" Excel ("+filtered.length+" rows)!","s");
  }
}

_downloadTeamMatrix(){
  if(this._usersData.length===0||this._teamsData.length===0){this._setStatus("Load Users and Teams first.","e");return;}
  var teamNames=[];var teamSet={};
  for(var i=0;i<this._teamsData.length;i++){
    var tid=this._teamsData[i].ID;
    if(tid&&!teamSet[tid]){teamSet[tid]=true;teamNames.push(tid);}
  }
  var userTeamMap={};
  for(var i=0;i<this._teamsData.length;i++){
    var t=this._teamsData[i];
    if(!t.UserID)continue;
    if(!userTeamMap[t.UserID])userTeamMap[t.UserID]={};
    userTeamMap[t.UserID][t.ID]=true;
  }
  var headers=["UserName","DisplayName"].concat(teamNames);
  var rows=[];
  for(var i=0;i<this._usersData.length;i++){
    var u=this._usersData[i];
    var row={UserName:u.UserName,DisplayName:u.DisplayName};
    var membership=userTeamMap[u.UserName]||{};
    for(var j=0;j<teamNames.length;j++){row[teamNames[j]]=membership[teamNames[j]]?"X":"";}
    rows.push(row);
  }
  downloadExcel(rows,headers,"sac_team_user_matrix.xls");
  this._setStatus("Downloaded team-user matrix ("+rows.length+" users x "+teamNames.length+" teams)!","s");
}

_exportAll(){
  if(this._usersData.length>0)downloadCSV(this._usersData,this._userHeaders,"sac_users_export.csv");
  if(this._teamsData.length>0)downloadCSV(this._teamsData,this._teamHeaders,"sac_teams_export.csv");
  if(this._groupsData.length>0)downloadCSV(this._groupsData,this._groupHeaders,"sac_roles_export.csv");
  var parts=[];
  if(this._usersData.length>0)parts.push(this._usersData.length+" users");
  if(this._teamsData.length>0)parts.push(this._teamsData.length+" team rows");
  if(this._groupsData.length>0)parts.push(this._groupsData.length+" role rows");
  if(parts.length===0){this._setStatus("No data to export.","e");return;}
  this._setStatus("Exported "+parts.join(", ")+"!","s");
}

_copy(){
  var info=this._getActiveData();
  var filtered=this._getFilteredSorted();
  if(filtered.length===0){this._setStatus("No data to copy.","e");return;}
  if(copyToClipboard(filtered,info.headers)){
    this._setStatus("Copied "+filtered.length+" "+info.name+" rows to clipboard!","s");
  }else{
    this._setStatus("Copy not supported in this browser.","e");
  }
}

}

customElements.define("com-custom-secexport",SecExport);

/* ── Builder Panel ── */
class SecExportBuilder extends HTMLElement{

constructor(){
  super();
  this._props={tenantUrl:"",tokenUrl:"",clientId:"",clientSecret:""};
  this.attachShadow({mode:"open"});
  this.shadowRoot.innerHTML='<style>'+
    ':host{display:block;font-family:"72","Segoe UI",sans-serif;padding:12px;font-size:13px}'+
    '.row{margin-bottom:12px}'+
    '.row label{display:block;font-size:12px;font-weight:600;color:#32363a;margin-bottom:4px}'+
    '.row input{width:100%;box-sizing:border-box;padding:7px 10px;border:1px solid #bfbfbf;border-radius:4px;font-size:13px;font-family:inherit}'+
    '.row input:focus{border-color:#0a6ed1;outline:none}'+
    'h3{margin:0 0 12px 0;font-size:14px;font-weight:700;color:#0a6ed1}'+
    '</style>'+
    '<h3>Connection Settings</h3>'+
    '<div class="row"><label>Tenant URL</label><input type="text" id="tenantUrl" placeholder="https://your-tenant.analytics.cloud.sap" /></div>'+
    '<div class="row"><label>OAuth Token URL</label><input type="text" id="tokenUrl" placeholder="https://your-tenant.authentication.region.hana.ondemand.com/oauth/token" /></div>'+
    '<div class="row"><label>Client ID</label><input type="text" id="clientId" placeholder="sb-xxxxxxxx-xxxx-..." /></div>'+
    '<div class="row"><label>Client Secret</label><input type="password" id="clientSecret" placeholder="Enter client secret" /></div>';
}

connectedCallback(){
  var self=this;
  var fields=["tenantUrl","tokenUrl","clientId","clientSecret"];
  for(var i=0;i<fields.length;i++){
    (function(field){
      self.shadowRoot.getElementById(field).addEventListener("change",function(){
        self._props[field]=this.value;
        self._fireChanged();
      });
    })(fields[i]);
  }
}

onCustomWidgetBeforeUpdate(changed){
  if(changed){
    var fields=["tenantUrl","tokenUrl","clientId","clientSecret"];
    for(var i=0;i<fields.length;i++){
      if(changed[fields[i]]!==undefined){this._props[fields[i]]=changed[fields[i]];}
    }
  }
}

onCustomWidgetAfterUpdate(changed){
  this.onCustomWidgetBeforeUpdate(changed);
  var fields=["tenantUrl","tokenUrl","clientId","clientSecret"];
  for(var i=0;i<fields.length;i++){
    var el=this.shadowRoot.getElementById(fields[i]);
    if(el&&this._props[fields[i]]){el.value=this._props[fields[i]];}
  }
}

_fireChanged(){
  this.dispatchEvent(new CustomEvent("propertiesChanged",{detail:{properties:this._props}}));
}

}

customElements.define("com-custom-secexport-builder",SecExportBuilder);

})();
