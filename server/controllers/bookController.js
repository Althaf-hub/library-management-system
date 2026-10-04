import Book from '../models/Book.js';
import Transaction from '../models/Transaction.js';
import { HttpError } from '../middleware/errorHandler.js';

export const getBooks = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const filter = {};

    if (req.query.search) {
        // escape regex characters so user input can't break the query
        const safe = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rx = new RegExp(safe, 'i');
        filter.$or = [{ title: rx }, { author: rx }, { isbn: rx }];
    }
    if (req.query.category) filter.category = req.query.category;

    const [items, total] = await Promise.all([
        Book.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Book.countDocuments(filter),
    ]);

    res.json({ items, page, pages: Math.ceil(total / limit), total });
};

export const getBook = async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) throw new HttpError(404, 'Book not found');
    res.json(book);
};

export const createBook = async (req, res) => {
    const { title, author, category, isbn, quantity } = req.body;
    const book = await Book.create({ title, author, category, isbn, quantity });
    res.status(201).json(book);
};

export const updateBook = async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) throw new HttpError(404, 'Book not found');

    const { title, author, category, isbn, quantity } = req.body;
    if (quantity !== undefined) {
        const issued = book.quantity - book.availableQuantity;
        if (quantity < issued) {
            throw new HttpError(409, `Cannot set quantity below ${issued} (copies currently issued)`);
        }
        book.availableQuantity = quantity - issued;
        book.quantity = quantity;
    }
    Object.assign(book, {
        ...(title && { title }),
        ...(author && { author }),
        ...(category && { category }),
        ...(isbn && { isbn }),
    });

    await book.save();
    res.json(book);
};

export const deleteBook = async (req, res) => {
    const active = await Transaction.exists({ bookId: req.params.id, status: 'issued' });
    if (active) throw new HttpError(409, 'Cannot delete a book that is currently issued');

    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) throw new HttpError(404, 'Book not found');
    res.json({ message: 'Book deleted' });
};