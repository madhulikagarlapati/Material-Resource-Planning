import { useState, useEffect } from "react";
import { Archive, Search, Edit3, Save, X, Plus, RefreshCw } from "lucide-react";
import { DEFAULT_STOCK_RECORDS, type StockRecord } from "../data/mockData";

const LS_KEY = "wms_stock_records";

function loadStock(): StockRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_STOCK_RECORDS.map(r => ({ ...r }));
}

function saveStock(records: StockRecord[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(records));
}

function fmt(n: number) { return n.toLocaleString('en-IN'); }

export function StockPage() {
  const [records, setRecords] = useState<StockRecord[]>(loadStock);
  const [search, setSearch] = useState("");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<StockRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRecord, setNewRecord] = useState<StockRecord>({ productCode: '', productName: '', approved: 0, underTest: 0, expired: 0 });

  useEffect(() => { saveStock(records); }, [records]);

  const filtered = records.filter(r =>
    r.productCode.toLowerCase().includes(search.toLowerCase()) ||
    r.productName.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (r: StockRecord) => { setEditingCode(r.productCode); setEditDraft({ ...r }); };
  const cancelEdit = () => { setEditingCode(null); setEditDraft(null); };
  const saveEdit = () => {
    if (!editDraft) return;
    const updated = records.map(r => r.productCode === editDraft.productCode ? editDraft : r);
    setRecords(updated);
    setEditingCode(null); setEditDraft(null);
  };

  const addRecord = () => {
    if (!newRecord.productCode.trim()) return;
    const exists = records.find(r => r.productCode === newRecord.productCode.trim().toUpperCase());
    if (exists) return;
    const toAdd: StockRecord = { ...newRecord, productCode: newRecord.productCode.trim().toUpperCase() };
    setRecords(prev => [...prev, toAdd]);
    setNewRecord({ productCode: '', productName: '', approved: 0, underTest: 0, expired: 0 });
    setShowAdd(false);
  };

  const resetToDefault = () => {
    if (confirm("Reset all stock to default values?")) {
      const fresh = DEFAULT_STOCK_RECORDS.map(r => ({ ...r }));
      setRecords(fresh);
    }
  };

  const totalApproved = records.reduce((a, r) => a + r.approved, 0);
  const totalExpired = records.reduce((a, r) => a + r.expired, 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "#0f172a" }}>Stock Inventory</h2>
          <p style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "2px" }}>Product-level inventory — changes persist across page reloads</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl px-4 py-2.5 text-center" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#059669" }}>{fmt(totalApproved)}</div>
            <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#059669" }}>Total Approved</div>
          </div>
          <div className="rounded-xl px-4 py-2.5 text-center" style={{ background: "#fee2e2", border: "1px solid #fecaca" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#dc2626" }}>{fmt(totalExpired)}</div>
            <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#dc2626" }}>Total Expired</div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="rounded-xl p-4 shadow-sm" style={{ background: "#fff", border: "1px solid rgba(30,64,175,0.1)" }}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by product code or name..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border outline-none transition-all"
              style={{ fontSize: "0.875rem", borderColor: "#e2e8f0", background: "#f9fafb" }}
              onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white transition-all"
            style={{ background: "#059669", fontSize: "0.8125rem", fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Add Stock
          </button>
          <button onClick={resetToDefault}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all"
            style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.8125rem", fontWeight: 600 }}>
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>

        {showAdd && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: "#f0f5ff", border: "1px solid #dbeafe" }}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-3">
              {[
                { key: 'productCode', label: 'Product Code', type: 'text' },
                { key: 'productName', label: 'Product Name', type: 'text' },
                { key: 'approved', label: 'Approved', type: 'number' },
                { key: 'underTest', label: 'Under Test', type: 'number' },
                { key: 'expired', label: 'Expired', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block mb-1" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151" }}>{field.label}</label>
                  <input
                    type={field.type}
                    // value={(newRecord as Record<string, string | number>)[field.key]}
                    onChange={e => setNewRecord(prev => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 border outline-none"
                    style={{ fontSize: "0.8125rem", borderColor: "#d1d5db", background: "#fff" }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={addRecord} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white" style={{ background: "#059669", fontSize: "0.8125rem", fontWeight: 600 }}>
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg" style={{ background: "#e2e8f0", color: "#64748b", fontSize: "0.8125rem", fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid rgba(30,64,175,0.1)" }}>
        <div className="px-5 py-3 flex items-center gap-2" style={{ background: "linear-gradient(90deg, #059669, #0ea5e9)" }}>
          <Archive className="w-4 h-4 text-white" />
          <span className="text-white" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Stock Register</span>
          <span className="ml-auto text-green-100" style={{ fontSize: "0.75rem" }}>{filtered.length} products · Auto-saved to browser</span>
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full" style={{ fontSize: "0.8rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f9f4" }}>
                {["Product Code", "Product Name", "Approved Qty", "Under Test", "Total Qty", "Expired Qty", "Status", "Actions"].map((h, i) => (
                  <th key={i} className={`px-4 py-3 ${i <= 1 ? "text-left" : "text-right"}`}
                    style={{ color: "#166534", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid #bbf7d0" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, ri) => {
                const isEditing = editingCode === row.productCode;
                const display = isEditing ? editDraft! : row;
                const total = display.approved + display.underTest;
                const expiredPct = total > 0 ? (display.expired / total) * 100 : 0;
                const status = display.expired > 0 && expiredPct > 10 ? 'expired-high' : display.underTest > 0 ? 'has-undertest' : 'clean';

                return (
                  <tr key={row.productCode} style={{ borderBottom: "1px solid #f0fdf4", background: isEditing ? "#f0f9f4" : ri % 2 === 0 ? "#fff" : "#fafffe" }}>
                    <td className="px-4 py-3" style={{ fontFamily: "JetBrains Mono, monospace", color: "#1d4ed8", fontWeight: 600, fontSize: "0.8rem" }}>
                      {isEditing ? (
                        <input value={display.productCode} disabled
                          className="rounded px-2 py-1 w-28 border" style={{ fontSize: "0.8rem", fontFamily: "JetBrains Mono, monospace", borderColor: "#d1d5db", background: "#f1f5f9" }} />
                      ) : row.productCode}
                    </td>
                    <td className="px-4 py-3" style={{ color: "#0f172a", fontWeight: 500 }}>
                      {isEditing ? (
                        <input value={display.productName} onChange={e => setEditDraft(prev => ({ ...prev!, productName: e.target.value }))}
                          className="rounded px-2 py-1 w-48 border outline-none" style={{ fontSize: "0.8rem", borderColor: "#93c5fd" }} />
                      ) : row.productName}
                    </td>
                    {(['approved', 'underTest'] as const).map(field => (
                      <td key={field} className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input type="number" value={display[field]} onChange={e => setEditDraft(prev => ({ ...prev!, [field]: Number(e.target.value) }))}
                            className="w-24 text-right rounded px-2 py-1 border outline-none" style={{ fontSize: "0.8rem", borderColor: "#93c5fd", fontFamily: "JetBrains Mono, monospace" }} />
                        ) : (
                          <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#374151" }}>{fmt(row[field])}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right" style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#059669" }}>
                      {fmt(display.approved + display.underTest)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <input type="number" value={display.expired} onChange={e => setEditDraft(prev => ({ ...prev!, expired: Number(e.target.value) }))}
                          className="w-24 text-right rounded px-2 py-1 border outline-none" style={{ fontSize: "0.8rem", borderColor: "#fca5a5", fontFamily: "JetBrains Mono, monospace" }} />
                      ) : (
                        <span style={{ fontFamily: "JetBrains Mono, monospace", color: row.expired > 0 ? "#dc2626" : "#94a3b8", fontWeight: row.expired > 0 ? 600 : 400 }}>
                          {fmt(row.expired)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="rounded-full px-2.5 py-1" style={{
                        fontSize: "0.6875rem", fontWeight: 600,
                        background: status === 'expired-high' ? "#fee2e2" : status === 'has-undertest' ? "#fef9c3" : "#dcfce7",
                        color: status === 'expired-high' ? "#dc2626" : status === 'has-undertest' ? "#854d0e" : "#059669"
                      }}>
                        {status === 'expired-high' ? 'Exp. Alert' : status === 'has-undertest' ? 'Under Test' : 'Approved'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-1.5">
                          <button onClick={saveEdit} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white" style={{ background: "#059669", fontSize: "0.7rem", fontWeight: 600 }}>
                            <Save className="w-3 h-3" /> Save
                          </button>
                          <button onClick={cancelEdit} className="px-2 py-1.5 rounded-lg" style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.7rem" }}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(row)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all" style={{ background: "#f0f5ff", color: "#1d4ed8", fontSize: "0.7rem", fontWeight: 600 }}
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
            <div className="text-center py-10" style={{ color: "#94a3b8", fontSize: "0.875rem" }}>No products match the search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
