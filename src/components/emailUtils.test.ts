import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendVerificationEmail } from './emailUtils';

describe('sendVerificationEmail', () => {
  //

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the expected verification message', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const email = 'user@example.com';
    const token = 'test-token-123';

    await sendVerificationEmail(email, token);

    expect(logSpy).toHaveBeenCalledTimes(1);
    const msg = logSpy.mock.calls[0][0];
    expect(String(msg)).toContain(email);
    expect(String(msg)).toContain(token);
  });
});
