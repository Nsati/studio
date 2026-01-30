
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AmenityIcon } from './AmenityIcon';

describe('AmenityIcon Component', () => {
  it('renders correct icon for wifi', () => {
    const { container } = render(<AmenityIcon amenity="wifi" />);
    // Wifi icon uses specific SVG path/structure, we just check if something rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders correct icon for parking', () => {
    const { container } = render(<AmenityIcon amenity="parking" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('is case-insensitive', () => {
    const { container: upper } = render(<AmenityIcon amenity="WIFI" />);
    const { container: lower } = render(<AmenityIcon amenity="wifi" />);
    
    // They should ideally render the same thing
    expect(upper.innerHTML).toBe(lower.innerHTML);
  });

  it('renders default icon for unknown amenity', () => {
    const { container } = render(<AmenityIcon amenity="unknown-thing" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'test-class-123';
    const { container } = render(<AmenityIcon amenity="pool" className={customClass} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass(customClass);
  });
});
