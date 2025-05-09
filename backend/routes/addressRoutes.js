const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching addresses for user:', userId);
    const addresses = await Address.find({ userId });
    if (!addresses.length) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ nào' });
    }
    res.json(addresses);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách địa chỉ:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, phone, province, district, ward, detail } = req.body;
    console.log('Adding address:', req.body);

    if (!fullName || !phone || !province || !district || !ward || !detail) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin địa chỉ' });
    }

    const address = new Address({
      userId,
      fullName,
      phone,
      province,
      district,
      ward,
      detail,
    });
    await address.save();
    res.status(201).json({ message: 'Thêm địa chỉ thành công', address });
  } catch (error) {
    console.error('Lỗi khi thêm địa chỉ:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: messages });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, phone, province, district, ward, detail } = req.body;
    console.log('Updating address:', req.params.id, req.body);

    if (!fullName || !phone || !province || !district || !ward || !detail) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin địa chỉ' });
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId },
      { fullName, phone, province, district, ward, detail },
      { new: true, runValidators: true }
    );
    if (!address) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ hoặc không thuộc về bạn' });
    }
    res.json({ message: 'Cập nhật địa chỉ thành công', address });
  } catch (error) {
    console.error('Lỗi khi cập nhật địa chỉ:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: messages });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Deleting address:', req.params.id, 'for user:', userId);

    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      userId,
    });
    if (!address) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ hoặc không thuộc về bạn' });
    }
    res.json({ message: 'Xóa địa chỉ thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa địa chỉ:', error);
    res.status(500).json({ message: 'Lỗi khi xóa địa chỉ', error: error.message });
  }
});

module.exports = router;