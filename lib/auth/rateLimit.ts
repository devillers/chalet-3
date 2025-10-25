const loginAttempts = new Map<
  string,
  { count: number; resetTime: number; blockedUntil?: number }
>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    loginAttempts.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { allowed: true };
  }

  if (record.blockedUntil && now < record.blockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.blockedUntil - now) / 1000),
    };
  }

  if (now > record.resetTime) {
    loginAttempts.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    loginAttempts.set(identifier, record);
    return {
      allowed: false,
      retryAfter: Math.ceil(BLOCK_DURATION_MS / 1000),
    };
  }

  record.count += 1;
  loginAttempts.set(identifier, record);
  return { allowed: true };
}

export function resetRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}

setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  loginAttempts.forEach((record, key) => {
    if (now > record.resetTime && (!record.blockedUntil || now > record.blockedUntil)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => loginAttempts.delete(key));
}, 60 * 1000);
