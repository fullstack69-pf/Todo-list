import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../lib/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      setToken(res.data.token);
      navigate("/");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "เข้าสู่ระบบไม่สำเร็จ")
          : "เกิดข้อผิดพลาด",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>เข้าสู่ระบบ</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: "crimson" }}>{error}</p>}
          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
        <p>
          ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
        </p>
      </main>
    </div>
  );
}

export default Login;