import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: [true, 'Title is required'], trim: true },
        author: { type: String, required: [true, 'Author is required'], trim: true },
        category: { type: String, trim: true, default: 'General' },
        isbn: { type: String, required: true, unique: true, trim: true },
        quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
        availableQuantity: { type: Number, min: 0 },
    },
    { timestamps: true }
);

// A new book starts with every copy available
bookSchema.pre('validate', function () {
    if (this.isNew && this.availableQuantity === undefined) {
        this.availableQuantity = this.quantity;
    }
});
export default mongoose.model('Book', bookSchema);