import { useState } from "react";
import {
  LayoutDashboard, BarChart3, AlertTriangle, CalendarDays,
  Archive, ShoppingCart, Pill, LogOut, ChevronRight, Menu,  Bell, User
} from "lucide-react";

export type PageName = 'main' | 'pivot' | 'shortage' | 'plan' | 'stock' | 'po';

interface NavItem {
  id: PageName;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'main', label: 'Main', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'pivot', label: 'Pivot', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'shortage', label: 'Shortage', icon: <AlertTriangle className="w-4 h-4" />, badge: 4 },
  { id: 'plan', label: 'Plan', icon: <CalendarDays className="w-4 h-4" /> },
  { id: 'stock', label: 'Stock', icon: <Archive className="w-4 h-4" /> },
  { id: 'po', label: 'Purchase Order', icon: <ShoppingCart className="w-4 h-4" /> },
];

interface LayoutProps {
  activePage: PageName;
  onPageChange: (page: PageName) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function Layout({ activePage, onPageChange, onLogout, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeLabel = NAV_ITEMS.find(n => n.id === activePage)?.label ?? 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#eef2fb" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300"
        style={{
          width: sidebarOpen ? "240px" : "64px",
          background: "linear-gradient(180deg, #0c1a3a 0%, #0f2354 60%, #0d2b6b 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)", minHeight: "64px" }}>
          <img src="/logo.png" alt="Anaga Logo" className="w-15 h-10 rounded-xl" />
          <br></br>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-white truncate" style={{ fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.01em" }}>Anaga Software Solutions</div>
              <div style={{ color: "#64748b", fontSize: "0.6875rem", fontWeight: 500 }}>Material Resource Planning</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 space-y-0.5">
            {NAV_ITEMS.map(item => {
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className="w-full flex items-center gap-3 rounded-xl transition-all duration-150 relative group"
                  style={{
                    padding: sidebarOpen ? "10px 12px" : "10px",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    background: active ? "linear-gradient(135deg, rgba(29,78,216,0.85), rgba(14,165,233,0.6))" : "transparent",
                    color: active ? "#ffffff" : "#94a3b8",
                    fontWeight: active ? 600 : 400,
                    fontSize: "0.875rem",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span className="flex-shrink-0" style={{ color: active ? "#93c5fd" : "#64748b" }}>{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full px-1.5 py-0.5 text-white" style={{ fontSize: "0.6875rem", fontWeight: 700, background: "#dc2626", lineHeight: 1 }}>
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />}
                    </>
                  )}
                  {/* Tooltip when collapsed */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 rounded-md text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                      style={{ background: "#1e293b", fontSize: "0.75rem", fontWeight: 500 }}>
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl transition-all duration-150"
            style={{ padding: sidebarOpen ? "10px 12px" : "10px", justifyContent: sidebarOpen ? "flex-start" : "center", color: "#94a3b8", fontSize: "0.875rem" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.15)"; (e.currentTarget as HTMLElement).style.color = "#fca5a5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 flex-shrink-0" style={{
          height: "64px",
          background: "linear-gradient(90deg, #1d4ed8 0%, #1e40af 40%, #0ea5e9 100%)",
          boxShadow: "0 2px 16px rgba(14,165,233,0.25)"
        }}>
          <button onClick={() => setSidebarOpen(s => !s)}
            className="text-white hover:text-blue-200 transition-colors">
            {sidebarOpen ? <Menu className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 flex-1">
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem" }}>Anaga Software Solutions</span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)" }} />
            <span className="text-white" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{activeLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative text-white hover:text-blue-200 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: "#dc2626", fontSize: "0.5625rem", fontWeight: 700 }}>4</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.25)" }}>
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-white" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto" style={{ background: "#eef2fb" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
