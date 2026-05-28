import { useState } from "react";
import { CalendarDays, Search, Edit3, Save, X } from "lucide-react";
import { DEFAULT_PLAN_RECORDS, MONTHS, type PlanRecord } from "../data/mockData";

function fmt(n: number) { return n.toLocaleString('en-IN'); }

export function PlanPage() {
  const [records, setRecords] = useState<PlanRecord[]>(DEFAULT_PLAN_RECORDS);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<PlanRecord | null>(null);

  const filtered = records.filter(r =>
    r.productName.toLowerCase().includes(search.toLowerCase()) ||
    r.productCode.toLowerCase().includes(search.toLowerCase()) ||
    r.itemNo.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (r: PlanRecord) => { setEditingId(r.itemNo); setEditDraft({ ...r }); };
  const cancelEdit = () => { setEditingId(null); setEditDraft(null); };
  const saveEdit = () => {
    if (!editDraft) return;
    setRecords(prev => prev.map(r => r.itemNo === editDraft.itemNo ? editDraft : r));
    setEditingId(null); setEditDraft(null);
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "#0f172a" }}>Production Plan</h2>
        <p style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "2px" }}>Month-wise RM & PM planning with batch tracking for {MONTHS[0]} – {MONTHS[3]}</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 shadow-sm" style={{ background: "#fff", border: "1px solid rgba(30,64,175,0.1)" }}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search product name, code, or item no..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border outline-none transition-all"
              style={{ fontSize: "0.875rem", borderColor: "#e2e8f0", background: "#f9fafb" }}
              onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <span className="rounded-lg px-3 py-2" style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 600 }}>
            {filtered.length} / {records.length} items
          </span>
        </div>
      </div>

      {/* RM Table */}
      <PlanTable
        title="Raw Material (RM) Plan"
        subtitle="Monthly RM quantities in kg"
        monthType="rm"
        filtered={filtered}
        editingId={editingId}
        editDraft={editDraft}
        setEditDraft={setEditDraft}
        onEdit={startEdit}
        onSave={saveEdit}
        onCancel={cancelEdit}
      />

      {/* PM Table */}
      <PlanTable
        title="Packaging Material (PM) Plan"
        subtitle="Monthly PM quantities in units"
        monthType="pm"
        filtered={filtered}
        editingId={editingId}
        editDraft={editDraft}
        setEditDraft={setEditDraft}
        onEdit={startEdit}
        onSave={saveEdit}
        onCancel={cancelEdit}
      />
    </div>
  );
}

interface PlanTableProps {
  title: string;
  subtitle: string;
  monthType: 'rm' | 'pm';
  filtered: PlanRecord[];
  editingId: string | null;
  editDraft: PlanRecord | null;
  setEditDraft: (r: PlanRecord | null) => void;
  onEdit: (r: PlanRecord) => void;
  onSave: () => void;
  onCancel: () => void;
}

function PlanTable({ title, subtitle, monthType, filtered, editingId, editDraft, setEditDraft, onEdit, onSave, onCancel }: PlanTableProps) {
  const monthKey = monthType === 'rm' ? 'rmMonths' : 'pmMonths';
  const lastKey = monthType === 'rm' ? 'lastBatchNumRM' : 'lastBatchNumPM';
  const unit = monthType === 'rm' ? 'kg' : 'units';
  const headerGrad = monthType === 'rm' ? "linear-gradient(90deg, #1d4ed8, #0ea5e9)" : "linear-gradient(90deg, #7c3aed, #0ea5e9)";

  return (
    <div className="rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid rgba(30,64,175,0.1)" }}>
      <div className="px-5 py-3 flex items-center gap-2" style={{ background: headerGrad }}>
        <CalendarDays className="w-4 h-4 text-white" />
        <div>
          <span className="text-white" style={{ fontWeight: 600, fontSize: "0.875rem" }}>{title}</span>
          <span className="ml-3 text-blue-200" style={{ fontSize: "0.75rem" }}>{subtitle}</span>
        </div>
      </div>
      <div className="overflow-x-auto bg-white">
        <table className="w-full" style={{ fontSize: "0.79rem", borderCollapse: "collapse", minWidth: "900px" }}>
          <thead>
            <tr style={{ background: "#f0f5ff" }}>
              {["Item No", "Product Name", ...MONTHS.map(m => `${m}\n(${unit})`), "Batch Size", `Last Batch No.\n(${monthType.toUpperCase()})`, "Plan Upto", "Actions"].map((h, i) => (
                <th key={i} className={`px-3 py-2.5 ${[0, 1, -1].includes(i) || i === 7 ? "text-left" : "text-right"}`}
                  style={{ color: "#475569", fontWeight: 600, fontSize: "0.6875rem", whiteSpace: "pre-line", lineHeight: 1.3, borderBottom: "2px solid #dbeafe" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, ri) => {
              const isEditing = editingId === row.itemNo && editDraft !== null;
              const displayRow = isEditing ? editDraft! : row;
              const months = displayRow[monthKey];

              return (
                <tr key={row.itemNo} style={{ borderBottom: "1px solid #f1f5f9", background: isEditing ? "#f0f5ff" : ri % 2 === 0 ? "#fff" : "#fafbff" }}>
                  <td className="px-3 py-2.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#1d4ed8", fontWeight: 600, fontSize: "0.75rem" }}>{row.itemNo}</td>
                  <td className="px-3 py-2.5" style={{ color: "#0f172a", fontWeight: 500, whiteSpace: "nowrap" }}>
                    <div>{row.productName}</div>
                    <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontFamily: "JetBrains Mono, monospace" }}>{row.productCode}</div>
                  </td>
                  {months.map((val, mi) => (
                    <td key={mi} className="px-3 py-2.5 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={months[mi]}
                          onChange={e => {
                            const updated = [...months] as [number, number, number, number];
                            updated[mi] = Number(e.target.value);
                            setEditDraft({ ...editDraft!, [monthKey]: updated });
                          }}
                          className="w-24 text-right rounded px-2 py-1 border outline-none"
                          style={{ fontSize: "0.75rem", borderColor: "#93c5fd", fontFamily: "JetBrains Mono, monospace" }}
                        />
                      ) : (
                        <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#374151" }}>{fmt(val)}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7c3aed" }}>{fmt(displayRow.batchSize)}</td>
                  <td className="px-3 py-2.5" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: "#475569" }}>
                    {isEditing ? (
                      <input
                        value={displayRow[lastKey]}
                        onChange={e => setEditDraft({ ...editDraft!, [lastKey]: e.target.value })}
                        className="rounded px-2 py-1 border outline-none w-40"
                        style={{ fontSize: "0.7rem", borderColor: "#93c5fd", fontFamily: "JetBrains Mono, monospace" }}
                      />
                    ) : displayRow[lastKey]}
                  </td>
                  <td className="px-3 py-2.5" style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
                    {isEditing ? (
                      <input
                        value={displayRow.planUpto}
                        onChange={e => setEditDraft({ ...editDraft!, planUpto: e.target.value })}
                        className="rounded px-2 py-1 border outline-none w-24"
                        style={{ fontSize: "0.75rem", borderColor: "#93c5fd" }}
                      />
                    ) : displayRow.planUpto}
                  </td>
                  <td className="px-3 py-2.5">
                    {isEditing ? (
                      <div className="flex gap-1.5">
                        <button onClick={onSave} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white" style={{ background: "#059669", fontSize: "0.7rem", fontWeight: 600 }}>
                          <Save className="w-3 h-3" /> Save
                        </button>
                        <button onClick={onCancel} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg" style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.7rem", fontWeight: 600 }}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => onEdit(row)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all" style={{ background: "#f0f5ff", color: "#1d4ed8", fontSize: "0.7rem", fontWeight: 600 }}
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
      </div>
    </div>
  );
}
