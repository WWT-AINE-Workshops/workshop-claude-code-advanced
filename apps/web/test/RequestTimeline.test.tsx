import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RequestTimeline } from '../src/components/RequestTimeline';

afterEach(() => vi.unstubAllGlobals());

describe('RequestTimeline', () => {
  it('lists each status change with who did it and any note', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify([
              {
                id: 1,
                requestId: 7,
                actorId: 1,
                actorName: 'Ava Patel',
                fromStatus: null,
                toStatus: 'pending',
                note: null,
                createdAt: '2026-09-01T14:00:00.000Z',
              },
              {
                id: 2,
                requestId: 7,
                actorId: 2,
                actorName: 'Ben Okafor',
                fromStatus: 'pending',
                toStatus: 'rejected',
                note: 'No budget',
                createdAt: '2026-09-02T16:00:00.000Z',
              },
            ]),
          ),
      ),
    );
    render(<RequestTimeline requestId={7} />);
    const list = await screen.findByRole('list', { name: 'Approval history' });
    const items = within(list).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent(/^Submitted by Ava Patel/);
    expect(items[1]).toHaveTextContent(/^Rejected by Ben Okafor/);
    expect(items[1]).toHaveTextContent('— No budget');
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/requests/7/events');
  });
});
