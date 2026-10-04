import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

export default function Dashboard() {
    const [s, setS] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/transactions/dashboard/stats').then((r) => setS(r.data)).catch((e) => setError(errMsg(e)));
    }, []);

    if (error) return <div className="error">{error}</div>;
    if (!s) return <p>Loading... (the free server may take ~30s to wake up)</p>;

    const items = [
        ['Total Books', s.totalBooks], ['Members', s.totalMembers], ['Issued', s.issuedBooks],
        ['Returned', s.returnedBooks], ['Overdue', s.overdueBooks], ['Copies Available', s.availableCopies],
    ];
    return (
        <>
            <h1>Dashboard</h1>
            <div className="cards">
                {items.map(([label, value]) => (
                    <div className="card" key={label}><h2>{value}</h2><p>{label}</p></div>
                ))}
            </div>
        </>
    );
}