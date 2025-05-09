const Address = require("../models/Address");
const User = require("../models/User");

exports.addAddress = async (req, res) => {
  try {
    const userId = req.user._id; // Lấy từ token
    const { fullName, phone, province, district, ward, detail } = req.body;
    console.log('Adding address for user:', userId, req.body);

    if (!fullName || !phone || !province || !district || !ward || !detail) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin địa chỉ' });
    }

    const newAddress = new Address({ userId, fullName, phone, province, district, ward, detail });
    await newAddress.save();

    await User.findByIdAndUpdate(userId, { $push: { addresses: newAddress._id } });

    res.status(201).json({ message: "Địa chỉ đã được thêm!", address: newAddress });
  } catch (error) {
    console.error('Lỗi khi thêm địa chỉ:', error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id; // Lấy từ token
    console.log('Fetching addresses for user:', userId);
    const addresses = await Address.find({ userId });
    if (!addresses.length) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ nào' });
    }
    res.status(200).json(addresses);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách địa chỉ:', error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const userId = req.user._id; // Lấy từ token
    console.log('Deleting address:', addressId, 'for user:', userId);

    const address = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ message: "Địa chỉ không tồn tại hoặc không thuộc về bạn!" });
    }

    await User.findByIdAndUpdate(userId, { $pull: { addresses: addressId } });

    res.status(200).json({ message: "Địa chỉ đã được xóa!" });
  } catch (error) {
    console.error('Lỗi khi xóa địa chỉ:', error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};