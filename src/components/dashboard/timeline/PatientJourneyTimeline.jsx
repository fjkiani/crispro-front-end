import React from 'react';
import './PatientJourneyTimeline.css';

const PatientJourneyTimeline = ({ patientData }) => {
  if (!patientData) {
    return <div>Loading patient journey...</div>;
  }

  // Combine and sort all relevant events by date
  const events = [];

  // Diagnosis Event
  if (patientData.diagnosis) {
    events.push({
      date: patientData.diagnosis.date_of_diagnosis,
      type: 'Diagnosis',
      title: `Diagnosis: ${patientData.diagnosis.primary}`,
      details: `Stage ${patientData.diagnosis.stage}, ${patientData.diagnosis.histology}`,
      icon: 'diagnosis',
    });
  }
  
  // Germline Mutation Event (using a date shortly after diagnosis for now)
  if (patientData.germline_mutations && patientData.germline_mutations.length > 0) {
      const germlineEventDate = new Date(patientData.diagnosis.date_of_diagnosis);
      germlineEventDate.setDate(germlineEventDate.getDate() + 7);
      events.push({
          date: germlineEventDate.toISOString().split('T')[0],
          type: 'Genomics',
          title: 'Germline Test Result',
          details: `Found ${patientData.germline_mutations.map(m => `${m.hugo_gene_symbol} ${m.protein_change}`).join(', ')}`,
          icon: 'genomics',
      })
  }

  // Treatment Events
  if (patientData.treatments) {
    patientData.treatments.forEach(treatment => {
      events.push({
        date: treatment.start_date,
        type: 'Treatment',
        title: `Started ${treatment.name} (${treatment.type})`,
        details: `Response: ${treatment.response || 'Ongoing'}`,
        icon: 'treatment',
      });
      if (treatment.end_date) {
        events.push({
          date: treatment.end_date,
          type: 'Treatment',
          title: `Ended ${treatment.name}`,
          details: `Reason: ${treatment.notes || 'Completed'}`,
          icon: 'treatment',
        });
      }
    });
  }

  // Liquid Biopsy Events
  if (patientData.liquid_biopsies) {
    patientData.liquid_biopsies.forEach(biopsy => {
      events.push({
        date: biopsy.date,
        type: 'Monitoring',
        title: `Liquid Biopsy Result: ${biopsy.status}`,
        details: biopsy.detected_mutations.length > 0
          ? `Detected: ${biopsy.detected_mutations.map(m => `${m.hugo_gene_symbol} ${m.protein_change} (AF: ${m.allele_frequency})`).join(', ')}`
          : 'No significant mutations detected.',
        icon: 'monitoring',
        status: biopsy.status,
      });
    });
  }

  // Sort events chronologically
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  const getEventStyle = (event) => {
    const style = { icon: '🗓️', color: '#6b7280' }; // default
    switch(event.type) {
      case 'Diagnosis':
        style.icon = '🩺';
        style.color = '#3b82f6'; // blue
        break;
      case 'Genomics':
        style.icon = '🧬';
        style.color = '#8b5cf6'; // violet
        break;

      case 'Treatment':
        style.icon = '💊';
        style.color = '#10b981'; // green
        break;
      case 'Monitoring':
        style.icon = '🩸';
        if (event.status === 'Resistance Detected') {
            style.color = '#ef4444'; // red
        } else if (event.status === 'Treatment Responding') {
            style.color = '#22c55e'; // lime
        } else {
            style.color = '#f97316'; // orange
        }
        break;
      default:
        break;
    }
    return style;
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>Patient Journey: {patientData.demographics?.first_name} {patientData.demographics?.last_name}</h2>
      </div>
      <div className="timeline">
        {events.map((event, index) => {
          const { icon, color } = getEventStyle(event);
          const statusClass = event.status ? event.status.toLowerCase().replace(/ /g, '-') : '';

          return (
            <button key={index} className={`timeline-item-wrapper ${index % 2 === 0 ? 'left' : 'right'}`}>
              <div className={`timeline-item ${statusClass}`}>
                <div className="timeline-content">
                  <div className="timeline-date">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div className="timeline-title">
                    <span className="timeline-icon">{icon}</span>
                    <h3>{event.title}</h3>
                  </div>
                  <p className="timeline-details">{event.details}</p>
                  <span className="timeline-circle" style={{ borderColor: color }}></span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PatientJourneyTimeline; 