/**
 * API Layer Tests
 * 
 * Tests for response helpers, validation schemas, and error handling.
 * Note: Full integration tests with Supabase require a test database.
 */

import { describe, it, expect } from 'vitest';
import { success, failure, isSuccess, isFailure } from '@/lib/api/response';
import { API_ERRORS, getHttpStatus } from '@/lib/api/errors';
import {
  createMemberSchema,
  updateMemberSchema,
  searchMembersSchema,
} from '@/lib/api/validation';
import { MemberTier, MemberStatus, MemberRole } from '@/types/member';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE HELPER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Response Helpers', () => {
  describe('success()', () => {
    it('should create a success response', () => {
      const data = { id: '123', name: 'John' };
      const response = success(data);

      expect(response.ok).toBe(true);
      expect(response.data).toEqual(data);
    });

    it('should work with any data type', () => {
      const stringResponse = success('test string');
      const numberResponse = success(42);
      const arrayResponse = success([1, 2, 3]);

      expect(stringResponse.data).toBe('test string');
      expect(numberResponse.data).toBe(42);
      expect(arrayResponse.data).toEqual([1, 2, 3]);
    });
  });

  describe('failure()', () => {
    it('should create a failure response', () => {
      const response = failure(API_ERRORS.NOT_FOUND, 'Item not found');

      expect(response.ok).toBe(false);
      expect(response.error.code).toBe(API_ERRORS.NOT_FOUND);
      expect(response.error.message).toBe('Item not found');
    });

    it('should support all error codes', () => {
      const codes = [
        API_ERRORS.UNAUTHENTICATED,
        API_ERRORS.FORBIDDEN,
        API_ERRORS.NOT_FOUND,
        API_ERRORS.VALIDATION_ERROR,
        API_ERRORS.DATABASE_ERROR,
        API_ERRORS.UNKNOWN_ERROR,
      ];

      codes.forEach((code) => {
        const response = failure(code, 'Test error');
        expect(response.error.code).toBe(code);
      });
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify success responses', () => {
      const successResponse = success({ id: '1' });
      const failureResponse = failure(API_ERRORS.NOT_FOUND, 'Not found');

      expect(isSuccess(successResponse)).toBe(true);
      expect(isFailure(successResponse)).toBe(false);

      expect(isSuccess(failureResponse)).toBe(false);
      expect(isFailure(failureResponse)).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Error Handling', () => {
  describe('getHttpStatus()', () => {
    it('should map error codes to HTTP status codes', () => {
      expect(getHttpStatus(API_ERRORS.UNAUTHENTICATED)).toBe(401);
      expect(getHttpStatus(API_ERRORS.FORBIDDEN)).toBe(403);
      expect(getHttpStatus(API_ERRORS.NOT_FOUND)).toBe(404);
      expect(getHttpStatus(API_ERRORS.VALIDATION_ERROR)).toBe(400);
      expect(getHttpStatus(API_ERRORS.DATABASE_ERROR)).toBe(500);
      expect(getHttpStatus(API_ERRORS.UNKNOWN_ERROR)).toBe(500);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMA TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Validation Schemas', () => {
  describe('createMemberSchema', () => {
    it('should validate a complete valid member', () => {
      const valid = {
        email: 'test@example.com',
        name: 'John Doe',
        tier: MemberTier.PIONEER,
        status: MemberStatus.ACTIVE,
        role: MemberRole.MEMBER,
        title: 'Engineer',
        location: 'Austin, TX',
        member_since: '2024-01-01',
      };

      const result = createMemberSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should use default values for tier, status, and role', () => {
      const minimal = {
        email: 'test@example.com',
        name: 'John Doe',
      };

      const result = createMemberSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tier).toBe(MemberTier.EXPLORER);
        expect(result.data.status).toBe(MemberStatus.PENDING);
        expect(result.data.role).toBe(MemberRole.MEMBER);
      }
    });

    it('should reject invalid email', () => {
      const invalid = {
        email: 'not-an-email',
        name: 'John Doe',
      };

      const result = createMemberSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const incomplete = {
        email: 'test@example.com',
        // missing name
      };

      const result = createMemberSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should reject invalid tier', () => {
      const invalid = {
        email: 'test@example.com',
        name: 'John Doe',
        tier: 'InvalidTier',
      };

      const result = createMemberSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should allow null optional fields', () => {
      const valid = {
        email: 'test@example.com',
        name: 'John Doe',
        title: null,
        location: null,
        member_since: null,
      };

      const result = createMemberSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('updateMemberSchema', () => {
    it('should allow partial updates', () => {
      const partial = {
        name: 'Jane Doe',
      };

      const result = updateMemberSchema.safeParse(partial);
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const empty = {};

      const result = updateMemberSchema.safeParse(empty);
      expect(result.success).toBe(true);
    });

    it('should validate email if provided', () => {
      const invalid = {
        email: 'invalid-email',
      };

      const result = updateMemberSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate date format if provided', () => {
      const validDate = {
        member_since: '2024-01-15',
      };

      const invalidDate = {
        member_since: '01/15/2024',
      };

      expect(updateMemberSchema.safeParse(validDate).success).toBe(true);
      expect(updateMemberSchema.safeParse(invalidDate).success).toBe(false);
    });
  });

  describe('searchMembersSchema', () => {
    it('should validate valid search params', () => {
      const params = {
        query: 'john',
        status: MemberStatus.ACTIVE,
        tier: MemberTier.PIONEER,
        limit: 50,
        offset: 0,
      };

      const result = searchMembersSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should use default limit and offset', () => {
      const params = {};

      const result = searchMembersSchema.safeParse(params);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(0);
      }
    });

    it('should reject invalid limit', () => {
      const invalid = {
        limit: 2000, // exceeds max of 1000
      };

      const result = searchMembersSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject negative offset', () => {
      const invalid = {
        offset: -1,
      };

      const result = searchMembersSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should allow empty query', () => {
      const params = {
        query: '',
      };

      const result = searchMembersSchema.safeParse(params);
      expect(result.success).toBe(true);
    });
  });
});
