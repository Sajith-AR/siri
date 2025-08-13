import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

export interface AuthResult {
  valid: boolean;
  userId?: string;
  apiKey?: string;
  error?: string;
  permissions?: string[];
}

export async function validateApiKey(req: NextRequest): Promise<AuthResult> {
  try {
    // Check for API key in header
    const apiKey = req.headers.get('x-api-key');
    if (apiKey) {
      return await validateStaticApiKey(apiKey);
    }

    // Check for JWT token
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return await validateJwtToken(token);
    }

    return {
      valid: false,
      error: "No authentication provided"
    };

  } catch (error) {
    return {
      valid: false,
      error: "Authentication failed"
    };
  }
}

async function validateStaticApiKey(apiKey: string): Promise<AuthResult> {
  // In production, store these in database with proper hashing
  const validApiKeys = new Map([
    ['sk_test_healthcare_demo_key', { userId: 'demo_user', permissions: ['read', 'write'] }],
    ['sk_prod_healthcare_admin', { userId: 'admin_user', permissions: ['read', 'write', 'admin'] }]
  ]);

  const keyData = validApiKeys.get(apiKey);
  if (!keyData) {
    return {
      valid: false,
      error: "Invalid API key"
    };
  }

  return {
    valid: true,
    userId: keyData.userId,
    apiKey,
    permissions: keyData.permissions
  };
}

async function validateJwtToken(token: string): Promise<AuthResult> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      valid: true,
      userId: payload.sub as string,
      permissions: payload.permissions as string[] || ['read']
    };
  } catch (error) {
    return {
      valid: false,
      error: "Invalid or expired token"
    };
  }
}

export async function generateJwtToken(
  userId: string,
  permissions: string[] = ['read'],
  expiresIn: string = '24h'
): Promise<string> {
  const expirationTime = getExpirationTime(expiresIn);
  
  return await new SignJWT({ permissions })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .setSubject(userId)
    .sign(JWT_SECRET);
}

function getExpirationTime(expiresIn: string): number {
  const now = Math.floor(Date.now() / 1000);
  const units: { [key: string]: number } = {
    's': 1,
    'm': 60,
    'h': 3600,
    'd': 86400
  };

  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid expiration format');
  }

  const [, amount, unit] = match;
  return now + (parseInt(amount) * units[unit]);
}

export function generateApiKey(prefix: string = 'sk'): string {
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString('hex');
  return `${prefix}_${key}`;
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Permission checking utilities
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('admin');
}

export function requirePermission(permissions: string[], required: string): void {
  if (!hasPermission(permissions, required)) {
    throw new Error(`Insufficient permissions. Required: ${required}`);
  }
}