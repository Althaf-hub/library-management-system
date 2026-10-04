import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

const empty = { name: '', email: '', phone: '' };

export default function Members() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [error, setError] = useState('');

    const load = () => api.get('/members').then((r) => setItems(r.data)).catch((e) => setError(errMsg(e)));
    useEffect(() => { load(); }, []);

    const add = async (e) => {
        e.preventDefault();
        setError('');
        try { await api.post('/members', form); setForm(empty); load(); } catch (err) { setError(errMsg(err)); }
    };

    const remove = async (id) => {
        setError('');
        try { await api.delete(`/members/${id}`); load(); } catch (err) { setError(errMsg(err)); }
    };

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    return (
        <>
            <h1>Members</h1>
            {error && <div className="error">{error}</div>}
            <form onSubmit={add}>
                <input placeholder="Name" value={form.name} onChange={set('name')} />
                <input placeholder="Email" value={form.email} onChange={set('email')} />
                <input placeholder="Phone" value={form.phone} onChange={set('phone')} />
                <button>Add Member</button>
            </form>
            <div className="table-wrap">
                <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th></th></tr></thead>
                    <tbody>
                        {items.map((m) => (
                            <tr key={m._id}>
                                <td>{m.name}</td><td>{m.email}</td><td>{m.phone}</td>
                                <td>{new Date(m.membershipDate).toLocaleDateString()}</td>
                                <td><button className="red" onClick={() => remove(m._id)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}