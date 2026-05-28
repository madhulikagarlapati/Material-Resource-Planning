import { useState } from "react";
import { Search, Package, FlaskConical, AlertCircle, CheckCircle, TrendingUp, Layers } from "lucide-react";
import { PRODUCTS, CUSTOMER_DEMANDS, MONTHS, type Product, type CustomerDemand, type Composition } from "../data/mockData";

interface CompositionAnalysis {
  comp: Composition;
  bufferPct: number;
  monthlyReqG: number[];
  totalInFourMonthsG: number;
  bufferQtyG: number;
  excessOrShortG: number;
}

interface ProductAnalysis {
  product: Product;
  demand: CustomerDemand;
  requiredQty: number;
  bufferQty: number;
  monthlyReqs: number[];
  monthlyTotals: number[];
  monthlyStockLeft: number[];
  stockRequirement: number;
  compositions: CompositionAnalysis[];
}

function fmt(n: number, decimals = 0) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function fmtG(grams: number) {
  if (Math.abs(grams) >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${grams.toFixed(2)} g`;
}

const FORM_COLORS: Record<string, string> = {
  Tab: '#1d4ed8', Pow: '#7c3aed', Caps: '#059669', Grans: '#d97706', Pells: '#dc2626'
};
const PACK_COLORS: Record<string, string> = {
  Blister: '#0ea5e9', Securitanian: '#7c3aed', Container: '#059669', Sachet: '#d97706'
};

export function MainPage() {
  const [productCode, setProductCode] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [result, setResult] = useState<ProductAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleGetDetails = () => {
    setError("");
    setResult(null);
    const pc = productCode.trim().toUpperCase();
    const cc = customerCode.trim().toUpperCase();

    const product = PRODUCTS.find(p => p.code === pc);
    if (!product) { setError(`Product code "${pc}" not found. Try: PCT-500, AMX-250, IBU-400, MET-500, AZI-500, ORS-POW`); return; }

    const demand = CUSTOMER_DEMANDS.find(d => d.productCode === pc && d.customerId === cc);
    if (!demand) { setError(`No demand found for customer "${cc}" and product "${pc}". Try: CUST001–CUST004`); return; }

    const reqs = demand.monthlyRequirements;
    const requiredQty = reqs.reduce((a, b) => a + b, 0);
    const bufferQty = Math.ceil(requiredQty * 1.05);
    const monthlyTotals = reqs.map((_, i) => reqs.slice(0, i + 1).reduce((a, b) => a + b, 0));
    const monthlyStockLeft = monthlyTotals.map(cum => product.presentStock - cum);
    const stockRequirement = Math.max(0, bufferQty - product.presentStock);

    const compAnalyses: CompositionAnalysis[] = product.compositions.map(comp => {
      const bufferPct = comp.type === 'API' ? 5 : 1;
      const monthlyReqG = reqs.map(m => (comp.requiredQtyPerUnit * m) / 1000);
      const totalInFourMonthsG = (comp.requiredQtyPerUnit * requiredQty) / 1000;
      const bufferQtyG = totalInFourMonthsG * (1 + bufferPct / 100);
      const excessOrShortG = comp.materialStock - bufferQtyG;
      return { comp, bufferPct, monthlyReqG, totalInFourMonthsG, bufferQtyG, excessOrShortG };
    });

    setResult({ product, demand, requiredQty, bufferQty, monthlyReqs: [...reqs], monthlyTotals, monthlyStockLeft, stockRequirement, compositions: compAnalyses });
  };

  return (
    <div className="p-6 space-y-5">
      {/* Page Title */}
      <div>
        <h2 className="text-foreground" style={{ fontWeight: 700, fontSize: "1.125rem" }}>Product Demand Analysis</h2>
        <p style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "2px" }}>Enter product and customer codes to retrieve demand, stock, and composition details</p>
      </div>

      {/* Input Card */}
      <div className="rounded-xl p-5 shadow-sm" style={{ background: "#fff", border: "1px solid rgba(30,64,175,0.1)" }}>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Product Code</label>
            <input
              value={productCode}
              onChange={e => setProductCode(e.target.value)}
              placeholder="e.g. PCT-500"
              className="w-full rounded-lg px-4 py-2.5 border outline-none transition-all"
              style={{ fontSize: "0.875rem", borderColor: "#d1d5db", background: "#f9fafb", fontFamily: "JetBrains Mono, monospace" }}
              onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
              onKeyDown={e => e.key === 'Enter' && handleGetDetails()}
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="block mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Customer Code</label>
            <input
              value={customerCode}
              onChange={e => setCustomerCode(e.target.value)}
              placeholder="e.g. CUST001"
              className="w-full rounded-lg px-4 py-2.5 border outline-none transition-all"
              style={{ fontSize: "0.875rem", borderColor: "#d1d5db", background: "#f9fafb", fontFamily: "JetBrains Mono, monospace" }}
              onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
              onKeyDown={e => e.key === 'Enter' && handleGetDetails()}
            />
          </div>
          <button
            onClick={handleGetDetails}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white transition-all"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)", fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            <Search className="w-4 h-4" /> Get Details
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.8125rem" }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <>
          {/* ─── Section 1: Main Composition Info ─── */}
          <div className="rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid rgba(30,64,175,0.1)" }}>
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: "linear-gradient(90deg, #1d4ed8, #0ea5e9)" }}>
              <Package className="w-4 h-4 text-white" />
              <span className="text-white" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Main Composition Info — {result.product.name}</span>
              <span className="ml-auto text-blue-200" style={{ fontSize: "0.75rem", fontFamily: "JetBrains Mono, monospace" }}>{result.product.code}</span>
            </div>
            <div className="p-5 bg-white">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Form", value: result.product.form, color: FORM_COLORS[result.product.form] },
                  { label: "Pack Type", value: result.product.packType, color: PACK_COLORS[result.product.packType] },
                  { label: "Pack Size (units/pack)", value: `${result.product.packSize} units`, color: "#0f172a" },
                  { label: "Batch Size (packs/batch)", value: `${fmt(result.product.batchSize)} packs`, color: "#0f172a" },
                ].map(item => (
                  <div key={item.label} className="rounded-lg p-4" style={{ background: "#f8faff", border: "1px solid rgba(30,64,175,0.09)" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, marginBottom: "4px" }}>{item.label}</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Section 2: Demand & Stock Analysis ─── */}
          <div className="rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid rgba(30,64,175,0.1)" }}>
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: "linear-gradient(90deg, #1e40af, #1d4ed8)" }}>
              <TrendingUp className="w-4 h-4 text-white" />
              <span className="text-white" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Demand & Stock Analysis — {result.demand.customerName}</span>
            </div>
            <div className="bg-white p-5">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
                {[
                  { label: "Required Quantity", value: fmt(result.requiredQty), unit: "units", color: "#1d4ed8" },
                  { label: "Buffer Quantity (5%)", value: fmt(result.bufferQty), unit: "units", color: "#7c3aed" },
                  { label: "Present Stock", value: fmt(result.product.presentStock), unit: "units", color: "#059669" },
                  { label: "Stock Requirement", value: fmt(result.stockRequirement), unit: "units", color: result.stockRequirement > 0 ? "#dc2626" : "#059669" },
                ].map(kpi => (
                  <div key={kpi.label} className="rounded-xl p-4 text-center" style={{ background: "linear-gradient(135deg, #f0f5ff, #e8eeff)", border: "1px solid rgba(29,78,216,0.12)" }}>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>{kpi.label}</div>
                    <div style={{ fontSize: "1.375rem", fontWeight: 700, color: kpi.color, fontFamily: "JetBrains Mono, monospace", lineHeight: 1.1 }}>{kpi.value}</div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>{kpi.unit}</div>
                  </div>
                ))}
              </div>

              {/* Monthly table */}
              <div className="overflow-x-auto">
                <table className="w-full" style={{ fontSize: "0.8125rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f0f5ff" }}>
                      <th className="text-left px-4 py-2.5 rounded-tl-lg" style={{ color: "#475569", fontWeight: 600, fontSize: "0.75rem" }}>Metric</th>
                      {MONTHS.map(m => <th key={m} className="text-right px-4 py-2.5" style={{ color: "#475569", fontWeight: 600, fontSize: "0.75rem" }}>{m}</th>)}
                      <th className="text-right px-4 py-2.5 rounded-tr-lg" style={{ color: "#475569", fontWeight: 600, fontSize: "0.75rem" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Monthly Requirement", values: result.monthlyReqs, total: result.requiredQty, highlight: false },
                      { label: "Monthly Cumulative Total", values: result.monthlyTotals, total: result.requiredQty, highlight: false },
                      { label: "Month-wise Stock Left", values: result.monthlyStockLeft, total: null, highlight: true },
                    ].map((row, ri) => (
                      <tr key={row.label} style={{ borderBottom: "1px solid #f1f5f9", background: ri % 2 === 1 ? "#fafbff" : "#fff" }}>
                        <td className="px-4 py-2.5" style={{ color: "#374151", fontWeight: 500 }}>{row.label}</td>
                        {row.values.map((v, i) => (
                          <td key={i} className="text-right px-4 py-2.5" style={{
                            fontFamily: "JetBrains Mono, monospace",
                            color: row.highlight ? (v < 0 ? "#dc2626" : v < 5000 ? "#d97706" : "#059669") : "#1e3a8a",
                            fontWeight: row.highlight ? 600 : 400
                          }}>{fmt(v)}</td>
                        ))}
                        <td className="text-right px-4 py-2.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#374151", fontWeight: 600 }}>
                          {row.total !== null ? fmt(row.total) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ─── Section 3: Sub-Composition Table ─── */}
          <div className="rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid rgba(30,64,175,0.1)" }}>
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: "linear-gradient(90deg, #0c1a3a, #1e3a6e)" }}>
              <FlaskConical className="w-4 h-4 text-blue-300" />
              <span className="text-white" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Sub-Composition Analysis</span>
              <span className="ml-2 rounded-full px-2 py-0.5 text-blue-200" style={{ background: "rgba(255,255,255,0.12)", fontSize: "0.7rem" }}>
                API buffer = 5% · Excipients/Others = 1%
              </span>
            </div>
            <div className="bg-white overflow-x-auto">
              <table className="w-full" style={{ fontSize: "0.75rem", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr style={{ background: "#0f1c3a" }}>
                    {["Material Name", "Type", "Req Qty/Unit", "Buffer %", ...MONTHS, "Total SKU", "Total 4M (g/kg)", "Buffer Qty", "Excess / Short"].map((h, i) => (
                      <th key={i} className={`px-3 py-2.5 ${i === 0 ? "text-left" : "text-right"}`}
                        style={{ color: "#93c5fd", fontWeight: 600, fontSize: "0.6875rem", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.compositions.map((ca, ri) => {
                    const isShort = ca.excessOrShortG < 0;
                    const rowBg = ri % 2 === 0 ? "#ffffff" : "#f9fbff";
                    return (
                      <tr key={ca.comp.id} style={{ borderBottom: "1px solid #e9eef8", background: rowBg }}>
                        <td className="px-3 py-2.5" style={{ color: "#0f172a", fontWeight: 500, whiteSpace: "nowrap" }}>
                          <div className="flex items-center gap-1.5">
                            {ca.comp.type === 'API' && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#1d4ed8" }} />}
                            {ca.comp.materialName}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="rounded-full px-2 py-0.5" style={{
                            fontSize: "0.6875rem", fontWeight: 600,
                            background: ca.comp.type === 'API' ? "#dbeafe" : "#f0fdf4",
                            color: ca.comp.type === 'API' ? "#1d4ed8" : "#059669"
                          }}>{ca.comp.type}</span>
                        </td>
                        <td className="text-right px-3 py-2.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#374151" }}>
                          {ca.comp.requiredQtyPerUnit} {ca.comp.unit}
                        </td>
                        <td className="text-right px-3 py-2.5" style={{ color: "#7c3aed", fontWeight: 600 }}>{ca.bufferPct}%</td>
                        {ca.monthlyReqG.map((g, i) => (
                          <td key={i} className="text-right px-3 py-2.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#374151" }}>{fmtG(g)}</td>
                        ))}
                        <td className="text-right px-3 py-2.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#374151" }}>
                          {ca.comp.requiredQtyPerUnit} {ca.comp.unit}
                        </td>
                        <td className="text-right px-3 py-2.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#1d4ed8", fontWeight: 500 }}>
                          {fmtG(ca.totalInFourMonthsG)}
                        </td>
                        <td className="text-right px-3 py-2.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7c3aed", fontWeight: 500 }}>
                          {fmtG(ca.bufferQtyG)}
                        </td>
                        <td className="text-right px-3 py-2.5" style={{ fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: isShort ? "#dc2626" : "#059669" }}>
                          <div className="flex items-center justify-end gap-1">
                            {isShort ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {fmtG(ca.excessOrShortG)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 flex items-center gap-4 flex-wrap" style={{ background: "#f8faff", borderTop: "1px solid #e9eef8" }}>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: "#059669" }} />
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Surplus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: "#dc2626" }} />
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Shortage (requires procurement)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#1d4ed8" }} />
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>API = Active Pharmaceutical Ingredient</span>
              </div>
            </div>
          </div>
        </>
      )}

      {!result && !error && (
        <div className="rounded-xl p-10 text-center shadow-sm" style={{ background: "#fff", border: "1px dashed rgba(30,64,175,0.2)" }}>
          <Layers className="w-10 h-10 mx-auto mb-3" style={{ color: "#cbd5e1" }} />
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 500 }}>Enter a product code and customer code, then click <strong>Get Details</strong> to view the full analysis.</p>
          <p className="mt-2" style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Sample: PCT-500 + CUST001 · AMX-250 + CUST001 · IBU-400 + CUST003</p>
        </div>
      )}
    </div>
  );
}
