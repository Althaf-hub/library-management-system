import mongoose from 'mongoose';
import Book from '../models/Book.js';
import Member from '../models/Member.js';
import Transaction from '../models/Transaction.js';
import { HttpError } from '../middleware/errorHandler.js';

const DAY = 24 * 60 * 60 * 1000;
const isId = (id) => mongoose.isValidObjectId(id);

export const issueBook = async (req, res) => {
    const { bookId, memberId, days = 14 } = req.body;
    if (!isId(bookId) || !isId(memberId)) throw new HttpError(400, 'Valid bookId and memberId required');
    if (!Number.isInteger(days) || days < 1 || days > 60) throw new HttpError(400, 'days must be 1-60');

    const member = await Member.findById(memberId);
    if (!member) throw new HttpError(404, 'Member not found');

    // ATOMIC: check availability and decrement in ONE database operation
    const book = await Book.findOneAndUpdate(
        { _id: bookId, availableQuantity: { $gt: 0 } },
        { $inc: { availableQuantity: -1 } },
        { new: true }
    );

    if (!book) {
        const exists = await Book.exists({ _id: bookId });
        if (!exists) throw new HttpError(404, 'Book not found');
        throw new HttpError(409, 'No copies available');
    }

    try {
        const tx = await Transaction.create({
            bookId,
            memberId,
            dueDate: new Date(Date.now() + days * DAY),
        });
        res.status(201).json(tx);
    } catch (err) {
        // compensating action: undo the decrement if saving the transaction failed
        await Book.updateOne({ _id: bookId }, { $inc: { availableQuantity: 1 } });
        throw err;
    }
};

export const returnBook = async (req, res) => {
    if (!isId(req.params.id)) throw new HttpError(400, 'Invalid transaction ID');

    // ATOMIC claim: only one request can flip issued -> returned
    const tx = await Transaction.findOneAndUpdate(
        { _id: req.params.id, status: 'issued' },
        { status: 'returned', returnDate: new Date() },
        { new: true }
    );

    if (!tx) {
        const exists = await Transaction.exists({ _id: req.params.id });
        if (!exists) throw new HttpError(404, 'Transaction not found');
        throw new HttpError(409, 'Book already returned');
    }

    const overdueDays = Math.max(0, Math.ceil((tx.returnDate - tx.dueDate) / DAY));
    tx.fine = overdueDays * (Number(process.env.FINE_PER_DAY) || 5);
    await tx.save();

    await Book.updateOne({ _id: tx.bookId }, { $inc: { availableQuantity: 1 } });
    res.json(tx);
};

export const getTransactions = async (req, res) => {
    const filter = {};
    if (['issued', 'returned'].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.overdue === 'true') {
        filter.status = 'issued';
        filter.dueDate = { $lt: new Date() };
    }

    const items = await Transaction.find(filter)
        .populate('bookId', 'title author isbn')
        .populate('memberId', 'name email')
        .sort({ createdAt: -1 });

    res.json(items);
};

export const getDashboard = async (req, res) => {
    const [totalBooks, totalMembers, issued, returned, overdue, copies] = await Promise.all([
        Book.countDocuments(),
        Member.countDocuments(),
        Transaction.countDocuments({ status: 'issued' }),
        Transaction.countDocuments({ status: 'returned' }),
        Transaction.countDocuments({ status: 'issued', dueDate: { $lt: new Date() } }),
        Book.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' }, available: { $sum: '$availableQuantity' } } }]),
    ]);

    res.json({
        totalBooks,
        totalMembers,
        issuedBooks: issued,
        returnedBooks: returned,
        overdueBooks: overdue,
        totalCopies: copies[0]?.total || 0,
        availableCopies: copies[0]?.available || 0,
    });
};