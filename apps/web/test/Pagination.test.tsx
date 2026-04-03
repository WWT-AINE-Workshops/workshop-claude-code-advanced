import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '../src/components/Pagination';

describe('Pagination', () => {
  it('shows the position and disables Previous on the first page', () => {
    render(<Pagination page={1} pageSize={10} total={25} onChange={() => {}} />);
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('disables Next on the last page', () => {
    render(<Pagination page={3} pageSize={10} total={25} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('asks for the next page', async () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pageSize={10} total={25} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('treats an empty list as one page', () => {
    render(<Pagination page={1} pageSize={10} total={0} onChange={() => {}} />);
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });
});
