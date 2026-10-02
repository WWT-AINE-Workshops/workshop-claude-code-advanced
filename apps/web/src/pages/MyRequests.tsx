import { useEffect, useState } from 'react';
import { api } from '../api';
import { Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { useAsync } from '../useAsync';

export function MyRequests() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);
  const { data, error, reload } = useAsync(() => api.requests(page, 10, q || undefined), [page, q]);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading…</p>;

  const cancel = async (id: number) => {
    await api.cancel(id);
    reload();
  };

  return (
    <>
      <h1>Requests</h1>
      <input
        type="search"
        aria-label="Search requests"
        placeholder="Search by item or justification"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table data-testid="requests-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Requester</th>
            <th>Status</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.items.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.itemName}</td>
              <td>{r.qty}</td>
              <td>{r.requesterName}</td>
              <td>
                <StatusBadge status={r.status} />
              </td>
              <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              <td>
                {r.status === 'pending' && (
                  <button type="button" onClick={() => cancel(r.id)}>
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
    </>
  );
}
