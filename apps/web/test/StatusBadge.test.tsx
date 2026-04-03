import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from '../src/components/StatusBadge';

describe('StatusBadge', () => {
  it('shows a capitalized label and exposes the status for styling', () => {
    render(<StatusBadge status="approved" />);
    const badge = screen.getByText('Approved');
    expect(badge).toHaveAttribute('data-status', 'approved');
  });
});
