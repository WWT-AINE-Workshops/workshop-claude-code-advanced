import type { RequestStatus } from '@copperline/shared';

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className="badge" data-status={status}>
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}
