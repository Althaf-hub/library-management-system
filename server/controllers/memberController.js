import Member from '../models/Member.js';
import Transaction from '../models/Transaction.js';
import { HttpError } from '../middleware/errorHandler.js';

export const getMembers = async (req, res) => {
    const filter = {};
    if (req.query.search) {
        const safe = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rx = new RegExp(safe, 'i');
        filter.$or = [{ name: rx }, { email: rx }];
    }
    res.json(await Member.find(filter).sort({ createdAt: -1 }));
};

export const getMember = async (req, res) => {
    const member = await Member.findById(req.params.id);
    if (!member) throw new HttpError(404, 'Member not found');
    res.json(member);
};

export const createMember = async (req, res) => {
    const { name, email, phone } = req.body;
    res.status(201).json(await Member.create({ name, email, phone }));
};

export const updateMember = async (req, res) => {
    const { name, email, phone } = req.body;
    const member = await Member.findByIdAndUpdate(
        req.params.id,
        { name, email, phone },
        { new: true, runValidators: true, omitUndefined: true }
    );
    if (!member) throw new HttpError(404, 'Member not found');
    res.json(member);
};

export const deleteMember = async (req, res) => {
    const active = await Transaction.exists({ memberId: req.params.id, status: 'issued' });
    if (active) throw new HttpError(409, 'Member still has issued books');

    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) throw new HttpError(404, 'Member not found');
    res.json({ message: 'Member deleted' });
};