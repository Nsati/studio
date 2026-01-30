
import { describe, it, expect } from 'vitest';
import { normalizeTimestamp } from './firestore-utils';
import { Timestamp } from 'firebase/firestore';

describe('normalizeTimestamp', () => {
  it('should handle null or undefined input', () => {
    const result = normalizeTimestamp(null);
    expect(isNaN(result.getTime())).toBe(true);
    
    const result2 = normalizeTimestamp(undefined);
    expect(isNaN(result2.getTime())).toBe(true);
  });

  it('should handle Firestore Timestamp object', () => {
    // Mock a Firestore Timestamp
    const mockTimestamp = {
      toDate: () => new Date('2024-01-01T10:00:00Z'),
      seconds: 1704103200,
      nanoseconds: 0
    };
    const result = normalizeTimestamp(mockTimestamp);
    expect(result.toISOString()).toBe('2024-01-01T10:00:00.000Z');
  });

  it('should handle JavaScript Date object', () => {
    const date = new Date('2024-02-02T12:00:00Z');
    const result = normalizeTimestamp(date);
    expect(result.getTime()).toBe(date.getTime());
  });

  it('should handle ISO string', () => {
    const isoString = '2024-03-03T15:30:00Z';
    const result = normalizeTimestamp(isoString);
    expect(result.toISOString()).toBe('2024-03-03T15:30:00.000Z');
  });

  it('should handle numeric timestamp', () => {
    const numericTs = 1711929600000; // 2024-04-01
    const result = normalizeTimestamp(numericTs);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(3); // April is 3
  });

  it('should return invalid date for random strings', () => {
    const result = normalizeTimestamp('not-a-date');
    expect(isNaN(result.getTime())).toBe(true);
  });
});
