import 'dotenv/config';
import mongoose from 'mongoose';
import Book from './models/Book.js';
import Member from './models/Member.js';
import Transaction from './models/Transaction.js';

const DAY = 86400000;
await mongoose.connect(process.env.MONGO_URI);
await Promise.all([Book.deleteMany(), Member.deleteMany(), Transaction.deleteMany()]);

const b = await Book.create([
    { title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming', isbn: '9780132350884', quantity: 3 },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Programming', isbn: '9780135957059', quantity: 2 },
    { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', category: 'Programming', isbn: '9781593279509', quantity: 4 },
    { title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', isbn: '9780735211292', quantity: 5 },
    { title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', isbn: '9780062316110', quantity: 3 },
    { title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', category: 'Biography', isbn: '9788173711466', quantity: 4 },
]);
const m = await Member.create([
    { name: 'Asha Nair', email: 'asha@example.com', phone: '9876543210' },
    { name: 'Rahul Menon', email: 'rahul@example.com', phone: '9876543211' },
    { name: 'Fathima K', email: 'fathima@example.com', phone: '9876543212' },
]);

// book, member, issued X days ago, loan length, returned Y days ago (optional)
const tx = async (book, member, ago, loan, retAgo) => {
    const issueDate = new Date(Date.now() - ago * DAY);
    const dueDate = new Date(issueDate.getTime() + loan * DAY);
    const t = { bookId: book._id, memberId: member._id, issueDate, dueDate };
    if (retAgo !== undefined) {
        t.status = 'returned';
        t.returnDate = new Date(Date.now() - retAgo * DAY);
        t.fine = Math.max(0, Math.ceil((t.returnDate - dueDate) / DAY)) * 5;
    } else {
        await Book.updateOne({ _id: book._id }, { $inc: { availableQuantity: -1 } });
    }
    await Transaction.create(t);
};

await tx(b[0], m[0], 3, 14);       // issued
await tx(b[1], m[1], 20, 14);      // overdue by 6 days
await tx(b[2], m[2], 2, 14);       // issued
await tx(b[3], m[1], 25, 14, 5);   // returned late, has fine
await tx(b[4], m[0], 30, 14, 20);  // returned on time

console.log('Seed complete');
await mongoose.disconnect();