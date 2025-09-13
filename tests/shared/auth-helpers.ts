/**
 * Shared Authentication Helpers
 * Framework-agnostic utilities for authentication testing
 * Can be used by both Vitest and Playwright tests
 */

import { getTestEnvironment as getCentralizedTestEnv, testConfig } from '@/config/environment'
import { isValidEmail } from '@/lib/validation'

export interface TestCredentials {
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'manager';
}

export interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Get test credentials from environment variables
 */
export function getTestCredentials(): TestCredentials | null {
  const email = testConfig.userEmail;
  const password = testConfig.userPassword;
  const role = testConfig.userRole;
  
  if (!email || !password) {
    return null;
  }
  
  return { email, password, role };
}


/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Generate test user data
 */
export function generateTestUser(overrides: Partial<TestCredentials> = {}): TestCredentials {
  const timestamp = Date.now();
  
  return {
    email: `test-user-${timestamp}@example.com`,
    password: 'TestPassword123!',
    role: 'user',
    ...overrides,
  };
}

/**
 * Parse authentication state from storage
 */
export function parseAuthState(authData: string): AuthState | null {
  try {
    const parsed = JSON.parse(authData);
    
    return {
      isAuthenticated: !!parsed.token || !!parsed.user,
      token: parsed.token,
      user: parsed.user,
    };
  } catch {
    return null;
  }
}

/**
 * Environment configuration helpers
 */
export function getTestEnvironment(): {
  baseURL: string;
  isCI: boolean;
  environment: string;
} {
  const centralizedEnv = getCentralizedTestEnv();
  return {
    baseURL: centralizedEnv.baseURL,
    isCI: centralizedEnv.isCI,
    environment: centralizedEnv.environment,
  };
}

/**
 * Wait utility for tests
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry utility for flaky operations
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error = new Error('Retry operation failed');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        break;
      }
      
      await wait(delay * attempt); // Exponential backoff
    }
  }
  
  throw lastError;
}
