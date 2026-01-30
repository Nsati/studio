
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from './Logo';

describe('Logo Component', () => {
  it('renders correctly', () => {
    const { container } = render(<Logo />);
    // Check if the SVG element is present
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
  });

  it('has the correct background styling', () => {
    const { container } = render(<Logo />);
    const logoContainer = container.firstChild;
    expect(logoContainer).toHaveClass('bg-primary');
    expect(logoContainer).toHaveClass('rounded-lg');
  });
});
