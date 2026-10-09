import { z } from 'zod';

export function readConfig(env = process.env) {
  const schema = z.object({
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    MONGO_URI: z.string().min(1),
    JWT_SECRET: z.string().min(48),
    CLIENT_URL: z.url().default('http://localhost:5173'),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
    GROQ_API_KEY: z.string().default(''),
    GROQ_MODEL: z.string().default(''),
  });
  const result = schema.safeParse(env);
  if (!result.success) {
    // Report field names only: never print configuration values.
    throw new Error(`Invalid configuration: ${result.error.issues.map(i => i.path.join('.')).join(', ')}`);
  }
  return result.data;
}
