
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge tailwind classes correctly', () => {
    expect(cn('p-4', 'bg-red-500')).toBe('p-4 bg-red-500');
  });

  it('should handle conditional classes', () => {
    expect(cn('p-4', true && 'bg-blue-500', false && 'text-white')).toBe('p-4 bg-blue-500');
  });

  it('should resolve tailwind conflicts', () => {
    // tailwind-merge should prefer the last class
    expect(cn('px-2 py-2', 'p-4')).toBe('p-4');
  });
});
