import React, { useMemo } from "react";
import { DisplayInfo } from "../components";
import PatientHomeDashboard from "./PatientHomeDashboard";
import { usePersona } from "../context/PersonaContext";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { authenticated, user } = useAuth();
  const { isPatient } = usePersona(); // PersonaProvider should wrap app - hooks must be called unconditionally

  // TEMPORARY: Email-based patient detection for testing (until profile.persona is set properly)
  // TODO: Remove this fallback once user profiles have persona field set correctly
  const emailBasedPatientDetection = useMemo(() => {
    if (!user?.email) return false;
    const email = user.email.toLowerCase();
    // Detect patient emails (ak@ak.com, patient@*, etc.)
    return email === 'ak@ak.com' || email.startsWith('patient@') || email.includes('patient');
  }, [user?.email]);

  const shouldShowPatientDashboard = authenticated && (isPatient || emailBasedPatientDetection);

  // Patient-first: /home becomes the MOAT dashboard for the patient persona.
  if (shouldShowPatientDashboard) {
    return <PatientHomeDashboard />;
  }

  // Fallback: legacy dashboard (non-patient personas)
  return <DisplayInfo />;
};

export default Home;
