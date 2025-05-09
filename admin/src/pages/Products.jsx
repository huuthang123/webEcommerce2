// src/pages/Products.jsx
import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../services/productService";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    image: "",
    category: "",
    prices: { 250: 0, 500: 0, 1000: 0 },
    stock: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateProduct(formData.id, formData);
      } else {
        await addProduct(formData);
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (error) {
        alert("Lỗi khi xóa sản phẩm: " + error.message);
      }
    }
  };

  const handleEdit = (product) => {
    setFormData({
      id: product._id,
      name: product.name,
      description: product.description,
      image: product.image,
      category: product.category,
      prices: product.prices,
      stock: product.stock,
    });
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      image: "",
      category: "",
      prices: { 250: 0, 500: 0, 1000: 0 },
      stock: 0,
    });
  };

  return (
    <ProtectedRoute>
      <div className="container">
        <h1>Quản Lý Sản Phẩm</h1>

        <form onSubmit={handleSubmit} className="form-container">
          <input
            type="text"
            placeholder="Tên sản phẩm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Mô tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="URL hình ảnh"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            required
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="">Chọn danh mục</option>
            <option value="fruit">Trái cây</option>
            <option value="seafood">Hải sản</option>
            <option value="meat">Thịt</option>
            <option value="nut">Hạt</option>
          </select>
          <input
            type="number"
            placeholder="Giá 250g"
            value={formData.prices["250"]}
            onChange={(e) =>
              setFormData({
                ...formData,
                prices: { ...formData.prices, 250: Number(e.target.value) },
              })
            }
            required
          />
          <input
            type="number"
            placeholder="Giá 500g"
            value={formData.prices["500"]}
            onChange={(e) =>
              setFormData({
                ...formData,
                prices: { ...formData.prices, 500: Number(e.target.value) },
              })
            }
            required
          />
          <input
            type="number"
            placeholder="Giá 1000g"
            value={formData.prices["1000"]}
            onChange={(e) =>
              setFormData({
                ...formData,
                prices: { ...formData.prices, 1000: Number(e.target.value) },
              })
            }
            required
          />
          <input
            type="number"
            placeholder="Số lượng tồn kho"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            required
          />
          <button type="submit">{formData.id ? "Cập nhật" : "Thêm"}</button>
          {formData.id && <button type="button" onClick={resetForm}>Hủy</button>}
        </form>

        <div className="product-list">
          <h2>Danh Sách Sản Phẩm</h2>
          <table>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Giá (250g/500g/1000g)</th>
                <th>Tồn kho</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    {product.prices["250"]} / {product.prices["500"]} / {product.prices["1000"]}
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <button onClick={() => handleEdit(product)}>Sửa</button>
                    <button onClick={() => handleDelete(product._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Products;