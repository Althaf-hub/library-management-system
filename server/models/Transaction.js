import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
        memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
        issueDate: { type: Date, default: Date.now },
        dueDate: { type: Date, required: true }, // not in the original doc, but fines need it
        returnDate: { type: Date },
        status: { type: String, enum: ['issued', 'returned'], default: 'issued', index: true },
        fine: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);