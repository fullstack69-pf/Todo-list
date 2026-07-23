import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { isLoggedIn } from "./lib/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Todo from "./pages/Todo";


//ยังไม่ล็อกอินให้เด้งไปหน้า login
function ProtectedRoute({ children }: { children: ReactNode }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Todo />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;