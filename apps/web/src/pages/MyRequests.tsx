import { REQUEST_STATUSES, type RequestStatus } from '@copperline/shared';
import { Fragment, useState } from 'react';
import { api } from '../api';
import { Pagination } from '../components/Pagination';
import { RequestTimeline } from '../components/RequestTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { useAsync } from '../useAsync';

export function MyRequests() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<RequestStatus | ''>('');
  const [open, setOpen] = useState<number | null>(null);
  const { data, error, reload } = useAsync(
    () => api.requests(page, 10, status || undefined),
    [page, status],
  );
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading…</p>;

  const cancel = async (id: number) => {
    await api.cancel(id);
    reload();
  };

  return (
    <>
      <h1>Requests</h1>
      <label>
        Status{' '}
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as RequestStatus | '');
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </label>
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
            <th />
          </tr>
        </thead>
        <tbody>
          {data.items.map((r) => (
            <Fragment key={r.id}>
              <tr>
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
                <td>
                  <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)}>
                    History
                  </button>
                </td>
              </tr>
              {open === r.id && (
                <tr>
                  <td colSpan={8}>
                    <RequestTimeline requestId={r.id} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
    </>
  );
}
