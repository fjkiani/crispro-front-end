/**
 * Service to interact with the Backend LLM Router (api/routers/llm.py)
 */

export const fetchDrugExplanation = async (drugName, patientContext) => {
    try {
        const prompt = `
    You are an expert oncologist (Precision Oncology Agent).
    Explain why **${drugName}** is recommended for this patient.
    
    Patient Context:
    - Cancer: Ovarian
    - Biomarkers: ${patientContext.biomarkers.join(', ')}
    - Status: ${patientContext.status}
    
    Specific Match Logic:
    ${patientContext.rationale}
    
    Task:
    - Write 2 clear, professional sentences for a patient/clinician.
    - Focus on the *mechanism* (e.g., "Because you have a BRCA mutation, your tumor cells cannot repair DNA errors efficiently...").
    - Explain 'Synthetic Lethality' simply if applicable.
    - Do NOT mention "Evo2" or internal algorithms.
    `;

        const response = await fetch('/api/llm/explain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                provider: 'gemini',
                context: 'drug_ranking'
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.explanation; // Assuming backend returns { explanation: "text" }
    } catch (error) {
        console.error("Failed to fetch LLM explanation:", error);
        return null; // Return null to fallback to static generation
    }
};
