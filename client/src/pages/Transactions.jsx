import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

export default function Transactions() {
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [txs, setTxs] = useState([]);
    const [form, setForm] = useState({ bookId: '', memberId: '', days: 14 });
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const [b, m, t] = await Promise.all([
                api.get('/books', { params: { limit: 50 } }),
                api.get('/members'),
                api.get('/transactions'),
            ]);
            setBooks(b.data.items.filter((x) => x.availableQuantity > 0));
            setMembers(m.data);
            setTxs(t.data);
        } catch (e) { setError(errMsg(e)); }
    };
    useEffect(() => { load(); }, []);

    const issue = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/transactions/issue', { ...form, days: Number(form.days) });
            load();
        } catch (err) { setError(errMsg(err)); }
    };

    const giveBack = async (id) => {
        setError('');
        try { await api.put(`/transactions/${id}/return`); load(); } catch (err) { setError(errMsg(err)); }
    };

    const isOverdue = (t) => t.status === 'issued' && new Date(t.dueDate) < new Date();
    const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '-');

    return (
        <>
            <h1>Issue / Return</h1>
            {error && <div className="error">{error}</div>}
            <form onSubmit={issue}>
                <select value={form.bookId} onChange={(e) => setForm({ ...form, bookId: e.target.value })}>
                    <option value="">Select book</option>
                    {books.map((b) => <option key={b._id} value={b._id}>{b.title} ({b.availableQuantity} left)</option>)}
                </select>
                <select value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}>
                    <option value="">Select member</option>
                    {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
                <input type="number" min="1" max="60" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} />
                <button>Issue Book</button>
            </form>
            <div className="table-wrap">
                <table>
                    <thead><tr><th>Book</th><th>Member</th><th>Issued</th><th>Due</th><th>Status</th><th>Fine</th><th></th></tr></thead>
                    <tbody>
                        {txs.map((t) => (
                            <tr key={t._id}>
                                <td>{t.bookId?.title || 'Deleted book'}</td>
                                <td>{t.memberId?.name || 'Deleted member'}</td>
                                <td>{fmt(t.issueDate)}</td>
                                <td className={isOverdue(t) ? 'overdue' : ''}>{fmt(t.dueDate)}</td>
                                <td className={isOverdue(t) ? 'overdue' : ''}>{isOverdue(t) ? 'overdue' : t.status}</td>
                                <td>{t.fine ? `₹${t.fine}` : '-'}</td>
                                <td>{t.status === 'issued' && <button onClick={() => giveBack(t._id)}>Return</button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}