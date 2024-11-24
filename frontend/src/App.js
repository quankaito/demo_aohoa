import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Typography, Button, TextField } from '@mui/material';

const RecipeApp = () => {
  // State để lưu tên món ăn, công thức, và danh sách món ăn đã lưu
  const [foodName, setFoodName] = useState('');
  const [recipe, setRecipe] = useState('');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State để lưu query tìm kiếm
  const [editFood, setEditFood] = useState(null); // State để lưu món ăn đang chỉnh sửa

  /**
   * Fetch dữ liệu món ăn từ API khi component load
   */
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/foods');
        const data = await response.json();
        setSavedRecipes(data); // Lưu danh sách món ăn vào state
      } catch (err) {
        console.error('Error fetching foods:', err);
      }
    };

    fetchFoods(); // Gọi hàm fetchFoods để lấy danh sách món ăn
  }, []); // Chỉ gọi một lần khi component mount

  /**
   * Fetch dữ liệu món ăn theo tên tìm kiếm
   */
  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/foods/search?name=${searchQuery}`);
      const data = await response.json();
      setSavedRecipes(data); // Cập nhật danh sách món ăn tìm được
    } catch (err) {
      console.error('Error searching foods:', err);
    }
  };

  /**
   * Hàm xử lý khi gửi form thêm món ăn hoặc cập nhật món ăn
   * @param {Event} e - Sự kiện gửi form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (foodName && recipe) {
      try {
        const newFood = { name: foodName, recipe };
        let response;
        let data;

        if (editFood) {
          // Cập nhật món ăn nếu đang chỉnh sửa
          response = await fetch(`http://localhost:3001/api/foods/${editFood._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFood),
          });
          data = await response.json();
          setSavedRecipes(
            savedRecipes.map((food) =>
              food._id === editFood._id ? data : food
            )
          );
          setEditFood(null); // Reset trạng thái chỉnh sửa
        } else {
          // Thêm món ăn mới nếu không chỉnh sửa
          response = await fetch('http://localhost:3001/api/foods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFood),
          });
          data = await response.json();
          setSavedRecipes([...savedRecipes, data]);
        }

        setFoodName(''); // Làm mới trường nhập tên món ăn
        setRecipe(''); // Làm mới trường nhập công thức
      } catch (err) {
        console.error('Error saving or updating food:', err);
      }
    }
  };

  /**
   * Hàm xóa món ăn
   * @param {string} id - ID món ăn cần xóa
   */
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/foods/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.deletedFood) {
        setSavedRecipes(savedRecipes.filter((food) => food._id !== id)); // Cập nhật danh sách món ăn sau khi xóa
      }
    } catch (err) {
      console.error('Error deleting food:', err);
    }
  };

  /**
   * Hàm chỉnh sửa món ăn
   * @param {Object} food - Món ăn cần chỉnh sửa
   */
  const handleEdit = (food) => {
    setFoodName(food.name);
    setRecipe(food.recipe);
    setEditFood(food); // Lưu món ăn đang được chỉnh sửa vào state
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Typography variant="h4" className="text-center font-bold text-gray-800">
            Food Recipes
          </Typography>
          <Typography variant="body2" className="text-center text-gray-600">
            Create, update, and delete your favorite recipes
          </Typography>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Food Name"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Ingredients (comma separated)"
              value={recipe}
              onChange={(e) => setRecipe(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {editFood ? 'Update Recipe' : 'Save Recipe'}
            </Button>
          </form>

          {/* Tìm kiếm món ăn */}
          <div className="mt-8">
            <Typography variant="h5" className="font-semibold text-gray-800 mb-4">
              Search Recipes:
            </Typography>
            <TextField
              label="Search by Food Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleSearch}
              className="mt-4"
            >
              Search
            </Button>
          </div>

          {/* Hiển thị danh sách món ăn */}
          <div className="mt-8">
            <Typography variant="h5" className="font-semibold text-gray-800 mb-4">
              Saved Recipes:
            </Typography>
            {savedRecipes.map((item, index) => (
              <Card key={index} className="bg-white mb-4">
                <CardContent>
                  <Typography variant="h6" className="font-semibold text-gray-800">
                    {item.name}
                  </Typography>
                  <div className="text-gray-600 mt-1">
                    {item.recipe.split(',').map((ingredient, idx) => (
                      <p key={idx}>{`${idx + 1}. ${ingredient.trim()}`}</p>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipeApp;
