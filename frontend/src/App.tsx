import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { isLoggedIn } from "./lib/auth";
import Todo from "./pages/Todo";
import AuthPage from "./pages/AuthPage";


//ยังไม่ล็อกอินให้เด้งไปหน้า login
function ProtectedRoute({ children }: { children: ReactNode }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage initialMode="login" />} />
      <Route path="/register" element={<AuthPage initialMode="register" />} />
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