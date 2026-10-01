import type { RequestEvent, RequestStatus } from '@copperline/shared';
import { api } from '../api';
import { useAsync } from '../useAsync';

const VERB: Record<RequestStatus, string> = {
  pending: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

export function RequestTimeline({ requestId }: { requestId: number }) {
  const { data, error } = useAsync<RequestEvent[]>(() => api.events(requestId), [requestId]);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading history…</p>;
  return (
    <ol aria-label="Approval history">
      {data.map((e) => (
        <li key={e.id}>
          {VERB[e.toStatus]} by {e.actorName} · {new Date(e.createdAt).toLocaleString()}
          {e.note && ` — ${e.note}`}
        </li>
      ))}
    </ol>
  );
}
