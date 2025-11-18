import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Pencil, Trash2, Maximize2 } from 'lucide-react';
import type { InfringementRecord } from '../api';
import { API_BASE } from '../api';

interface InfringementLogProps {
  infringements: InfringementRecord[];
  onEdit: (infringement: InfringementRecord) => void;
  onDelete: (id: number) => void;
  warningExpiryMinutes?: number;
  onPopupOpened?: (window: Window) => void;
}

export function InfringementLog({ infringements, onEdit, onDelete, warningExpiryMinutes = 180, onPopupOpened }: InfringementLogProps) {
  const [searchKartNumber, setSearchKartNumber] = useState('');
  const popupWindowRef = useRef<Window | null>(null);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Filter infringements by kart number (exact match)
  const filteredInfringements = searchKartNumber
    ? infringements.filter((inf) => {
        const searchValue = searchKartNumber.trim();
        const kartNum = inf.kart_number.toString();
        return kartNum === searchValue || Number(kartNum) === Number(searchValue);
      })
    : infringements;

  const handleExpand = () => {
    const newWindow = window.open('', '_blank', 'width=1400,height=900');
    if (!newWindow) {
      console.error('Failed to open popup window - popup may be blocked');
      return;
    }
    
    try {
      popupWindowRef.current = newWindow;
      if (onPopupOpened) {
        onPopupOpened(newWindow);
      }

      const apiBase = API_BASE || 'http://localhost:8000';
      const expiryMins = warningExpiryMinutes || 180;
      
      // Build HTML using string concatenation to avoid template literal issues
      const htmlParts = [
        '<!DOCTYPE html><html><head><title>Infringement Log</title><style>',
        '* { margin: 0; padding: 0; box-sizing: border-box; }',
        'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f5f5f5; }',
        '.container { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }',
        '.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }',
        'h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; }',
        '.search-container { display: flex; align-items: center; gap: 8px; }',
        '.search-input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; width: 160px; }',
        '.search-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }',
        '.back-btn { padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: white; font-size: 12px; cursor: pointer; display: none; }',
        '.back-btn:hover { background: #f9fafb; }',
        '.back-btn.show { display: block; }',
        'table { width: 100%; border-collapse: collapse; }',
        'th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; }',
        'td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1a1a1a; }',
        'tr:hover { background: #f9fafb; }',
        '.badge { display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid; padding: 2px 8px; font-size: 12px; font-weight: 500; }',
        '.badge-applied { background: #dc2626; color: white; border-color: transparent; }',
        '.badge-expired { background: #f3f4f6; color: #374151; border-color: #d1d5db; }',
        '.badge-warning { background: #fef3c7; color: #92400e; border-color: transparent; }',
        '.badge-pending { background: transparent; color: #1a1a1a; border-color: #d1d5db; }',
        '.badge-cleared { background: transparent; color: #1a1a1a; border-color: #d1d5db; }',
        '.empty { text-align: center; padding: 40px; color: #6b7280; }',
        '.actions { display: flex; gap: 8px; justify-content: flex-end; }',
        '.btn { padding: 6px 12px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }',
        '.btn-edit { background: #f3f4f6; color: #374151; }',
        '.btn-edit:hover { background: #e5e7eb; }',
        '.btn-delete { background: #fee2e2; color: #991b1b; }',
        '.btn-delete:hover { background: #fecaca; }',
        '.btn-icon { width: 14px; height: 14px; }',
        '.modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; }',
        '.modal.show { display: flex; }',
        '.modal-content { background: white; padding: 24px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; }',
        '.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }',
        '.modal-title { font-size: 18px; font-weight: 600; }',
        '.modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; }',
        '.modal-close:hover { color: #1a1a1a; }',
        '.form-group { margin-bottom: 16px; }',
        '.form-label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }',
        '.form-input { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }',
        '.form-select { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: white; }',
        '.modal-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }',
        '.btn-primary { background: #3b82f6; color: white; }',
        '.btn-primary:hover { background: #2563eb; }',
        '.btn-secondary { background: #f3f4f6; color: #374151; }',
        '.btn-secondary:hover { background: #e5e7eb; }',
        '</style></head><body><div class="container">',
        '<div class="header"><h1>Recent Infringements</h1>',
        '<div class="search-container"><button class="back-btn" id="backBtn">Back</button>',
        '<input type="text" class="search-input" id="searchInput" placeholder="Search by kart #" />',
        '</div></div>',
        '<table id="infringementTable"><thead><tr>',
        '<th>Time</th><th>Kart #</th><th>Turn</th><th>Infringement</th><th>Penalty</th><th>Observer</th><th>Status</th><th style="text-align: right;">Actions</th>',
        '</tr></thead><tbody id="tableBody"><tr><td colspan="8" class="empty">Loading...</td></tr></tbody></table>',
        '</div><div id="editModal" class="modal"><div class="modal-content"><div class="modal-header"><h2 class="modal-title">Edit Infringement</h2><button class="modal-close" id="closeModal">&times;</button></div><form id="editForm"><div class="form-group"><label class="form-label">Kart Number</label><input type="number" class="form-input" id="editKart" required /></div><div class="form-group"><label class="form-label">Turn</label><input type="number" class="form-input" id="editTurn" /></div><div class="form-group"><label class="form-label">Observer</label><input type="text" class="form-input" id="editObserver" required /></div><div class="form-group"><label class="form-label">Infringement</label><select class="form-select" id="editInfringement" required><option value="">Select...</option><option value="White Line Infringement">White Line Infringement</option><option value="Pit Time Infringement">Pit Time Infringement</option><option value="Yellow Zone Infringement">Yellow Zone Infringement</option><option value="Dangerous Driving">Dangerous Driving</option><option value="Blocking">Blocking</option><option value="Collision">Collision</option><option value="Unsafe Re-entry">Unsafe Re-entry</option><option value="Ignoring Flags">Ignoring Flags</option><option value="Pit Lane Speed">Pit Lane Speed</option><option value="Other">Other</option></select></div><div class="form-group"><label class="form-label">Penalty</label><select class="form-select" id="editPenalty" required><option value="">Select...</option><option value="Warning">Warning</option><option value="5 Sec">5 Sec</option><option value="10 Sec">10 Sec</option><option value="Fastest Lap Invalidation">Fastest Lap Invalidation</option><option value="Stop and Go">Stop and Go</option><option value="Drive Through">Drive Through</option><option value="Time Penalty">Time Penalty</option><option value="Disqualification">Disqualification</option></select></div><div class="modal-footer"><button type="button" class="btn btn-secondary" id="cancelEdit">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div></form></div></div><script>(function(){',
        'const API_BASE=' + JSON.stringify(apiBase) + ';',
        'const WARNING_EXPIRY_MINUTES=' + expiryMins + ';',
        'let socket=null;',
        'function formatTime(t){return new Date(t).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"});}',
        'function isExpired(inf){if(inf.penalty_description!=="Warning")return false;const ts=new Date(inf.timestamp);const now=new Date();return(now.getTime()-ts.getTime())/(1000*60)>WARNING_EXPIRY_MINUTES;}',
        'function getStatus(inf){const isW=inf.penalty_description==="Warning";const applied=inf.penalty_due==="No"&&inf.penalty_taken&&!isW;if(applied)return"Applied";if(isExpired(inf))return"Expired";if(isW)return"Warning";if(inf.penalty_due==="Yes")return"Pending";return"Cleared";}',
        'function escapeHtml(t){const d=document.createElement("div");d.textContent=t;return d.innerHTML;}',
        'async function refreshTable(){const tbody=document.getElementById("tableBody");if(!tbody)return;try{const r=await fetch(API_BASE+"/infringements/");if(!r.ok)throw new Error("Failed: "+r.status);const d=await r.json();const si=document.getElementById("searchInput");const bb=document.getElementById("backBtn");const sv=si?si.value.trim().toLowerCase():"";if(bb){if(sv)bb.classList.add("show");else bb.classList.remove("show");}const f=sv?d.filter(i=>{const kn=i.kart_number.toString();return kn===sv||Number(kn)===Number(sv);}):d;if(f.length===0){tbody.innerHTML="<tr><td colspan=8 class=empty>"+(sv?"No infringements found for kart #"+escapeHtml(sv):"No infringements logged yet")+"</td></tr>";}else{tbody.innerHTML=f.map(i=>{const id=escapeHtml(i.id.toString());const kn=escapeHtml(i.kart_number.toString());const tm=escapeHtml(formatTime(i.timestamp));const tn=i.turn_number?escapeHtml(i.turn_number.toString()):"—";const ds=escapeHtml(i.description||"");const pn=i.penalty_description?escapeHtml(i.penalty_description):"—";const ob=i.observer?escapeHtml(i.observer):"—";const st=escapeHtml(getStatus(i));const sc=getStatus(i).toLowerCase();return"<tr data-kart="+kn+" data-id="+id+"><td>"+tm+"</td><td>"+kn+"</td><td>"+tn+"</td><td>"+ds+"</td><td>"+pn+"</td><td>"+ob+"</td><td><span class=badge-"+sc+">"+st+"</span></td><td><div class=actions><button class=btn-btn-edit onclick=\\"window.handleEdit("+id+")\\" title=Edit><svg class=btn-icon fill=none stroke=currentColor viewBox=\\"0 0 24 24\\"><path stroke-linecap=round stroke-linejoin=round stroke-width=2 d=\\"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z\\"/></svg></button><button class=btn-btn-delete onclick=\\"window.handleDelete("+id+")\\" title=Delete><svg class=btn-icon fill=none stroke=currentColor viewBox=\\"0 0 24 24\\"><path stroke-linecap=round stroke-linejoin=round stroke-width=2 d=\\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\\"/></svg></button></div></td></tr>";}).join("");}}catch(e){console.error("Refresh error:",e);if(tbody)tbody.innerHTML="<tr><td colspan=8 class=empty>Error: "+escapeHtml(e.message||"Unknown")+"</td></tr>";}}',
        'function filterTable(){refreshTable();}',
        'function clearSearch(){const si=document.getElementById("searchInput");if(si){si.value="";filterTable();}}',
        'let currentEditId=null;window.handleEdit=async function(id){try{const r=await fetch(API_BASE+"/infringements/");if(!r.ok)throw new Error("Failed to fetch");const data=await r.json();const inf=data.find(i=>i.id===Number(id)||i.id===id);if(!inf)throw new Error("Infringement not found");currentEditId=Number(id);document.getElementById("editKart").value=inf.kart_number||"";document.getElementById("editTurn").value=inf.turn_number||"";document.getElementById("editObserver").value=inf.observer||"";document.getElementById("editInfringement").value=inf.description||"";document.getElementById("editPenalty").value=inf.penalty_description||"";document.getElementById("editModal").classList.add("show");}catch(e){console.error("Edit error:",e);alert("Failed to load infringement: "+e.message);}};',
        'window.handleDelete=async function(id){if(!confirm("Are you sure you want to delete this infringement?"))return;try{const r=await fetch(API_BASE+"/infringements/"+id,{method:"DELETE",headers:{"Content-Type":"application/json"}});if(r.ok){await refreshTable();if(window.opener)window.opener.postMessage({type:"deleteInfringement",id:id},"*");}else{alert("Failed to delete");}}catch(e){console.error("Delete error:",e);alert("Error deleting");}};',
        'document.getElementById("searchInput").addEventListener("input",filterTable);',
        'document.getElementById("backBtn").addEventListener("click",clearSearch);',
        'document.getElementById("closeModal").addEventListener("click",function(){document.getElementById("editModal").classList.remove("show");});',
        'document.getElementById("cancelEdit").addEventListener("click",function(){document.getElementById("editModal").classList.remove("show");});',
        'document.getElementById("editForm").addEventListener("submit",async function(e){e.preventDefault();if(!currentEditId)return;const payload={kart_number:parseInt(document.getElementById("editKart").value),turn_number:document.getElementById("editTurn").value?parseInt(document.getElementById("editTurn").value):null,observer:document.getElementById("editObserver").value,description:document.getElementById("editInfringement").value,penalty_description:document.getElementById("editPenalty").value,performed_by:"Race Control Operator"};try{const r=await fetch(API_BASE+"/infringements/"+currentEditId,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});if(r.ok){document.getElementById("editModal").classList.remove("show");await refreshTable();if(window.opener)window.opener.postMessage({type:"updateInfringement",id:currentEditId},"*");}else{const errText=await r.text();console.error("Update failed:",r.status,errText);alert("Failed to update infringement: "+errText);}}catch(err){console.error("Update error:",err);alert("Error updating infringement: "+err.message);}});',
        'window.addEventListener("message",async function(e){if(e.data&&e.data.type==="updateInfringements")await refreshTable();});',
        'try{const ws=API_BASE.replace(/^http/,"ws").replace(/\\/$/,"")+"/ws";socket=new WebSocket(ws);socket.onmessage=function(e){try{const m=JSON.parse(e.data);if(["new_infringement","update_infringement","delete_infringement","penalty_applied"].includes(m.type))refreshTable();}catch(err){console.error("WS error:",err);}};socket.onerror=function(err){console.error("WS error:",err);};socket.onopen=function(){console.log("WS connected");};}catch(err){console.error("WS failed:",err);}',
        'refreshTable();',
        'window.addEventListener("beforeunload",function(){if(socket)socket.close();});',
        '})();</script></body></html>'
      ];
      
      const htmlContent = htmlParts.join('');

      // Write content to the window
      try {
        if (newWindow && !newWindow.closed) {
          newWindow.document.open();
          newWindow.document.write(htmlContent);
          newWindow.document.close();
          
          // Focus the window
          newWindow.focus();
        }
      } catch (writeError) {
        console.error('Error writing to popup window:', writeError);
        // Fallback: try using data URL
        try {
          const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
          newWindow.location.href = dataUrl;
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          newWindow?.close();
          alert('Failed to open popup window. Please check if popups are blocked.');
        }
      }
    } catch (error) {
      console.error('Error creating popup window:', error);
      newWindow?.close();
    }
  };

  const isExpired = (inf: InfringementRecord) => {
    if (inf.penalty_description !== 'Warning') return false;
    const timestamp = new Date(inf.timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - timestamp.getTime()) / (1000 * 60);
    return diffMinutes > warningExpiryMinutes;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Recent Infringements</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleExpand}
              className="h-8 w-8 p-0"
              aria-label="Open in new tab"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {searchKartNumber && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setSearchKartNumber('')}
                className="h-7 px-3 text-xs"
              >
                Back
              </Button>
            )}
            <div className="w-40">
              <Label htmlFor="kart-search" className="sr-only">Search by Kart Number</Label>
              <Input
                id="kart-search"
                type="text"
                placeholder="Search by kart #"
                value={searchKartNumber}
                onChange={(e) => setSearchKartNumber(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[700px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Kart #</TableHead>
                <TableHead>Turn</TableHead>
                <TableHead>Infringement</TableHead>
                <TableHead>Penalty</TableHead>
                <TableHead>Observer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInfringements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    {searchKartNumber ? `No infringements found for kart #${searchKartNumber}` : 'No infringements logged yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInfringements.map((inf) => {
                  const isWarning = inf.penalty_description === 'Warning';
                  
                  // Check if warning is expired based on configurable expiry time
                  const isExpiredWarning = isWarning && (() => {
                    const timestamp = new Date(inf.timestamp);
                    const now = new Date();
                    const diffMinutes = (now.getTime() - timestamp.getTime()) / (1000 * 60);
                    return diffMinutes > warningExpiryMinutes;
                  })();
                  
                  const penaltyApplied =
                    inf.penalty_due === 'No' &&
                    Boolean(inf.penalty_taken) &&
                    !isWarning;

                  let statusLabel = '';
                  let statusVariant: 'default' | 'destructive' | 'outline' | 'secondary' = 'outline';

                  if (penaltyApplied) {
                    statusLabel = 'Applied';
                    statusVariant = 'destructive';
                  } else if (isExpiredWarning) {
                    statusLabel = 'Expired';
                    statusVariant = 'secondary';
                  } else if (isWarning) {
                    statusLabel = 'Warning';
                    statusVariant = 'secondary';
                    // Override with yellow/amber colors for warning
                  } else if (inf.penalty_due === 'Yes') {
                    statusLabel = 'Pending';
                    statusVariant = 'outline';
                  } else {
                    statusLabel = 'Cleared';
                    statusVariant = 'outline';
                  }
                  return (
                    <TableRow key={inf.id}>
                      <TableCell>{formatTime(inf.timestamp)}</TableCell>
                      <TableCell>{inf.kart_number}</TableCell>
                      <TableCell>{inf.turn_number ?? '—'}</TableCell>
                      <TableCell>{inf.description}</TableCell>
                      <TableCell>{inf.penalty_description ?? '—'}</TableCell>
                      <TableCell>{inf.observer ?? '—'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusVariant}
                          className={isWarning && !isExpiredWarning ? 'bg-yellow-100 text-yellow-800 border-transparent' : undefined}
                        >
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(inf)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(inf.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
