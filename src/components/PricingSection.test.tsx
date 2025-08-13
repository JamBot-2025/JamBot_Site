import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PricingSection } from './PricingSection';

let navigateMock: any;
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => {
      navigateMock = vi.fn();
      return navigateMock;
    },
  };
});

describe('PricingSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock = vi.fn();
  });

  it('navigates to /subscribe on click', () => {
    render(<PricingSection />);
    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(navigateMock).toHaveBeenCalledWith('/subscribe');
  });

  it('navigates to /subscribe on Enter keydown', () => {
    render(<PricingSection />);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(navigateMock).toHaveBeenCalledWith('/subscribe');
  });
});
