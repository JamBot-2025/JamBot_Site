import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CTASection } from './CTASection';

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

describe('CTASection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock = vi.fn();
  });

  it('navigates to /subscribe on form submit', () => {
    render(<CTASection />);
    const button = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(button);
    expect(navigateMock).toHaveBeenCalledWith('/subscribe');
  });
});
