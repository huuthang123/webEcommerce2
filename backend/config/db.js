const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://ngthang0311:Huuthang123@cluster0.o4wdz.mongodb.net/WebEcommerce?retryWrites=true&w=majority&appName=Cluster0"); // Kết nối MongoDB
    console.log("✅ MongoDB Connected"); // In ra khi kết nối thành công
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;