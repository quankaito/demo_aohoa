import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Food from './models/Food.js';  // Import model Food từ file Food.js

dotenv.config();  // Đọc thông tin từ file .env
dotenv.config({ path: '../.env' });

const app = express();

// Cấu hình CORS
/**
 * Cấu hình CORS cho phép frontend kết nối đến backend từ một địa chỉ cụ thể
 */
app.use(
  cors({
    origin: 'http://localhost:3000', // URL frontend của bạn
    methods: ['GET', 'POST', 'DELETE', 'PUT','SEARCH'], // Thêm các phương thức khác nếu cần
    allowedHeaders: ['Content-Type'],
  })
);

// Cấu hình middleware để nhận JSON
/**
 * Middleware để xử lý dữ liệu JSON trong request body
 */
app.use(express.json());

// Kết nối MongoDB
/**
 * Kết nối với cơ sở dữ liệu MongoDB
 */
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// API POST: Thêm món ăn vào MongoDB
/**
 * Thêm món ăn mới vào cơ sở dữ liệu MongoDB.
 * Chấp nhận name và recipe từ request body.
 * Trả về món ăn mới thêm vào.
 */
app.post('/api/foods', async (req, res) => {
  const { name, recipe } = req.body;
  try {
    const newFood = new Food({ name, recipe });
    await newFood.save(); // Lưu món ăn vào MongoDB
    res.status(201).json(newFood); // Trả về món ăn vừa thêm
  } catch (err) {
    console.error('Error saving food:', err);
    res.status(500).send('Server error');
  }
});

// API GET: Lấy danh sách món ăn từ MongoDB
/**
 * Lấy tất cả các món ăn từ cơ sở dữ liệu MongoDB.
 * Trả về danh sách tất cả các món ăn có trong cơ sở dữ liệu.
 */
app.get('/api/foods', async (req, res) => {
  try {
    const foods = await Food.find(); // Truy vấn MongoDB để lấy tất cả món ăn
    res.json(foods); // Trả về danh sách món ăn
  } catch (err) {
    console.error('Error fetching foods:', err);
    res.status(500).send('Server error');
  }
});

// API GET: Lấy món ăn cụ thể từ MongoDB dựa trên ID
/**
 * Lấy một món ăn cụ thể từ MongoDB dựa trên ID.
 * Trả về món ăn nếu tìm thấy, nếu không trả về lỗi 404.
 */
app.get('/api/foods/:id', async (req, res) => {
  const { id } = req.params; // Lấy ID từ URL
  try {
    const food = await Food.findById(id); // Tìm món ăn dựa trên ID
    if (!food) {
      return res.status(404).json({ message: 'Food not found' }); // Nếu không tìm thấy
    }
    res.json(food); // Trả về dữ liệu món ăn
  } catch (err) {
    console.error('Error fetching food by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API DELETE: Xóa món ăn dựa trên ID
/**
 * Xóa món ăn dựa trên ID.
 * Trả về thông báo xóa thành công nếu món ăn được tìm thấy và xóa.
 * Nếu không tìm thấy, trả về lỗi 404.
 */
app.delete('/api/foods/:id', async (req, res) => {
  const { id } = req.params; // Lấy ID từ URL
  try {
    const deletedFood = await Food.findByIdAndDelete(id); // Xóa món ăn từ MongoDB
    if (!deletedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json({ message: 'Food deleted successfully', deletedFood });
  } catch (err) {
    console.error('Error deleting food:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API PUT: Cập nhật món ăn dựa trên ID
/**
 * Cập nhật thông tin món ăn dựa trên ID.
 * Chấp nhận name và recipe từ request body.
 * Trả về món ăn đã cập nhật.
 */
app.put('/api/foods/:id', async (req, res) => {
  const { id } = req.params;
  const { name, recipe } = req.body;
  try {
    const updatedFood = await Food.findByIdAndUpdate(
      id,
      { name, recipe },
      { new: true } // Trả về document đã cập nhật
    );
    if (!updatedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json(updatedFood);
  } catch (err) {
    console.error('Error updating food:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API FIND: Tìm món ăn dựa trên tên
/**
 * Tìm kiếm món ăn dựa trên tên trong query params.
 * Trả về danh sách các món ăn phù hợp với tên tìm kiếm.
 */
app.get('/api/foods/search', async (req, res) => {
  const { name } = req.query; // Lấy tên món ăn từ query params
  try {
    // Nếu có tên món ăn trong query params, tìm kiếm theo tên
    let query = {};
    if (name) {
      query = { name: { $regex: name, $options: 'i' } }; // Tìm kiếm không phân biệt chữ hoa chữ thường
    }

    const foods = await Food.find(query); // Tìm món ăn theo điều kiện
    if (foods.length === 0) {
      return res.status(404).json({ message: 'No foods found' }); // Nếu không tìm thấy
    }

    res.json(foods); // Trả về danh sách món ăn tìm được
  } catch (err) {
    console.error('Error searching foods:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Khởi động server
/**
 * Khởi động server và lắng nghe trên cổng định sẵn.
 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
