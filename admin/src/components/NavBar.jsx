// src/components/NavBar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Ẩn Navbar trên trang đăng nhập
  if (location.pathname === "/signin") {
    return null;
  }

  const handleSignOut = () => {
    signOut();
    navigate("/signin");
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <h2>Hương Việt Tinh</h2>
      </div>
      <div className="navbar-links">
        <button onClick={() => navigate("/products")}>Quản lý sản phẩm</button>
        <button onClick={() => navigate("/orders")}>Quản lý đơn hàng</button>
      </div>
      <div className="navbar-user">
        <span>Xin chào, {user?.username || "Admin"}</span>
        <button onClick={handleSignOut}>Đăng xuất</button>
      </div>
    </header>
  );
};

export default NavBar;