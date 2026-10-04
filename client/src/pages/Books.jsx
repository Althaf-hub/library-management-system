import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

const empty = { title: '', author: '', category: '', isbn: '', quantity: 1 };

export default function Books() {
    const [data, setData] = useState({ items: [], pages: 1 });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState(empty);
    const [error, setError] = useState('');

    const load = () =>
        api.get('/books', { params: { search, page, limit: 8 } }).then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
    useEffect(() => { load(); }, [search, page]);

    const add = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/books', { ...form, quantity: Number(form.quantity) });
            setForm(empty);
            load();
        } catch (err) { setError(errMsg(err)); }
    };

    const remove = async (id) => {
        setError('');
        try { await api.delete(`/books/${id}`); load(); } catch (err) { setError(errMsg(err)); }
    };

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    return (
        <>
            <h1>Books</h1>
            {error && <div className="error">{error}</div>}
            <form onSubmit={add}>
                <input placeholder="Title" value={form.title} onChange={set('title')} />
                <input placeholder="Author" value={form.author} onChange={set('author')} />
                <input placeholder="Category" value={form.category} onChange={set('category')} />
                <input placeholder="ISBN" value={form.isbn} onChange={set('isbn')} />
                <input type="number" min="1" placeholder="Qty" value={form.quantity} onChange={set('quantity')} />
                <button>Add Book</button>
            </form>
            <input placeholder="Search title, author or ISBN..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ marginBottom: 12, width: '100%' }} />
            <div className="table-wrap">
                <table>
                    <thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Available</th><th></th></tr></thead>
                    <tbody>
                        {data.items.map((b) => (
                            <tr key={b._id}>
                                <td>{b.title}</td><td>{b.author}</td><td>{b.category}</td>
                                <td>{b.availableQuantity} / {b.quantity}</td>
                                <td><button className="red" onClick={() => remove(b._id)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pager">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
                <span>Page {page} of {data.pages || 1}</span>
                <button disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
        </>
    );
}