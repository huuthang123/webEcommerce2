// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import SignIn from "./pages/SignIn";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import NavBar from "./components/NavBar";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="*" element={<SignIn />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;