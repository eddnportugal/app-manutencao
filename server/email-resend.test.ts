import { describe, it, expect } from 'vitest';
import { testEmailConnection, isEmailConfigured } from './_core/email';

describe('Email Service - Resend Connection', () => {
  it('should have Resend API Key configured', () => {
    const configured = isEmailConfigured();
    expect(configured).toBe(true);
  });

  it('should successfully connect to Resend API', async () => {
    const result = await testEmailConnection();

    if (!result.success) {
      console.error('Resend Connection Error:', result.error);
    }

    expect(result.success).toBe(true);
  }, 30000); // 30 second timeout
});
