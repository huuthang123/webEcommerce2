import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const tempUserId = localStorage.getItem("tempUserId");
    if (token) {
      console.log('Token từ localStorage:', token);
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("User data from /me:", response.data);
          setUser({ ...response.data, _id: response.data.id, token });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Lỗi khi lấy thông tin user:", error.response?.data || error.message);
          if (error.response?.status === 401) {
            console.log('Token không hợp lệ, chuyển về guest mode');
            localStorage.removeItem("token");
            const guestId = tempUserId || `guest-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("tempUserId", guestId);
            setUser({ _id: guestId, isGuest: true }); // Thêm cờ isGuest để dễ kiểm tra
            navigate("/sign-in");
          }
          setLoading(false);
        });
    } else if (tempUserId) {
      setUser({ _id: tempUserId, isGuest: true });
      setLoading(false);
    } else {
      console.log("Không có token hoặc tempUserId, tạo guest user");
      const guestId = `guest-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("tempUserId", guestId);
      setUser({ _id: guestId, isGuest: true });
      setLoading(false);
    }
  }, [navigate]);

  const login = async (email, password) => {
    try {
      if (!email || !password) throw new Error("Vui lòng nhập email và mật khẩu.");
      console.log("Đang gửi request login:", { email });
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      console.log("Response từ login:", response.data);
      const { token, user: userData } = response.data;
      if (!token || typeof token !== 'string' || !userData) {
        throw new Error("Không nhận được token hoặc dữ liệu user từ server");
      }
      localStorage.setItem("token", token);
      localStorage.removeItem("tempUserId");
      setUser({ ...userData, _id: userData.id, token, isGuest: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Email hoặc mật khẩu không đúng";
      console.error("Lỗi login:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (username, email, phone, password) => {
    try {
      if (!username || !email || !phone || !password) throw new Error("Vui lòng nhập đầy đủ thông tin.");
      console.log("Đang gửi request register:", { username, email, phone });
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        email,
        phone,
        password,
      });
      console.log("Response từ register:", response.data);
      const { token, user: userData } = response.data;
      if (!token || typeof token !== 'string' || !userData) {
        throw new Error("Không nhận được token hoặc dữ liệu user từ server");
      }
      localStorage.setItem("token", token);
      localStorage.removeItem("tempUserId");
      setUser({ ...userData, _id: userData.id, token, isGuest: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng ký thất bại";
      console.error("Lỗi register:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    console.log("Đăng xuất, xóa token và user");
    localStorage.removeItem("token");
    const guestId = `guest-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("tempUserId", guestId);
    setUser({ _id: guestId, isGuest: true });
    navigate("/sign-in");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);