// DISABLED: Client-side database connections are not secure and cause runtime errors.
// Database operations should be performed via backend API endpoints.

// import { drizzle } from 'drizzle-orm/neon-serverless';
// import { Pool } from '@neondatabase/serverless';
// import * as schema from './schema';

// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle(pool, { schema });

// Mock database object that throws helpful errors
export const db = {
  select: () => ({
    from: () => ({
      execute: async () => {
        console.warn('[db.js] Database operations are disabled. Please use backend API endpoints instead.');
        return [];
      }
    })
  }),
  insert: () => ({
    values: () => ({
      returning: () => ({
        execute: async () => {
          console.warn('[db.js] Database operations are disabled. Please use backend API endpoints instead.');
          return [];
        }
      }),
      execute: async () => {
        console.warn('[db.js] Database operations are disabled. Please use backend API endpoints instead.');
        return [];
      }
    })
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: async () => {
          console.warn('[db.js] Database operations are disabled. Please use backend API endpoints instead.');
          return [];
        }
      })
    })
  })
}; 