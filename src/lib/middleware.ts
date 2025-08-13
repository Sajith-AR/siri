import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "./rateLimit";
import { validateApiKey } from "./auth";
import { logRequest } from "./logging";

export interface ApiContext {
  req: NextRequest;
  userId?: string;
  apiKey?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

export function withMiddleware(
  handler: (context: ApiContext) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    rateLimit?: {
      requests: number;
      windowMs: number;
    };
    validateInput?: (data: any) => { isValid: boolean; errors?: string[] };
  } = {}
) {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    let context: ApiContext = { req };

    try {
      // Log incoming request
      await logRequest(req, 'incoming');

      // Rate limiting
      if (options.rateLimit) {
        const rateLimitResult = await rateLimit(
          req,
          options.rateLimit.requests,
          options.rateLimit.windowMs
        );

        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              retryAfter: rateLimitResult.retryAfter,
              limit: options.rateLimit.requests,
              windowMs: options.rateLimit.windowMs
            },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': options.rateLimit.requests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': rateLimitResult.retryAfter.toString(),
                'Retry-After': rateLimitResult.retryAfter.toString()
              }
            }
          );
        }

        context.rateLimitInfo = {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        };
      }

      // Authentication
      if (options.requireAuth) {
        const authResult = await validateApiKey(req);
        if (!authResult.valid) {
          return NextResponse.json(
            { error: "Unauthorized", message: authResult.error },
            { status: 401 }
          );
        }
        context.userId = authResult.userId;
        context.apiKey = authResult.apiKey;
      }

      // Input validation for POST/PUT requests is handled in the route handler
      // to avoid reading the body twice

      // Execute the handler
      const response = await handler(context);

      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Add rate limit headers
      if (context.rateLimitInfo) {
        response.headers.set('X-RateLimit-Remaining', context.rateLimitInfo.remaining.toString());
        response.headers.set('X-RateLimit-Reset', context.rateLimitInfo.resetTime.toString());
      }

      // Log successful response
      const duration = Date.now() - startTime;
      await logRequest(req, 'success', { duration, status: response.status });

      return response;

    } catch (error) {
      // Log error
      const duration = Date.now() - startTime;
      await logRequest(req, 'error', { duration, error: error instanceof Error ? error.message : 'Unknown error' });

      console.error('API Error:', error);

      // Return structured error response
      if (error instanceof Error) {
        return NextResponse.json(
          {
            error: "Internal server error",
            message: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong",
            timestamp: new Date().toISOString(),
            requestId: generateRequestId()
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: "Internal server error",
          timestamp: new Date().toISOString(),
          requestId: generateRequestId()
        },
        { status: 500 }
      );
    }
  };
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}