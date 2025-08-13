import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { FeaturesSection } from './FeaturesSection';

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

describe('FeaturesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock = vi.fn();
  });

  it('renders heading and navigates to /subscribe on Get Started', () => {
    render(<FeaturesSection />);
    expect(screen.getByRole('heading', { name: /powerful features/i })).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(button);
    expect(navigateMock).toHaveBeenCalledWith('/subscribe');
  });
});
