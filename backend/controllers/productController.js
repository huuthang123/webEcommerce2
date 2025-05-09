// src/controllers/productController.js
const Product = require("../models/Product");
const mongoose = require("mongoose");

const addProduct = async (req, res) => {
  try {
    let products = req.body;
    console.log('Adding products by user:', req.user._id, products);
    if (!Array.isArray(products)) products = [products];

    const validCategories = ["fruit", "seafood", "meat", "nut"];
    const invalidProducts = products.filter(
      (p) => !p.name || !p.image || !p.prices || !validCategories.includes(p.category)
    );

    if (invalidProducts.length > 0) {
      return res.status(400).json({ message: "Một số sản phẩm có dữ liệu không hợp lệ!" });
    }

    const newProducts = await Product.insertMany(products);
    res.status(201).json({ message: `Thêm thành công ${newProducts.length} sản phẩm!`, products: newProducts });
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    console.log('Fetching products with query:', { category });
    let query = {};
    if (category) query.category = category;

    const products = await Product.find(query)
      .select('name description image prices category stock rating sold') // Trả về đầy đủ các trường cần thiết
      .lean();
    if (!products.length) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm nào" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching product by ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ!" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }
    
    const publicData = {
      _id: product._id, // Thêm _id để các component có thể sử dụng
      name: product.name,
      description: product.description, // Thêm description
      image: product.image,
      prices: product.prices,
      category: product.category,
      stock: product.stock, // Thêm stock
      rating: product.rating,
      sold: product.sold // Thêm sold
    };
    res.status(200).json(publicData);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating product:', id, 'by user:', req.user._id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ!" });
    }

    if (req.body._id) delete req.body._id;

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }
    res.status(200).json({ message: "Sản phẩm đã được cập nhật!", product: updatedProduct });
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting product:', id, 'by user:', req.user._id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ!" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }
    res.status(200).json({ message: "Xóa sản phẩm thành công!", deletedProduct });
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = { addProduct, getProducts, getProductById, updateProduct, deleteProduct };