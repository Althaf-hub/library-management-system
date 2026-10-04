import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
        },
        phone: { type: String, trim: true },
        membershipDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model('Member', memberSchema);