import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    recipe: { type: String, required: true },
});

// Khai báo model chỉ một lần và export
const Food = mongoose.model('Food', foodSchema);

export default Food;  // Export model Food
