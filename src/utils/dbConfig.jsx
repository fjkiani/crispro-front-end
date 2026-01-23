// DISABLED: Client-side database connections are not secure and cause runtime errors.
// Database operations should be performed via backend API endpoints.
// This mock prevents the app from crashing while database functionality is moved to the backend.

// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";
// import * as schema from "./schema";
// const sql = neon(
//   "postgresql://finan-smart_owner:uk3aed9QZotj@ep-wispy-breeze-a5iadk8t.us-east-2.aws.neon.tech/beat-cancer?sslmode=require"
// );
// export const db = drizzle(sql, { schema });

// Mock database object that throws helpful errors
export const db = {
  select: () => ({
    from: () => ({
      where: () => ({
        execute: async () => {
          console.warn('[dbConfig] Database operations are disabled. Please use backend API endpoints instead.');
          return [];
        }
      }),
      execute: async () => {
        console.warn('[dbConfig] Database operations are disabled. Please use backend API endpoints instead.');
        return [];
      }
    })
  }),
  insert: () => ({
    values: () => ({
      returning: () => ({
        execute: async () => {
          console.warn('[dbConfig] Database operations are disabled. Please use backend API endpoints instead.');
          return [];
        }
      }),
      execute: async () => {
        console.warn('[dbConfig] Database operations are disabled. Please use backend API endpoints instead.');
        return [];
      }
    })
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: async () => {
          console.warn('[dbConfig] Database operations are disabled. Please use backend API endpoints instead.');
          return [];
        }
      })
    })
  })
};
