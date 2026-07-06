// eslint-disable-next-line @typescript-eslint/no-require-imports
import { neon } from '@neondatabase/serverless'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: any = neon(import.meta.env.VITE_NEON_DATABASE_URL)
