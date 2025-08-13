export const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TWILIO_SID: process.env.TWILIO_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_FROM: process.env.TWILIO_FROM,
  TWILIO_MESSAGING_SERVICE_SID: process.env.TWILIO_MESSAGING_SERVICE_SID,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-not-for-production",
  DATABASE_URL: process.env.DATABASE_URL || process.env.MONGODB_URI || "mongodb://localhost:27017/healthcare",
  NODE_ENV: process.env.NODE_ENV || "development",
};

export const hasGemini = Boolean(env.GEMINI_API_KEY);
export const hasOpenAI = Boolean(env.OPENAI_API_KEY);
export const hasTwilio = Boolean(env.TWILIO_SID && env.TWILIO_AUTH_TOKEN && (env.TWILIO_FROM || env.TWILIO_MESSAGING_SERVICE_SID));
export const hasDatabase = Boolean(env.DATABASE_URL);
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";


