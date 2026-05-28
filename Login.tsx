import { useState } from "react";
import { ShieldCheck, Eye, EyeOff, Pill } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username === "admin" && password === "Admin@2024") {
        onLogin();
      } else {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0c1a3a 0%, #1e3a6e 40%, #1d4ed8 80%, #0ea5e9 100%)" }}>
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-5 bg-white"
            style={{ width: `${200 + i * 80}px`, height: `${200 + i * 80}px`, top: `${10 + i * 12}%`, left: `${5 + i * 15}%` }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          
            <img src="/logo.png" alt="Anaga Logo" className="w-35 h-20 ml-30 w-10 h-10 rounded-2xl" />
      
          <h1 className="text-white mb-1" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Anaga Software Solutions</h1>
          <p className="text-blue-200" style={{ fontSize: "0.875rem" }}>Material Resource Planning</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1d4ed8" }}>SECURE LOGIN</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-lg px-4 py-3 border outline-none transition-all"
                style={{ fontSize: "0.9rem", borderColor: "#d1d5db", background: "#f9fafb" }}
                onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
                required
              />
            </div>

            <div>
              <label className="block mb-1.5" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-lg px-4 py-3 border outline-none transition-all pr-12"
                  style={{ fontSize: "0.9rem", borderColor: "#d1d5db", background: "#f9fafb" }}
                  onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-white transition-all mt-2"
              style={{ background: loading ? "#93c5fd" : "linear-gradient(135deg, #1d4ed8, #0ea5e9)", fontWeight: 600, fontSize: "0.9375rem", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.01em" }}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 p-3 rounded-lg" style={{ background: "#f0f5ff", border: "1px solid #dbeafe" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "2px" }}>Demo Credentials</p>
            <p style={{ fontSize: "0.8rem", color: "#374151", fontFamily: "JetBrains Mono, monospace" }}>admin / Admin@2024</p>
          </div>
        </div>

        <p className="text-center mt-6 text-blue-200" style={{ fontSize: "0.75rem" }}>
          © 2026 Anaga Software Solutions · v2.4.1
        </p>
      </div>
    </div>
  );
}
