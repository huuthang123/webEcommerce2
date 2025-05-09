import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchCart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity } from "../services/CartService";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadCartFromServer = useCallback(async () => {
    if (!user?.token) {
      console.log("Không có token, không tải giỏ hàng từ server");
      return;
    }
    try {
      console.log('Token gửi đi trong loadCartFromServer:', user.token);
      const cart = await fetchCart(user.token);
      const itemsWithSelection = cart.items.map((item) => ({
        ...item,
        selected: item.selected || false,
      }));
      setCartItems(itemsWithSelection);
      localStorage.setItem("cartItemsBackup", JSON.stringify(itemsWithSelection));
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng từ server:", error.response?.data || error.message);
      setCartItems([]);
    }
  }, [user]);

  const loadCartFromLocalStorage = useCallback(() => {
    try {
      const savedCart = localStorage.getItem("cartItems") || localStorage.getItem("cartItemsBackup");
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      setCartItems(parsedCart);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng từ localStorage:", error);
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    if (user?.token) {
      loadCartFromServer();
    } else {
      loadCartFromLocalStorage();
    }
  }, [user, loadCartFromServer, loadCartFromLocalStorage]);

  useEffect(() => {
    if (!user?.token) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const toggleCart = () => setIsOpen((prev) => !prev);

  const handleAddToCart = async (product) => {
    const { productId, quantity = 1, size, name, price, image } = product;
    if (user?.token) {
      try {
        await addToCart(product, user.token);
        await loadCartFromServer();
      } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error.response?.data || error.message);
      }
    } else {
      setCartItems((prev) => {
        const existingItem = prev.find((item) => item.productId === productId && item.size === size);
        let updatedCart;
        if (existingItem) {
          updatedCart = prev.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedCart = [...prev, { productId, quantity, size, name, price, image, selected: false }];
        }
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        return updatedCart;
      });
    }
  };

  const handleRemoveFromCart = async (productId, size) => {
    if (user?.token) {
      try {
        await removeFromCart(productId, size, user.token);
        await loadCartFromServer();
      } catch (error) {
        console.error("Lỗi khi xóa khỏi giỏ hàng:", error.response?.data || error.message);
      }
    } else {
      setCartItems((prev) => {
        const updatedCart = prev.filter((item) => !(item.productId === productId && item.size === size));
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        return updatedCart;
      });
    }
  };

  const handleIncreaseQuantity = async (productId, size) => {
    if (user?.token) {
      try {
        await increaseQuantity(productId, size, user.token);
        await loadCartFromServer();
      } catch (error) {
        console.error("Lỗi khi tăng số lượng:", error.response?.data || error.message);
      }
    } else {
      setCartItems((prev) => {
        const updatedCart = prev.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        return updatedCart;
      });
    }
  };

  const handleDecreaseQuantity = async (productId, size) => {
    if (user?.token) {
      try {
        await decreaseQuantity(productId, size, user.token);
        await loadCartFromServer();
      } catch (error) {
        console.error("Lỗi khi giảm số lượng:", error.response?.data || error.message);
      }
    } else {
      setCartItems((prev) => {
        const updatedCart = prev
          .map((item) =>
            item.productId === productId && item.size === size && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0);
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        return updatedCart;
      });
    }
  };

  const handleSelectAll = (isSelected) => {
    setCartItems((prev) => {
      const updatedCart = prev.map((item) => ({ ...item, selected: isSelected }));
      if (!user?.token) localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleToggleItemSelection = (productId, size) => {
    setCartItems((prev) => {
      const updatedCart = prev.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, selected: !item.selected }
          : item
      );
      if (!user?.token) localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const clearCart = async () => {
    if (user?.token) {
      try {
        await axios.delete(`http://localhost:5000/api/carts`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        await loadCartFromServer();
      } catch (error) {
        console.error("Lỗi khi xóa giỏ hàng:", error.response?.data || error.message);
      }
    } else {
      setCartItems([]);
      localStorage.setItem("cartItems", JSON.stringify([]));
    }
  };

  const total = cartItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const displaySize = (size) => {
    switch (size) {
      case "250": return "0.25kg";
      case "500": return "0.5kg";
      case "1000": return "1kg";
      default: return size;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        isOpen,
        toggleCart,
        total,
        totalItems,
        addToCart: handleAddToCart,
        removeFromCart: handleRemoveFromCart,
        increaseQuantity: handleIncreaseQuantity,
        decreaseQuantity: handleDecreaseQuantity,
        selectAll: handleSelectAll,
        toggleItemSelection: handleToggleItemSelection,
        fetchCartFromServer: loadCartFromServer,
        loadCartFromLocalStorage,
        clearCart,
        displaySize,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};