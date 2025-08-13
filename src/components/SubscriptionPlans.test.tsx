import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SubscriptionPlans } from './SubscriptionPlans';

describe('SubscriptionPlans', () => {
  it('calls onSelect with basic when clicking first Select Plan', () => {
    const onSelect = vi.fn();
    render(<SubscriptionPlans onSelect={onSelect} />);
    const buttons = screen.getAllByRole('button', { name: /select plan/i });
    fireEvent.click(buttons[0]);
    expect(onSelect).toHaveBeenCalledWith('basic');
  });
});
