import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Subscribe from './Subscribe';
import { describe, it, expect } from 'vitest';

describe('Subscribe Page', () => {
  it('renders subscribe page', () => {
    render(<Subscribe />);
    expect(screen.getByText(/subscribe/i)).toBeInTheDocument(); // Adjust to match your UI
  });
});
