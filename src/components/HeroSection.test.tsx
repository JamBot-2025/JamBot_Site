import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { HeroSection } from './HeroSection';

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

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock = vi.fn();
  });

  it('navigates to /subscribe when clicking Get Started', () => {
    render(<HeroSection />);
    const btn = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(btn);
    expect(navigateMock).toHaveBeenCalledWith('/subscribe');
  });
});
