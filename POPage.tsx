import { useState, useEffect } from "react";
import { ShoppingCart, Search, Filter, Edit3, Save, X, Plus, RefreshCw } from "lucide-react";
import { DEFAULT_PO_RECORDS, type PORecord, type POStatus } from "../data/mockData";

const LS_KEY = "wms_po_records";

function loadPO(): PORecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_PO_RECORDS.map(r => ({ ...r }));
}

function savePO(records: PORecord[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(records));
}

const STATUS_CONFIG: Record<POStatus, { bg: string; color: string; label: string }> = {
  'Pending': { bg: "#fef9c3", color: "#854d0e", label: "Pending" },
  'In Transit': { bg: "#dbeafe", color: "#1d4ed8", label: "In Transit" },
  'Received': { bg: "#dcfce7", color: "#059669", label: "Received" },
  'Partial': { bg: "#fff7ed", color: "#c2410c", label: "Partial" },
  'Cancelled': { bg: "#f1f5f9", color: "#64748b", label: "Cancelled" },
};

const ALL_STATUSES: POStatus[] = ['Pending', 'In Transit', 'Received', 'Partial', 'Cancelled'];

const EMPTY_PO: Omit<PORecord, 'id'> = {
  supplierName: '', indentInfo: '', poDate: new Date().toISOString().split('T')[0],
  currentStatus: 'Pending', targetProduct: '', pendingQty: 0, pendingUnit: 'g',
};

export function POPage() {
  const [records, setRecords] = useState<PORecord[]>(loadPO);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<POStatus | "All">("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<PORecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newPO, setNewPO] = useState<Omit<PORecord, 'id'>>(EMPTY_PO);

  useEffect(() => { savePO(records); }, [records]);

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.supplierName.toLowerCase().includes(q) ||
      r.indentInfo.toLowerCase().includes(q) ||
      r.targetProduct.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || r.currentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const startEdit = (r: PORecord) => { setEditingId(r.id); setEditDraft({ ...r }); };
  const cancelEdit = () => { setEditingId(null); setEditDraft(null); };
  const saveEdit = () => {
    if (!editDraft) return;
    setRecords(prev => prev.map(r => r.id === editDraft.id ? editDraft : r));
    setEditingId(null); setEditDraft(null);
  };

  const addPO = () => {
    if (!newPO.supplierName.trim()) return;
    const nextNum = String(records.length + 1).padStart(3, '0');
    const id = `PO-2026-${nextNum}`;
    setRecords(prev => [...prev, { id, ...newPO }]);
    setNewPO(EMPTY_PO);
    setShowAdd(false);
  };

  const resetToDefault = () => {
    if (confirm("Reset all PO records to default?")) {
      setRecords(DEFAULT_PO_RECORDS.map(r => ({ ...r })));
    }
  };

  const statusCounts = records.reduce((acc, r) => {
    acc[r.currentStatus] = (acc[r.currentStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "#0f172a" }}>Purchase Orders</h2>
          <p style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "2px" }}>Manage supplier POs, indent info, and delivery tracking — changes persist across reloads</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-5 gap-3">
        {ALL_STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
              className="rounded-xl p-3 text-center transition-all"
              style={{
                background: statusFilter === s ? cfg.color : cfg.bg,
                border: `2px solid ${statusFilter === s ? cfg.color : "transparent"}`,
                color: statusFilter === s ? "#fff" : cfg.color,
              }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>{statusCounts[s] || 0}</div>
              <div style={{ fontSize: "0.7rem", fontWeight: 600 }}>{s}</div>
            </button>
          );
        })}
      </div>

      {/* Filters & Actions */}
      <div className="rounded-xl p-4 shadow-sm" style={{ background: "#fff", border: "1px solid rgba(30,64,175,0.1)" }}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search PO ID, supplier, product, indent..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border outline-none transition-all"
              style={{ fontSize: "0.875rem", borderColor: "#e2e8f0", background: "#f9fafb" }}
              onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4" style={{ color: "#94a3b8" }} />
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Status:</span>
            {["All", ...ALL_STATUSES].map(s => (
              <button key={s} onClick={() => setStatusFilter(s as POStatus | "All")}
                className="px-2.5 py-1.5 rounded-lg transition-all"
                style={{ fontSize: "0.75rem", fontWeight: 600, background: statusFilter === s ? "#1d4ed8" : "#f1f5f9", color: statusFilter === s ? "#fff" : "#475569" }}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white" style={{ background: "linear-gradient(135deg,#1d4ed8,#0ea5e9)", fontSize: "0.8125rem", fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> New PO
          </button>
          <button onClick={resetToDefault} className="flex items-center gap-2 px-4 py-2.5 rounded-lg" style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.8125rem", fontWeight: 600 }}>
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>

        {showAdd && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: "#f0f5ff", border: "1px solid #dbeafe" }}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-3">
              {([
                { key: 'supplierName', label: 'Supplier Name', type: 'text' },
                { key: 'indentInfo', label: 'Indent Info', type: 'text' },
                { key: 'poDate', label: 'PO Date', type: 'date' },
                { key: 'targetProduct', label: 'Target Product', type: 'text' },
                { key: 'pendingQty', label: 'Pending Qty', type: 'number' },
                { key: 'pendingUnit', label: 'Unit', type: 'text' },
              ] as const).map(field => (
                <div key={field.key}>
                  <label className="block mb-1" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151" }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={String((newPO as Record<string, string | number>)[field.key])}
                    onChange={e => setNewPO(prev => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 border outline-none"
                    style={{ fontSize: "0.8125rem", borderColor: "#d1d5db", background: "#fff" }}
                  />
                </div>
              ))}
              <div>
                <label className="block mb-1" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151" }}>Status</label>
                <select value={newPO.currentStatus} onChange={e => setNewPO(prev => ({ ...prev, currentStatus: e.target.value as POStatus }))}
                  className="w-full rounded-lg px-3 py-2 border outline-none" style={{ fontSize: "0.8125rem", borderColor: "#d1d5db", background: "#fff" }}>
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addPO} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white" style={{ background: "#1d4ed8", fontSize: "0.8125rem", fontWeight: 600 }}>
                <Save className="w-3.5 h-3.5" /> Save PO
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg" style={{ background: "#e2e8f0", color: "#64748b", fontSize: "0.8125rem", fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid rgba(30,64,175,0.1)" }}>
        <div className="px-5 py-3 flex items-center gap-2" style={{ background: "linear-gradient(90deg, #1d4ed8, #0ea5e9)" }}>
          <ShoppingCart className="w-4 h-4 text-white" />
          <span className="text-white" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Purchase Order Register</span>
          <span className="ml-auto text-blue-200" style={{ fontSize: "0.75rem" }}>{filtered.length} orders · Auto-saved</span>
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full" style={{ fontSize: "0.79rem", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ background: "#f0f5ff" }}>
                {["PO ID", "Supplier Name", "Indent Info", "PO Date", "Target Product", "Pending Qty", "Current Status", "Actions"].map((h, i) => (
                  <th key={i} className={`px-3 py-2.5 ${i <= 4 ? "text-left" : "text-right"}`}
                    style={{ color: "#475569", fontWeight: 600, fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid #dbeafe" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, ri) => {
                const isEditing = editingId === row.id && editDraft !== null;
                const display = isEditing ? editDraft! : row;
                const stCfg = STATUS_CONFIG[display.currentStatus];

                return (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9", background: isEditing ? "#f0f5ff" : ri % 2 === 0 ? "#fff" : "#fafbff" }}>
                    <td className="px-3 py-2.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#1d4ed8", fontWeight: 700, fontSize: "0.75rem", whiteSpace: "nowrap" }}>{row.id}</td>
                    <td className="px-3 py-2.5" style={{ fontWeight: 500, color: "#0f172a" }}>
                      {isEditing ? (
                        <input value={display.supplierName} onChange={e => setEditDraft(prev => ({ ...prev!, supplierName: e.target.value }))}
                          className="rounded px-2 py-1 border outline-none w-44" style={{ fontSize: "0.79rem", borderColor: "#93c5fd" }} />
                      ) : row.supplierName}
                    </td>
                    <td className="px-3 py-2.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#64748b", fontSize: "0.72rem" }}>
                      {isEditing ? (
                        <input value={display.indentInfo} onChange={e => setEditDraft(prev => ({ ...prev!, indentInfo: e.target.value }))}
                          className="rounded px-2 py-1 border outline-none w-40" style={{ fontSize: "0.72rem", borderColor: "#93c5fd", fontFamily: "JetBrains Mono, monospace" }} />
                      ) : row.indentInfo}
                    </td>
                    <td className="px-3 py-2.5" style={{ color: "#374151", whiteSpace: "nowrap" }}>
                      {isEditing ? (
                        <input type="date" value={display.poDate} onChange={e => setEditDraft(prev => ({ ...prev!, poDate: e.target.value }))}
                          className="rounded px-2 py-1 border outline-none" style={{ fontSize: "0.79rem", borderColor: "#93c5fd" }} />
                      ) : row.poDate}
                    </td>
                    <td className="px-3 py-2.5" style={{ color: "#374151" }}>
                      {isEditing ? (
                        <input value={display.targetProduct} onChange={e => setEditDraft(prev => ({ ...prev!, targetProduct: e.target.value }))}
                          className="rounded px-2 py-1 border outline-none w-40" style={{ fontSize: "0.79rem", borderColor: "#93c5fd" }} />
                      ) : row.targetProduct}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {isEditing ? (
                        <div className="flex gap-1 justify-end">
                          <input type="number" value={display.pendingQty} onChange={e => setEditDraft(prev => ({ ...prev!, pendingQty: Number(e.target.value) }))}
                            className="w-20 text-right rounded px-2 py-1 border outline-none" style={{ fontSize: "0.79rem", borderColor: "#93c5fd", fontFamily: "JetBrains Mono, monospace" }} />
                          <input value={display.pendingUnit} onChange={e => setEditDraft(prev => ({ ...prev!, pendingUnit: e.target.value }))}
                            className="w-12 text-center rounded px-2 py-1 border outline-none" style={{ fontSize: "0.79rem", borderColor: "#93c5fd" }} />
                        </div>
                      ) : (
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: display.pendingQty > 0 ? 600 : 400, color: display.pendingQty > 0 ? "#c2410c" : "#94a3b8" }}>
                          {display.pendingQty > 0 ? `${display.pendingQty.toLocaleString()} ${display.pendingUnit}` : "Nil"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {isEditing ? (
                        <select value={display.currentStatus} onChange={e => setEditDraft(prev => ({ ...prev!, currentStatus: e.target.value as POStatus }))}
                          className="rounded px-2 py-1.5 border outline-none" style={{ fontSize: "0.79rem", borderColor: "#93c5fd" }}>
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className="rounded-full px-2.5 py-1" style={{ fontSize: "0.6875rem", fontWeight: 600, background: stCfg.bg, color: stCfg.color }}>
                          {stCfg.label}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {isEditing ? (
                        <div className="flex gap-1.5 justify-end">
                          <button onClick={saveEdit} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white" style={{ background: "#059669", fontSize: "0.7rem", fontWeight: 600 }}>
                            <Save className="w-3 h-3" /> Save
                          </button>
                          <button onClick={cancelEdit} className="px-2 py-1.5 rounded-lg" style={{ background: "#f1f5f9", color: "#64748b" }}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(row)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ml-auto" style={{ background: "#f0f5ff", color: "#1d4ed8", fontSize: "0.7rem", fontWeight: 600 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#dbeafe"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f0f5ff"; }}>
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10" style={{ color: "#94a3b8", fontSize: "0.875rem" }}>No PO records match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
