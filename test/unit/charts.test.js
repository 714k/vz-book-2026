import { describe, expect, it } from 'vitest';
import {
  generateGrowingData,
  generateRandomData,
  generateYears,
} from '../../src/scripts/charts.js';

describe('generateYears', () => {
  it('returns an inclusive range of years', () => {
    expect(generateYears(2020, 2023)).toEqual([2020, 2021, 2022, 2023]);
  });

  it('returns a single year when start equals end', () => {
    expect(generateYears(2020, 2020)).toEqual([2020]);
  });

  it('returns an empty array when start is after end', () => {
    expect(generateYears(2023, 2020)).toEqual([]);
  });
});

describe('generateRandomData', () => {
  it('produces one entry per year in range, within bounds', () => {
    const data = generateRandomData(2020, 2024, 5, 10);

    expect(data).toHaveLength(5);
    data.forEach((entry, index) => {
      expect(entry.year).toBe(2020 + index);
      expect(entry.value).toBeGreaterThanOrEqual(5);
      expect(entry.value).toBeLessThanOrEqual(10);
    });
  });
});

describe('generateGrowingData', () => {
  it('produces a monotonically increasing series starting above startValue', () => {
    const data = generateGrowingData(2020, 2024, 4, 2);

    expect(data).toHaveLength(5);
    let previous = 4;
    for (const entry of data) {
      expect(entry.value).toBeGreaterThan(previous);
      expect(entry.value).toBeLessThanOrEqual(previous + 2);
      previous = entry.value;
    }
  });
});
