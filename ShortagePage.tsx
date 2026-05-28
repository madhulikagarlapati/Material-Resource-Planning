import { useState, useMemo } from "react";
import { AlertTriangle, Search, Filter, TrendingDown } from "lucide-react";
import { PRODUCTS, CUSTOMER_DEMANDS, MONTHS, type FormType, type PackType } from "../data/mockData";

interface ShortageRow {
  productCode: string;
  productName: string;
  form: FormType;
  packType: PackType;
  customerName: string;
  customerId: string;
  totalRequired: number;
  bufferQty: number;
  presentStock: number;
  stockRequirement: number;
  monthlyReqs: [number, number, number, number];
  severity: 'critical' | 'warning' | 'ok';
}

function computeShortages(): ShortageRow[] {
  const rows: ShortageRow[] = [];
  CUSTOMER_DEMANDS.forEach(demand => {
    const product = PRODUCTS.find(p => p.code === demand.productCode);
    if (!product) return;
    const totalRequired = demand.monthlyRequirements.reduce((a, b) => a + b, 0);
    const bufferQty = Math.ceil(totalRequired * 1.05);
    const stockRequirement = Math.max(0, bufferQty - product.presentStock);
    if (stockRequirement === 0) return; // no shortage

    const coverage = product.presentStock / bufferQty;
    const severity: ShortageRow['severity'] = coverage < 0.5 ? 'critical' : coverage < 0.85 ? 'warning' : 'ok';

    rows.push({
      productCode: product.code,
      productName: product.name,
      form: product.form,
      packType: product.packType,
      customerName: demand.customerName,
      customerId: demand.customerId,
      totalRequired,
      bufferQty,
      presentStock: product.presentStock,
      stockRequirement,
      monthlyReqs: demand.monthlyRequirements,
      severity,
    });
  });
  return rows.sort((a, b) => {
    const sev = { critical: 0, warning: 1, ok: 2 };
    return sev[a.severity] - sev[b.severity] || b.stockRequirement - a.stockRequirement;
  });
}

function fmt(n: number) { return n.toLocaleString('en-IN'); }

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', bg: '#fee2e2', color: '#dc2626', badgeBg: '#dc2626' },
  warning: { label: 'Warning', bg: '#fff7ed', color: '#c2410c', badgeBg: '#f97316' },
  ok: { label: 'Monitor', bg: '#fefce8', color: '#854d0e', badgeBg: '#eab308' },
};

export function ShortagePage() {
  const [search, setSearch] = useState("");
  const [formFilter, setFormFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const shortages = useMemo(() => computeShortages(), []);

  const forms = ["All", ...Array.from(new Set(shortages.map(r => r.form)))];
  const severities = ["All", "Critical", "Warning", "Monitor"];

  const filtered = shortages.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.productName.toLowerCase().includes(q) ||
      r.productCode.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerId.toLowerCase().includes(q);
    const matchForm = formFilter === "All" || r.form === formFilter;
    const matchSev = severityFilter === "All" || SEVERITY_CONFIG[r.severity].label === severityFilter;
    return matchSearch && matchForm && matchSev;
  });

  const counts = { critical: shortages.filter(r => r.severity === 'critical').length, warning: shortages.filter(r => r.severity === 'warning').length };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "#0f172a" }}>Shortage Analysis</h2>
          <p style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "2px" }}>Products where present stock is insufficient to meet buffered demand</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl px-4 py-2.5 text-center" style={{ background: "#fee2e2", border: "1px solid #fecaca" }}>
            <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#dc2626" }}>{counts.critical}</div>
            <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#dc2626" }}>Critical</div>
          </div>
          <div className="rounded-xl px-4 py-2.5 text-center" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
            <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#c2410c" }}>{counts.warning}</div>
            <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#c2410c" }}>Warning</div>
          </div>
          <div className="rounded-xl px-4 py-2.5 text-center" style={{ background: "#dbeafe", border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1d4ed8" }}>{shortages.length}</div>
            <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#1d4ed8" }}>Total</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 shadow-sm" style={{ background: "#fff", border: "1px solid rgba(30,64,175,0.1)" }}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search product, code, or customer..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border outline-none transition-all"
              style={{ fontSize: "0.875rem", borderColor: "#e2e8f0", background: "#f9fafb" }}
              onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4" style={{ color: "#94a3b8" }} />
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>Form:</span>
            {forms.map(f => (
              <button key={f} onClick={() => setFormFilter(f)}
                className="px-2.5 py-1.5 rounded-lg transition-all"
                style={{ fontSize: "0.75rem", fontWeight: 600, background: formFilter === f ? "#1d4ed8" : "#f1f5f9", color: formFilter === f ? "#fff" : "#475569" }}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>Severity:</span>
            {severities.map(s => (
              <button key={s} onClick={() => setSeverityFilter(s)}
                className="px-2.5 py-1.5 rounded-lg transition-all"
                style={{ fontSize: "0.75rem", fontWeight: 600, background: severityFilter === s ? "#1d4ed8" : "#f1f5f9", color: severityFilter === s ? "#fff" : "#475569" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid rgba(30,64,175,0.1)" }}>
        <div className="px-5 py-3 flex items-center gap-2" style={{ background: "linear-gradient(90deg, #7f1d1d, #dc2626)" }}>
          <AlertTriangle className="w-4 h-4 text-red-200" />
          <span className="text-white" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Shortage Report</span>
          <span className="ml-auto text-red-200" style={{ fontSize: "0.75rem" }}>{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full" style={{ fontSize: "0.79rem", borderCollapse: "collapse", minWidth: "980px" }}>
            <thead>
              <tr style={{ background: "#fff5f5" }}>
                {["Severity", "Product Code", "Product Name", "Form", "Pack Type", "Customer", ...MONTHS, "Total Req", "Buffer Qty", "Present Stock", "Stock Short"].map((h, i) => (
                  <th key={i} className={`px-3 py-2.5 ${i <= 5 ? "text-left" : "text-right"}`}
                    style={{ color: "#7f1d1d", fontWeight: 600, fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid #fecaca" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, ri) => {
                const sev = SEVERITY_CONFIG[row.severity];
                return (
                  <tr key={`${row.productCode}-${row.customerId}`}
                    style={{ borderBottom: "1px solid #fff1f1", background: ri % 2 === 0 ? sev.bg + "50" : "#fff" }}>
                    <td className="px-3 py-2.5">
                      <span className="rounded-full px-2 py-0.5 text-white" style={{ fontSize: "0.6875rem", fontWeight: 700, background: sev.badgeBg }}>
                        {sev.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#1d4ed8", fontWeight: 600 }}>{row.productCode}</td>
                    <td className="px-3 py-2.5" style={{ color: "#0f172a", fontWeight: 500, whiteSpace: "nowrap" }}>{row.productName}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded px-2 py-0.5" style={{ fontSize: "0.6875rem", fontWeight: 600, background: "#dbeafe", color: "#1d4ed8" }}>{row.form}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="rounded px-2 py-0.5" style={{ fontSize: "0.6875rem", fontWeight: 600, background: "#f0fdf4", color: "#059669" }}>{row.packType}</span>
                    </td>
                    <td className="px-3 py-2.5" style={{ color: "#374151", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 500 }}>{row.customerName}</div>
                      <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontFamily: "JetBrains Mono, monospace" }}>{row.customerId}</div>
                    </td>
                    {row.monthlyReqs.map((m, i) => (
                      <td key={i} className="px-3 py-2.5 text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: "#374151" }}>{fmt(m)}</td>
                    ))}
                    <td className="px-3 py-2.5 text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: "#374151", fontWeight: 500 }}>{fmt(row.totalRequired)}</td>
                    <td className="px-3 py-2.5 text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7c3aed" }}>{fmt(row.bufferQty)}</td>
                    <td className="px-3 py-2.5 text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: "#059669" }}>{fmt(row.presentStock)}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="rounded-lg px-2 py-1" style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: "0.75rem", background: "#fee2e2", color: "#dc2626" }}>
                        -{fmt(row.stockRequirement)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <TrendingDown className="w-8 h-8 mx-auto mb-2" style={{ color: "#d1d5db" }} />
              <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>No shortage records match the filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
