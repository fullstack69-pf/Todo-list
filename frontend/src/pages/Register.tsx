import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../lib/auth";

function Register() {
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
      const res = await axios.post("/api/auth/register", { email, password }); // 👈 register
      setToken(res.data.token); // 👈 สมัครเสร็จได้ token เลย ไม่ต้อง login ซ้ำ
      navigate("/");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "สมัครสมาชิกไม่สำเร็จ")
          : "เกิดข้อผิดพลาด",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>สมัครสมาชิก</h1>
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
            placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6} // 👈 กันส่งรหัสสั้นไป backend
          />
          <button type="submit" disabled={loading}>
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </form>
        <p>
          มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
        </p>
      </main>
    </div>
  );
}

export default Register;