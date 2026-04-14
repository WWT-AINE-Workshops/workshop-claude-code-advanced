import { api } from '../api';
import { useAsync } from '../useAsync';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { data, error } = useAsync(() => api.dashboard(), []);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading…</p>;
  const cards = [
    { label: 'Pending requests', value: data.pendingCount },
    { label: 'Approved this month', value: data.approvedThisMonth },
    { label: 'Low-stock items', value: data.lowStockItems },
    { label: 'My open requests', value: data.myOpenRequests },
  ];
  return (
    <>
      <h1>Dashboard</h1>
      <section className={styles.cards}>
        {cards.map((c) => (
          <article key={c.label} className={styles.card} data-testid="dashboard-card">
            <div className={styles.value}>{c.value}</div>
            <div className={styles.label}>{c.label}</div>
          </article>
        ))}
      </section>
    </>
  );
}
