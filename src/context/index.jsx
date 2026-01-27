import React, { createContext, useContext, useState, useCallback } from "react";
import { db } from "../utils/dbConfig"; // Adjust the path to your dbConfig
import { Users, Records } from "../utils/schema"; // Adjust the path to your schema definitions
// import { eq } from "drizzle-orm"; // DISABLED: Database operations moved to backend

// Mock eq function for compatibility
const eq = (column, value) => ({ column, value });

// Create a context
const StateContext = createContext();

// Log environment variables at the module level for early diagnosis
// Note: VITE_WS_ROOT is optional - only needed if WebSocket features are used
if (import.meta.env.DEV) {
  console.log('[Context] VITE_WS_ROOT:', import.meta.env.VITE_WS_ROOT);
  console.log('[Context] All env vars:', JSON.stringify(import.meta.env, null, 2));
}

// Mock current user data if no login system is active
const MOCK_USER = {
  id: "mock_user_001", // Or any preferred mock ID, like "dr_a"
  name: "Dr. Mock A.",
  email: "mock.user@example.com",
  // Add any other fields your components might expect on currentUser
};

// Provider component
export const StateContextProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  // Initialize currentUser with mock data if there's no login
  const [currentUser, setCurrentUser] = useState(MOCK_USER);
  
  console.log("[StateContext Provider] Initial currentUser:", currentUser);

  // Define mainWsUrl here using the environment variable
  // Fallback to a local default if VITE_WS_ROOT is not set, with a warning.
  let mainWsUrl = null;
  if (import.meta.env.VITE_WS_ROOT) {
    mainWsUrl = `${import.meta.env.VITE_WS_ROOT}/ws`; // Assuming /ws is the general endpoint
  } else {
    console.warn("[StateContext] VITE_WS_ROOT is not defined. WebSocket connections originating from context will likely fail or use incorrect fallbacks if any component tries to use mainWsUrl without it being properly set through environment variables.");
    // Optionally, you could set a local fallback FOR DEVELOPMENT ONLY if absolutely needed,
    // but it's better to ensure VITE_WS_ROOT is always set.
    // mainWsUrl = 'ws://localhost:8008/ws'; // EXAMPLE DEVELOPMENT FALLBACK ONLY
  }
  console.log('[StateContext Provider] mainWsUrl initialized to:', mainWsUrl);

  // Function to fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const result = await db.select().from(Users).execute();
      setUsers(result);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  // Function to fetch user details by email - will be overridden by mock initially
  const fetchUserByEmail = useCallback(async (email) => {
    console.log("[StateContext] fetchUserByEmail called. If using mock user, this might not be effective unless mock is cleared.")
    try {
      const result = await db
        .select()
        .from(Users)
        .where(eq(Users.createdBy, email))
        .execute();
      if (result.length > 0) {
        setCurrentUser(result[0]);
      } else {
        // If no user found by email, and we were relying on this after a login,
        // you might want to setCurrentUser(null) or handle as an error.
        // For now, if mock is set, it stays unless explicitly cleared/overwritten.
      }
    } catch (error) {
      console.error("Error fetching user by email:", error);
    }
  }, []);

  // Function to create a new user
  const createUser = useCallback(async (userData) => {
    try {
      const newUser = await db
        .insert(Users)
        .values(userData)
        .returning({ id: Users.id, createdBy: Users.createdBy })
        .execute();
      setUsers((prevUsers) => [...prevUsers, newUser[0]]);
      return newUser[0];
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }, []);

  // Function to fetch all records for a specific user
  const fetchUserRecords = useCallback(async (userEmail) => {
    try {
      const result = await db
        .select()
        .from(Records)
        .where(eq(Records.createdBy, userEmail))
        .execute();
      setRecords(result);
    } catch (error) {
      console.error("Error fetching user records:", error);
    }
  }, []);

  // Function to create a new record
  const createRecord = useCallback(async (recordData) => {
    try {
      const newRecord = await db
        .insert(Records)
        .values(recordData)
        .returning({ id: Records.id })
        .execute();
      setRecords((prevRecords) => [...prevRecords, newRecord[0]]);
      return newRecord[0];
    } catch (error) {
      console.error("Error creating record:", error);
      return null;
    }
  }, []);

  const updateRecord = useCallback(async (recordData) => {
    try {
      const { documentID, ...dataToUpdate } = recordData;
      console.log(documentID, dataToUpdate);
      const updatedRecords = await db
        .update(Records)
        .set(dataToUpdate)
        .where(eq(Records.id, documentID))
        .returning();
    } catch (error) {
      console.error("Error updating record:", error);
      return null;
    }
  }, []);

  return (
    <StateContext.Provider
      value={{
        users,
        records,
        fetchUsers,
        fetchUserByEmail,
        createUser,
        fetchUserRecords,
        createRecord,
        currentUser, // This will now be the MOCK_USER initially
        setCurrentUser, // Provide setCurrentUser if you want to manually override mock later
        updateRecord,
        mainWsUrl, // Provide mainWsUrl in the context
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

// Custom hook to use the context
export const useStateContext = () => useContext(StateContext);
