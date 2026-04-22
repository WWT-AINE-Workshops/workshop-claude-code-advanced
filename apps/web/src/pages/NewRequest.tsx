import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { formatCents } from '@copperline/shared';
import { api } from '../api';
import { useAsync } from '../useAsync';

export function NewRequest() {
  const navigate = useNavigate();
  const { data: items } = useAsync(() => api.items(), []);
  const [itemId, setItemId] = useState(0);
  const [qty, setQty] = useState(1);
  const [justification, setJustification] = useState('');
  const [error, setError] = useState<string>();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    try {
      await api.createRequest({ itemId, qty, justification });
      navigate('/requests');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <>
      <h1>New request</h1>
      <form className="stack" onSubmit={submit}>
        <label>
          Item
          <select value={itemId} onChange={(e) => setItemId(Number(e.target.value))} required>
            <option value={0} disabled>
              Choose an item
            </option>
            {(items ?? []).map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} — {formatCents(i.unitCostCents)} ({i.stock} in stock)
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantity
          <input
            type="number"
            min={1}
            max={10}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </label>
        <label>
          Justification
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            minLength={10}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Submit request</button>
      </form>
    </>
  );
}
