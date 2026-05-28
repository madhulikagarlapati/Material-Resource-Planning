import { useState, useMemo } from "react";
import { BarChart3, Search, TrendingDown } from "lucide-react";
import { PRODUCTS, CUSTOMER_DEMANDS, MONTHS } from "../data/mockData";

interface PivotRow {
  materialName: string;
  type: string;
  minBufferQty: number;
  avgTotalReq: number;
  minPresentStock: number;
  minMonth1StockLeft: number;
  minMonth2StockLeft: number;
  minExcessOrShort: number;
}

function computePivot(): PivotRow[] {
  const materialMap = new Map<string, {
    type: string;
    bufferQtys: number[];
    totalReqs: number[];
    presentStocks: number[];
    month1Lefts: number[];
    month2Lefts: number[];
    excessOrShorts: number[];
  }>();

  CUSTOMER_DEMANDS.forEach(demand => {
    const product = PRODUCTS.find(p => p.code === demand.productCode);
    if (!product) return;
    const totalReq = demand.monthlyRequirements.reduce((a, b) => a + b, 0);
    const cumM1 = demand.monthlyRequirements[0];
    const cumM2 = cumM1 + demand.monthlyRequirements[1];

    product.compositions.forEach(comp => {
      const bufferMult = comp.type === 'API' ? 1.05 : 1.01;
      const totalCompG = (comp.requiredQtyPerUnit * totalReq) / 1000;
      const bufferQtyG = totalCompG * bufferMult;
      const excessOrShortG = comp.materialStock - bufferQtyG;
      const month1LeftG = comp.materialStock - (comp.requiredQtyPerUnit * cumM1) / 1000;
      const month2LeftG = comp.materialStock - (comp.requiredQtyPerUnit * cumM2) / 1000;

      if (!materialMap.has(comp.materialName)) {
        materialMap.set(comp.materialName, {
          type: comp.type,
          bufferQtys: [], totalReqs: [], presentStocks: [],
          month1Lefts: [], month2Lefts: [], excessOrShorts: [],
        });
      }
      const entry = materialMap.get(comp.materialName)!;
      entry.bufferQtys.push(bufferQtyG);
      entry.totalReqs.push(totalCompG);
      entry.presentStocks.push(comp.materialStock);
      entry.month1Lefts.push(month1LeftG);
      entry.month2Lefts.push(month2LeftG);
      entry.excessOrShorts.push(excessOrShortG);
    });
  });

  return Array.from(materialMap.entries()).map(([name, d]) => ({
    materialName: name,
    type: d.type,
    minBufferQty: Math.min(...d.bufferQtys),
    avgTotalReq: d.totalReqs.reduce((a, b) => a + b, 0) / d.totalReqs.length,
    minPresentStock: Math.min(...d.presentStocks),
    minMonth1StockLeft: Math.min(...d.month1Lefts),
    minMonth2StockLeft: Math.min(...d.month2Lefts),
    minExcessOrShort: Math.min(...d.excessOrShorts),
  })).sort((a, b) => a.minExcessOrShort - b.minExcessOrShort);
}

function fmtG(g: number) {
  if (Math.abs(g) >= 1000) return `${(g / 1000).toFixed(2)} kg`;
  return `${g.toFixed(2)} g`;
}

const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  API: { bg: "#dbeafe", color: "#1d4ed8" },
  Excipient: { bg: "#f0fdf4", color: "#059669" },
  Lubricant: { bg: "#fef9c3", color: "#854d0e" },
  Binder: { bg: "#faf5ff", color: "#7c3aed" },
  Disintegrant: { bg: "#fff7ed", color: "#c2410c" },
  Coating: { bg: "#ecfeff", color: "#0e7490" },
  Glidant: { bg: "#fdf2f8", color: "#9d174d" },
};

export function PivotPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const pivotData = useMemo(() => computePivot(), []);

  const types = ["All", ...Array.from(new Set(pivotData.map(r => r.type)))];

  const filtered = pivotData.filter(r => {
    const matchSearch = r.materialName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const shortages = filtered.filter(r => r.minExcessOrShort < 0).length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "#0f172a" }}>Material Pivot Analysis</h2>
          <p style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "2px" }}>Aggregated min/avg metrics across all customer demands & products</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg px-3 py-1.5 text-white" style={{ background: "#dc2626", fontSize: "0.75rem", fontWeight: 600 }}>
            {shortages} shortage{shortages !== 1 ? 's' : ''}
          </span>
          <span className="rounded-lg px-3 py-1.5" style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 600 }}>
            {filtered.length} materials
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center" style={{ background: "#fff", border: "1px solid rgba(30,64,175,0.1)" }}>
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search material name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border outline-none transition-all"
            style={{ fontSize: "0.875rem", borderColor: "#e2e8f0", background: "#f9fafb" }}
            onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className="px-3 py-2 rounded-lg transition-all"
              style={{
                fontSize: "0.75rem", fontWeight: 600,
                background: typeFilter === t ? "#1d4ed8" : "#f1f5f9",
                color: typeFilter === t ? "#fff" : "#475569",
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid rgba(30,64,175,0.1)" }}>
        <div className="px-5 py-3 flex items-center gap-2" style={{ background: "linear-gradient(90deg, #0c1a3a, #1e3a6e)" }}>
          <BarChart3 className="w-4 h-4 text-blue-300" />
          <span className="text-white" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Pivot Summary Table</span>
          <span className="ml-2 text-blue-300" style={{ fontSize: "0.75rem" }}>Sorted by Min Excess/Short (worst first)</span>
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full" style={{ fontSize: "0.79rem", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ background: "#f0f5ff" }}>
                {[
                  "Material Name", "Type",
                  `Min Buffer Qty\n(across demands)`,
                  `Avg Total Req\n(4 months, g)`,
                  "Min Present Stock",
                  `Min ${MONTHS[0]}\nStock Left`,
                  `Min ${MONTHS[1]}\nStock Left`,
                  "Min Excess/Short"
                ].map((h, i) => (
                  <th key={i} className={`px-3 py-3 ${i <= 1 ? "text-left" : "text-right"}`}
                    style={{ color: "#475569", fontWeight: 600, fontSize: "0.7rem", whiteSpace: "pre-line", lineHeight: 1.3, borderBottom: "2px solid #dbeafe" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, ri) => {
                const isShort = row.minExcessOrShort < 0;
                const badgeStyle = TYPE_BADGE[row.type] ?? { bg: "#f1f5f9", color: "#475569" };
                return (
                  <tr key={row.materialName} style={{ borderBottom: "1px solid #f1f5f9", background: isShort ? "#fff5f5" : ri % 2 === 0 ? "#fff" : "#f9fbff" }}>
                    <td className="px-3 py-2.5" style={{ color: "#0f172a", fontWeight: 500 }}>
                      <div className="flex items-center gap-1.5">
                        {isShort && <TrendingDown className="w-3 h-3 flex-shrink-0" style={{ color: "#dc2626" }} />}
                        {row.materialName}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-full px-2 py-0.5" style={{ fontSize: "0.6875rem", fontWeight: 600, background: badgeStyle.bg, color: badgeStyle.color }}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7c3aed" }}>{fmtG(row.minBufferQty)}</td>
                    <td className="px-3 py-2.5 text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: "#374151" }}>{fmtG(row.avgTotalReq)}</td>
                    <td className="px-3 py-2.5 text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: "#1d4ed8" }}>{fmtG(row.minPresentStock)}</td>
                    <td className="px-3 py-2.5 text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: row.minMonth1StockLeft < 0 ? "#dc2626" : "#059669", fontWeight: 500 }}>{fmtG(row.minMonth1StockLeft)}</td>
                    <td className="px-3 py-2.5 text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: row.minMonth2StockLeft < 0 ? "#dc2626" : "#059669", fontWeight: 500 }}>{fmtG(row.minMonth2StockLeft)}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="rounded-lg px-2 py-1" style={{
                        fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: "0.75rem",
                        background: isShort ? "#fee2e2" : "#dcfce7",
                        color: isShort ? "#dc2626" : "#059669"
                      }}>
                        {fmtG(row.minExcessOrShort)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10" style={{ color: "#94a3b8", fontSize: "0.875rem" }}>No materials match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
