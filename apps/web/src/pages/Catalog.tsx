import { useState } from 'react';
import { formatCents, type ItemPrice } from '@copperline/shared';
import { api } from '../api';
import { useAsync } from '../useAsync';

export function Catalog() {
  const [q, setQ] = useState('');
  const { data, error } = useAsync(() => api.items(q || undefined), [q]);
  const [prices, setPrices] = useState<Record<number, ItemPrice>>({});

  const check = async (id: number) => {
    const price = await api.price(id);
    setPrices((p) => ({ ...p, [id]: price }));
  };

  return (
    <>
      <h1>Catalog</h1>
      <input
        aria-label="Search items"
        placeholder="Search by name or SKU"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Catalog cost</th>
            <th>Vendor price</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((i) => (
            <tr key={i.id}>
              <td>{i.sku}</td>
              <td>{i.name}</td>
              <td>{i.category}</td>
              <td>{i.stock}</td>
              <td>{formatCents(i.unitCostCents)}</td>
              <td>
                {prices[i.id] ? (
                  `${formatCents(prices[i.id].unitCostCents)} (${prices[i.id].source})`
                ) : (
                  <button type="button" onClick={() => check(i.id)}>
                    Check price
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
