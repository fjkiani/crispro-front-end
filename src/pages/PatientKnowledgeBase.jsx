/**
 * PatientKnowledgeBase - Full Knowledge Base Page
 * 
 * Standalone page for patient knowledge base management.
 * Route: /patient/knowledge-base
 * 
 * Research Use Only - Not for Clinical Decision Making
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import PatientKBDashboard from '../components/patient/PatientKBDashboard';
import { AYESHA_11_17_25_PROFILE } from '../constants/patients';

export default function PatientKnowledgeBase() {
  const { patientId } = useParams();
  
  // For now, use Ayesha profile as default
  // In production, load from patient context
  const patientProfile = AYESHA_11_17_25_PROFILE;
  const effectivePatientId = patientId || patientProfile.patient.patient_id || 'ayesha_11_17_25';

  return (
    <PatientKBDashboard 
      patientId={effectivePatientId}
      patientProfile={patientProfile}
    />
  );
}
