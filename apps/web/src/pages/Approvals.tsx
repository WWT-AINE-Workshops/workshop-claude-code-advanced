import { useState } from 'react';
import { api } from '../api';
import { useAsync } from '../useAsync';

export function Approvals() {
  const { data, error, reload } = useAsync(() => api.approvals(), []);
  const [actionError, setActionError] = useState<string>();
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading…</p>;

  const act = async (fn: () => Promise<unknown>) => {
    setActionError(undefined);
    try {
      await fn();
    } catch (err) {
      setActionError((err as Error).message);
    }
    reload();
  };

  return (
    <>
      <h1>Approvals</h1>
      {actionError && <p className="error">{actionError}</p>}
      {data.length === 0 ? (
        <p>Nothing waiting for you.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Requester</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Justification</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.requesterName}</td>
                <td>{r.itemName}</td>
                <td>{r.qty}</td>
                <td>{r.justification}</td>
                <td>
                  <button type="button" onClick={() => act(() => api.approve(r.id))}>
                    Approve
                  </button>{' '}
                  <button type="button" onClick={() => act(() => api.reject(r.id))}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
