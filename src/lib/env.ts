export const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TWILIO_SID: process.env.TWILIO_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_FROM: process.env.TWILIO_FROM,
  TWILIO_MESSAGING_SERVICE_SID: process.env.TWILIO_MESSAGING_SERVICE_SID,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-not-for-production",
};

export const hasOpenAI = Boolean(env.OPENAI_API_KEY);
export const hasTwilio = Boolean(env.TWILIO_SID && env.TWILIO_AUTH_TOKEN && (env.TWILIO_FROM || env.TWILIO_MESSAGING_SERVICE_SID));


