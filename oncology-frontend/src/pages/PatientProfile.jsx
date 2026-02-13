import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import { useCoPilot } from '../components/CoPilot/context'; // ⚔️ Phase 9: CoPilot Integration

/**
 * PatientProfile - Patient profile page
 * 
 * Displays patient information and allows editing of patient profile.
 */
const PatientProfile = () => {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const { currentPatient, patientProfile, setPatientProfile } = usePatient();
  const { setIsOpen, setCurrentPage } = useCoPilot(); // ⚔️ Phase 9
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load patient profile data
    if (user && !authLoading) {
      // TODO: Fetch patient profile from API
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const patient = currentPatient || patientProfile || authProfile;

  return (
    <div className="mx-auto mt-8 max-w-4xl px-4">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-3xl font-semibold text-gray-800">Patient Profile</h1>

        {patient ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-lg text-gray-900">
                {patient.name || patient.full_name || 'Not provided'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-lg text-gray-900">
                {patient.email || user?.email || 'Not provided'}
              </p>
            </div>

            {patient.date_of_birth && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <p className="mt-1 text-lg text-gray-900">{patient.date_of_birth}</p>
              </div>
            )}

            {patient.diagnosis && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                <p className="mt-1 text-lg text-gray-900">{patient.diagnosis}</p>
              </div>
            )}

            <div className="mt-6">
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Edit Profile
              </button>
              <button
                className="ml-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                onClick={() => {
                  setIsOpen(true);
                  setCurrentPage('onboarding');
                }}
              >
                Update via AI Report
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No patient profile found.</p>
            <button
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={() => {
                setIsOpen(true);
                setCurrentPage('onboarding');
              }}
            >
              Analyze Clinical Report (AI)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;

