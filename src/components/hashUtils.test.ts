import { describe, it, expect } from 'vitest';
import { hashPassword } from './hashUtils';

describe('hashUtils.hashPassword', () => {
  it('returns base64 of the password (demo only)', () => {
    const pwd = 'secret123!';
    const hashed = hashPassword(pwd);
    // btoa of 'secret123!'
    expect(hashed).toBe(btoa(pwd));
  });

  it('is deterministic for the same input', () => {
    const pwd = 'abc';
    expect(hashPassword(pwd)).toBe(hashPassword(pwd));
  });
});
