/**
 * exportCarePlanJSON - Export care plan result as JSON file
 * 
 * @param {Object} result - Care plan result object
 * @param {string} filename - Optional filename (defaults to ayesha_care_plan_{run_id}.json)
 */

export const exportCarePlanJSON = (result, filename = null) => {
  if (!result) return;
  
  const dataStr = JSON.stringify(result, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `ayesha_care_plan_${result.run_id || Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export default exportCarePlanJSON;
