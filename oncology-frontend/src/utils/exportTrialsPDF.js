/**
 * exportTrialsPDF Utility
 * 
 * Simple browser-based PDF export for trial summaries (top 10 trials).
 * Opens print dialog for user to save as PDF.
 * 
 * @param {Array} trials - Array of trial objects
 */
export const exportTrialsPDF = (trials) => {
  if (!trials || trials.length === 0) {
    alert('No trials to export');
    return;
  }

  // Limit to top 10 trials for PDF size
  const trialsToExport = trials.slice(0, 10);
  const remainingCount = trials.length - 10;

  // Create HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Clinical Trials Summary</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        h1 {
          color: #1976d2;
          border-bottom: 2px solid #1976d2;
          padding-bottom: 10px;
        }
        .trial {
          margin-bottom: 30px;
          page-break-inside: avoid;
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
        }
        .trial-header {
          background: #f5f5f5;
          padding: 10px;
          margin: -15px -15px 10px -15px;
          border-bottom: 1px solid #ddd;
        }
        .trial-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }
        .trial-meta {
          font-size: 12px;
          color: #666;
        }
        .location {
          margin-left: 20px;
          margin-top: 10px;
          padding: 8px;
          background: #f9f9f9;
          border-left: 3px solid #1976d2;
        }
        .location-name {
          font-weight: bold;
        }
        .contact-info {
          margin-top: 5px;
          font-size: 11px;
          color: #555;
        }
        .footer {
          margin-top: 50px;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        @media print {
          body { margin: 20px; }
          .trial { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>Clinical Trials Summary</h1>
      <p><strong>Found ${trials.length} matching trials</strong></p>
      ${remainingCount > 0 ? `<p><em>Showing top 10 trials (${remainingCount} more available)</em></p>` : ''}
      
      ${trialsToExport.map((trial, idx) => {
        // Parse locations if available
        let locations = [];
        try {
          if (trial.locations_data) {
            locations = typeof trial.locations_data === 'string' 
              ? JSON.parse(trial.locations_data) 
              : trial.locations_data;
          }
        } catch (e) {
          console.error('Error parsing locations_data:', e);
        }

        return `
          <div class="trial">
            <div class="trial-header">
              <div class="trial-title">${(idx + 1)}. ${trial.title || trial.briefTitle || 'Untitled Trial'}</div>
              <div class="trial-meta">
                NCT ID: ${trial.nct_id || trial.nctId || 'N/A'} | 
                Status: ${trial.status || 'Unknown'} | 
                Phase: ${trial.phase || 'N/A'}
              </div>
            </div>
            
            ${trial.description_text || trial.briefSummary ? `
              <p><strong>Description:</strong> ${(trial.description_text || trial.briefSummary || '').substring(0, 300)}${(trial.description_text || trial.briefSummary || '').length > 300 ? '...' : ''}</p>
            ` : ''}
            
            ${locations && locations.length > 0 ? `
              <div style="margin-top: 10px;">
                <strong>📍 Locations (${locations.length}):</strong>
                ${locations.slice(0, 3).map(loc => `
                  <div class="location">
                    <div class="location-name">${loc.facility || 'Unknown Facility'}</div>
                    <div>${loc.city || ''}${loc.city && loc.state ? ', ' : ''}${loc.state || ''} ${loc.zip || ''}</div>
                    ${loc.contact_phone || loc.contact_email ? `
                      <div class="contact-info">
                        ${loc.contact_name ? `Contact: ${loc.contact_name}<br>` : ''}
                        ${loc.contact_phone ? `Phone: ${loc.contact_phone}<br>` : ''}
                        ${loc.contact_email ? `Email: ${loc.contact_email}` : ''}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
                ${locations.length > 3 ? `<p style="margin-left: 20px; font-size: 11px; color: #666;">+ ${locations.length - 3} more locations</p>` : ''}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
      
      <div class="footer">
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Source:</strong> ClinicalTrials.gov via CrisPRO Platform</p>
        <p><em><strong>Research Use Only - Not for Clinical Enrollment</strong></em></p>
      </div>
    </body>
    </html>
  `;

  // Open new window with HTML content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print dialog
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
};

export default exportTrialsPDF;

