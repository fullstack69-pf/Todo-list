import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setToken } from "../lib/auth";

type Props = { initialMode?: "login" | "register" };

function AuthPage({ initialMode = "login" }: Props) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isRegister = mode === "register";
  const ACCENT = "oklch(0.55 0.19 259)";

  function validate() {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !password) return "กรุณากรอกข้อมูลให้ครบ";
    if (!emailValid) return "อีเมลไม่ถูกต้อง";
    if (password.length < 6) return "รหัสผ่านต้องยาวอย่างน้อย 6 ตัว";
    if (isRegister && password !== confirmPassword)
      return "รหัสผ่านไม่ตรงกัน";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const path = isRegister ? "/api/auth/register" : "/api/auth/login";
      const res = await axios.post(path, { email, password });
      setToken(res.data.token);
      navigate("/");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "เกิดข้อผิดพลาด")
          : "เกิดข้อผิดพลาด",
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: "login" | "register") {
    setMode(m);
    setError("");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px 48px",
    borderRadius: 999,
    border: "1.5px solid oklch(0.88 0.01 259)",
    fontSize: 15,
    outline: "none",
    color: "oklch(0.3 0.02 259)",
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        fontFamily: "Helvetica, Arial, sans-serif",
        background: "oklch(0.99 0.002 250)",
      }}
    >
      {/* ===== ฝั่งซ้าย: Welcome ===== */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          gap: 28,
        }}
        className="auth-left"
      >
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              margin: 10,
              fontSize: 45,
              fontWeight: 800,
              color: "oklch(0.25 0.02 259)",
            }}
          >
            Welcome
          </h2>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 20,
              color: "oklch(0.5 0.02 259)",
            }}
          >
            Glad to see you here
          </p>
        </div>

        {/* สมุดโน้ต */}
        <svg
          viewBox="0 0 360 400"
          width="100%"
          height="100%"
          style={{
            maxWidth: 650,
            filter: "drop-shadow(0 24px 40px oklch(0.55 0.19 259 / 0.18))",
          }}
        >
          <rect x="72" y="46" width="230" height="320" rx="10" fill="oklch(0.92 0.03 259)" />
          <rect x="56" y="34" width="230" height="320" rx="12" fill="oklch(0.55 0.19 259)" />
          <rect x="80" y="30" width="214" height="316" rx="8" fill="oklch(0.99 0.004 259)" />
          <g fill="none" stroke="oklch(0.45 0.16 259)" strokeWidth="6" strokeLinecap="round">
            {[86, 120, 154, 188, 222, 256].map((x) => (
              <line key={x} x1={x} y1="20" x2={x} y2="48" />
            ))}
          </g>
          <line x1="112" y1="70" x2="112" y2="330" stroke="oklch(0.68 0.17 25)" strokeWidth="2" />
          <g stroke="oklch(0.86 0.02 259)" strokeWidth="2.5" strokeLinecap="round">
            {[96, 128, 160, 192, 224, 256, 288].map((y, i) => (
              <line key={y} x1="122" y1={y} x2={i % 3 === 2 ? 240 : 278} y2={y} />
            ))}
          </g>
          <g transform="rotate(38 250 250)">
            <rect x="236" y="150" width="20" height="180" rx="4" fill="oklch(0.8 0.13 85)" />
            <polygon points="236,330 256,330 246,360" fill="oklch(0.75 0.06 60)" />
            <polygon points="242,348 250,348 246,360" fill="oklch(0.35 0.02 40)" />
            <rect x="236" y="140" width="20" height="14" rx="3" fill="oklch(0.7 0.1 20)" />
          </g>
        </svg>
      </div>

      {/* ===== ฝั่งขวา: ฟอร์ม ===== */}
      <div
        style={{
          flex: 1.4,
          background: ACCENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={circle(340, -120, -100, 0.25)} />
        <div style={circle(420, -180, -160, 0.18)} />

        {/* card login/register */}
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "white",
            borderRadius: 16,
            padding: 56,
            boxShadow: "0 20px 50px oklch(0.2 0.05 259 / 0.3)",
            position: "relative",
            zIndex: 1,
            margin: 20,
            transform: "scale(1.4)",
          }}
        >
          <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, color: "oklch(0.25 0.02 259)" }}>
            Hello!
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 16, color: "oklch(0.45 0.02 259)" }}>
            {isRegister ? "Sign Up to Get Started" : "Sign In to Continue"}
          </p>

          {/* Tabs */}
          <div style={{ display: "flex", background: "oklch(0.96 0.01 259)", borderRadius: 999, padding: 4, marginBottom: 24 }}>
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  flex: 1,
                  border: "none",
                  background: mode === m ? ACCENT : "transparent",
                  color: mode === m ? "white" : "oklch(0.5 0.02 259)",
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "10px 0",
                  borderRadius: 999,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {m === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <span style={iconStyle}>✉</span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ position: "relative" }}>
                <span style={iconStyle}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "oklch(0.55 0.02 259)" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {isRegister && (
                <div style={{ position: "relative" }}>
                  <span style={iconStyle}>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              )}

              {error && (
                <div style={{ color: "oklch(0.55 0.2 25)", fontSize: 13, marginTop: -6 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", boxSizing: "border-box", padding: 16, borderRadius: 999, border: "none", background: ACCENT, color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 4, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Processing..." : isRegister ? "Login" : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const iconStyle: React.CSSProperties = {
  position: "absolute",
  left: 20,
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 18,
};

function circle(size: number, bottom: number, right: number, opacity: number): React.CSSProperties {
  return {
    position: "absolute",
    bottom,
    right,
    width: size,
    height: size,
    borderRadius: "50%",
    border: `1.5px solid oklch(1 0 0 / ${opacity})`,
  };
}

export default AuthPage;