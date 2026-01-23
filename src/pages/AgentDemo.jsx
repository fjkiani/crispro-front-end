import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AgentDemo = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agentData, setAgentData] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [demoHistory, setDemoHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Agent definitions (in a real app, this would come from an API)
  const agentDefinitions = {
    data_analyzer: {
      name: "Data Analysis Agent",
      description: "Analyzes patient data to generate clinical summaries and answer specific questions",
      placeholder: "What is the patient's current clinical status?",
      examples: [
        "Summarize the patient's diagnosis history",
        "What were the findings on the last CT scan?",
        "Interpret recent lab results"
      ],
      apiEndpoint: "/api/agents/data-analysis"
    },
    clinical_trial_finder: {
      name: "Clinical Trial Agent",
      description: "Finds relevant clinical trials based on patient diagnosis and profile",
      placeholder: "Find clinical trials for...",
      examples: [
        "Find trials for Stage II breast cancer",
        "Search for immunotherapy trials for melanoma",
        "Are there any trials for EGFR+ lung cancer?"
      ],
      apiEndpoint: "/api/agents/clinical-trials"
    },
    notifier: {
      name: "Notification Agent",
      description: "Drafts professional notifications to other healthcare providers",
      placeholder: "Draft a notification about...",
      examples: [
        "Draft notification to PCP about abnormal liver function",
        "Urgent referral for cardiology",
        "Create follow-up reminder for 3 months"
      ],
      apiEndpoint: "/api/agents/notifications"
    },
    scheduler: {
      name: "Scheduling Agent",
      description: "Helps find available appointment slots and book appointments",
      placeholder: "Schedule or find appointments...",
      examples: [
        "Find available oncology slots next week",
        "Schedule a follow-up in 6 weeks",
        "When is the next available imaging slot?"
      ],
      apiEndpoint: "/api/agents/scheduling"
    },
    side_effect_manager: {
      name: "Side Effect Agent",
      description: "Identifies potential medication side effects and suggests management tips",
      placeholder: "What are side effects of...",
      examples: [
        "What are common side effects of letrozole?",
        "How to manage diarrhea from immunotherapy?",
        "Check for interactions between lisinopril and metformin"
      ],
      apiEndpoint: "/api/agents/side-effects"
    },
    referral_drafter: {
      name: "Referral Agent",
      description: "Drafts comprehensive referral letters to specialists",
      placeholder: "Draft a referral to...",
      examples: [
        "Create cardiology referral for arrhythmia evaluation",
        "Draft urgent neurology consult for numbness",
        "Generate oncology referral for newly diagnosed breast cancer"
      ],
      apiEndpoint: "/api/agents/referrals"
    }
  };

  // Mock API response - in a real app this would be an actual API call
  const mockApiResponse = (prompt, agentId) => {
    const responses = {
      data_analyzer: [
        "Based on the patient's records, they were diagnosed with Stage III invasive ductal carcinoma in February 2023. Treatment began with neoadjuvant chemotherapy, followed by surgical resection in May. Currently on adjuvant hormonal therapy with Letrozole started in July 2023. The patient also has hypertension and type 2 diabetes, both well-controlled on current medications.",
        "The most recent CT scan from June 28, 2023 showed complete response to therapy with no evidence of residual disease. There was mild post-surgical change in the left breast consistent with prior lumpectomy.",
        "Recent lab results show WBC 5.2, Hgb 12.8, platelets 210. Liver function is within normal limits with AST 24, ALT 32. Kidney function is stable with creatinine of 0.8 mg/dL."
      ],
      clinical_trial_finder: [
        "Found 3 potential trials for Stage II breast cancer:\n\n1. NCT04852887: \"Adjuvant Palbociclib for Early Stage Breast Cancer\" (Phase III). Status: Recruiting. Location: 5 miles from patient.\n\n2. NCT04158271: \"Ribociclib + ET for HR+ Early Breast Cancer\" (Phase II). Status: Recruiting. Location: 12 miles from patient.\n\n3. NCT04546009: \"Immunotherapy Combination for Triple Negative Breast Cancer\" (Phase II). Status: Recruiting. Location: 8 miles from patient.",
        "Located 2 active immunotherapy trials for melanoma:\n\n1. NCT05288218: \"Nivolumab + Ipilimumab for Advanced Melanoma\" (Phase III). Status: Recruiting. Location: 3 miles from patient.\n\n2. NCT04652987: \"Novel TIL Therapy for Refractory Melanoma\" (Phase II). Status: Recruiting. Location: 20 miles from patient.",
        "4 trials found for EGFR+ lung cancer:\n\n1. NCT04718571: \"Osimertinib + Novel Agent XB-235 for EGFR+ NSCLC\" (Phase II). Status: Recruiting. Location: 7 miles from patient.\n\n2. NCT04835805: \"Targeting EGFR Resistance Mechanisms\" (Phase I/II). Status: Recruiting. Location: 15 miles from patient.\n\n3. NCT05107414: \"Adjuvant Therapy for EGFR+ Stage II-IIIA NSCLC\" (Phase III). Status: Recruiting. Location: 10 miles from patient.\n\n4. NCT04858542: \"Novel Bispecific Antibody for EGFR+ NSCLC\" (Phase I). Status: Recruiting. Location: 25 miles from patient."
      ],
      notifier: [
        "DRAFT NOTIFICATION TO PCP\n\nRe: Jane Doe (DOB: 03/15/1958)\n\nDear Dr. Smith,\n\nI am writing to inform you about recent abnormal liver function tests for our mutual patient, Jane Doe, whom I am following for breast cancer. Recent labs from 07/15/2023 show elevated transaminases: AST 78 (ref: 10-40) and ALT 92 (ref: 7-56).\n\nThe patient is currently on adjuvant Letrozole which was started 3 months ago. She denies any symptoms of liver dysfunction. I have recommended repeat testing in 2 weeks and temporary cessation of her statin therapy which could be contributing.\n\nPlease let me know if you wish to evaluate further from your end or if you have additional suggestions for management.\n\nSincerely,\nDr. Johnson\nMedical Oncology",
        "URGENT CARDIOLOGY REFERRAL\n\nPatient: Jane Doe (DOB: 03/15/1958)\nReason for Referral: New onset atrial fibrillation with rapid ventricular response\n\nClinical Information:\nPatient is a 65-year-old female with history of Stage III breast cancer on adjuvant Letrozole. Presented today with palpitations and dizziness. ECG showed atrial fibrillation with rate of 142. BP 138/85. O2 sat 98% on room air. No chest pain. Recent echo (3 months ago) showed preserved EF of 60% with mild LVH.\n\nCurrent medications include Letrozole 2.5mg daily, Lisinopril 10mg daily, Metformin 1000mg BID.\n\nPatient has been started on metoprolol 25mg BID for rate control and requires urgent cardiology evaluation.\n\nPlease contact me directly with any questions.\n\nSincerely,\nDr. Johnson\nMedical Oncology",
        "FOLLOW-UP REMINDER\n\nPatient: Jane Doe (DOB: 03/15/1958)\nDiagnosis: Stage III Breast Cancer, s/p surgery and chemo, on adjuvant hormonal therapy\n\nRecommendation:\nSchedule follow-up in 3 months (approximately October 2023) for:\n- Symptom check and physical exam\n- CBC, CMP\n- Medication review\n- Consider scheduling annual mammogram if not done in last 9 months\n\nNote: Patient to continue Letrozole 2.5mg daily. Monitor for joint pain, hot flashes, and bone density. DEXA scan to be scheduled at 1-year mark of hormonal therapy (July 2024)."
      ],
      scheduler: [
        "Available oncology slots for next week:\n\nDr. Johnson (Medical Oncology):\n- Monday, July 24: 9:00 AM, 2:30 PM\n- Wednesday, July 26: 10:15 AM, 3:45 PM\n- Friday, July 28: 8:30 AM, 1:00 PM\n\nDr. Williams (Surgical Oncology):\n- Tuesday, July 25: 11:30 AM, 4:00 PM\n- Thursday, July 27: 9:45 AM, 2:00 PM\n\nDr. Chen (Radiation Oncology):\n- Monday, July 24: 11:00 AM, 3:15 PM\n- Thursday, July 27: 10:30 AM, 2:45 PM",
        "Follow-up appointment scheduled:\n\nPatient: Jane Doe\nProvider: Dr. Johnson (Medical Oncology)\nDate: September 7, 2023 (6 weeks from today)\nTime: 10:30 AM\nLocation: North Campus, Building C, Suite 240\n\nAppointment details sent to patient via preferred contact method. Pre-appointment labs ordered for September 5, 2023.",
        "Next available imaging slots:\n\nMammogram:\n- Tomorrow, July 21: 3:30 PM (URGENT slot)\n- Monday, July 24: 9:15 AM, 1:45 PM, 4:30 PM\n- Tuesday, July 25: 10:00 AM, 2:30 PM\n\nCT Scan (with contrast):\n- Monday, July 24: 11:30 AM, 3:00 PM\n- Wednesday, July 26: 9:00 AM, 2:15 PM\n\nMRI (breast):\n- Thursday, July 27: 10:45 AM, 2:00 PM\n- Friday, July 28: 9:30 AM, 1:15 PM\n\nWould you like to book any of these slots?"
      ],
      side_effect_manager: [
        "Common side effects of Letrozole include:\n\n1. Joint/muscle pain (arthralgia/myalgia) - occurs in up to 25% of patients\n2. Hot flashes - very common (50-75% of patients)\n3. Fatigue\n4. Mild nausea\n5. Headache\n6. Bone density loss (long-term)\n7. Elevated cholesterol levels\n\nManagement recommendations:\n- For joint pain: gentle exercise, NSAIDs if not contraindicated\n- For hot flashes: layered clothing, avoiding triggers (caffeine, alcohol, spicy foods)\n- For bone health: calcium/vitamin D supplements, weight-bearing exercise\n- Regular monitoring of cholesterol levels\n\nContact your healthcare provider if symptoms are severe or interfering with daily activities.",
        "Managing diarrhea from immunotherapy:\n\n1. Stay hydrated - drink at least 8-10 glasses of fluid daily (water, broth, electrolyte solutions)\n2. Follow BRAT diet during episodes (Bananas, Rice, Applesauce, Toast)\n3. Avoid triggers: spicy foods, high-fiber foods, dairy, alcohol, caffeine\n4. Over-the-counter options: loperamide (Imodium) can be used for mild symptoms\n\nIMPORTANT: Unlike chemotherapy-related diarrhea, immunotherapy-related diarrhea can be a sign of immune-mediated colitis, which requires prompt medical attention.\n\nSeek immediate medical care if:\n- Diarrhea persists more than 24 hours\n- Severe abdominal pain develops\n- Blood in stool\n- Fever occurs with diarrhea\n\nYour oncologist may prescribe corticosteroids if immune-mediated colitis is suspected.",
        "Potential interaction check between Lisinopril and Metformin:\n\nInteraction severity: Mild to Moderate\n\nEffects:\n1. Both medications can lower blood pressure, potentially leading to additive hypotensive effects\n2. Both can affect kidney function and potassium levels\n3. Risk of hypoglycemia may be increased\n\nMonitoring recommendations:\n- Regular blood pressure checks\n- Periodic kidney function tests\n- Monitor for symptoms of hypoglycemia (shakiness, dizziness, confusion)\n- Check potassium levels periodically\n\nThis combination is commonly used in patients with both hypertension and type 2 diabetes, and generally considered safe with appropriate monitoring. No dosage adjustment is typically required, but patients should report symptoms of hypotension or hypoglycemia promptly."
      ],
      referral_drafter: [
        "CARDIOLOGY REFERRAL\n\nDate: July 20, 2023\n\nRe: Jane Doe (DOB: 03/15/1958)\nMRN: 12345678\n\nDear Dr. Wilson,\n\nI am referring Ms. Doe for cardiology evaluation of arrhythmia detected during routine follow-up.\n\nRELEVANT HISTORY:\nMs. Doe is a 65-year-old female with history of Stage III breast cancer diagnosed in February 2023, treated with neoadjuvant chemotherapy (dose-dense AC-T completed May 2023), followed by lumpectomy with sentinel node biopsy. She is currently on adjuvant Letrozole started July 2023. Additional medical history includes hypertension (diagnosed 2015) and type 2 diabetes (diagnosed 2018), both well-controlled on current medications.\n\nPRESENTING ISSUE:\nDuring her routine oncology follow-up today, patient reported occasional palpitations occurring over the past 2 weeks, particularly with exertion. Office ECG showed frequent premature atrial contractions and a 5-second run of atrial fibrillation. Patient denies chest pain, syncope, or dyspnea. BP today was 142/88, HR 88 and irregular.\n\nCURRENT MEDICATIONS:\n1. Letrozole 2.5mg daily\n2. Lisinopril 10mg daily\n3. Metformin 1000mg BID\n4. Multivitamin daily\n\nRECENT RELEVANT STUDIES:\n- Pre-chemotherapy echo (Feb 2023): Normal EF 65%, no significant valvular disease\n- Recent labs (July 10, 2023): Normal electrolytes, BUN/Cr 15/0.8, normal TSH\n\nREQUEST:\nPlease evaluate for cause of new arrhythmia and recommend appropriate management. Given her recent chemotherapy exposure, we are particularly concerned about potential cardiotoxicity, though her anthracycline dose was within standard limits.\n\nThank you for seeing this patient. Please do not hesitate to contact me if you require additional information.\n\nSincerely,\n\nDr. Johnson\nMedical Oncology\nPhone: 555-123-4567\nEmail: johnson@cancercenter.org",
        "URGENT NEUROLOGY CONSULTATION\n\nDate: July 20, 2023\n\nRe: Jane Doe (DOB: 03/15/1958)\nMRN: 12345678\n\nDear Dr. Patel,\n\nI am urgently referring Ms. Doe for neurological evaluation of new onset left-sided numbness and weakness.\n\nRELEVANT HISTORY:\nMs. Doe is a 65-year-old female with history of Stage III breast cancer diagnosed in February 2023, currently on adjuvant Letrozole after completing neoadjuvant chemotherapy and surgery. Additional medical history includes hypertension and type 2 diabetes.\n\nPRESENTING ISSUE:\nPatient presented today with new onset left arm and face numbness that began suddenly 4 hours ago. She reports mild weakness in left hand grip and slight facial asymmetry noted by her daughter this morning. No headache, visual changes, speech disturbance, or confusion. No recent falls or trauma. BP elevated at 162/94, HR 84 regular, afebrile.\n\nNEUROLOGIC EXAMINATION:\nAlert and oriented x3. Mild left facial droop. Left arm drift present. Left grip strength 4/5 compared to 5/5 on right. Sensation diminished to light touch on left arm and face. Speech clear, no dysarthria noted. No ataxia.\n\nACTIONS TAKEN:\nPatient sent directly to ER for immediate evaluation with suspected TIA or CVA. Instructed ER team to perform STAT CT/CTA. This referral is for urgent outpatient follow-up after ER evaluation is complete.\n\nThank you for your prompt attention to this patient.\n\nSincerely,\n\nDr. Johnson\nMedical Oncology\nPhone: 555-123-4567 (cell for urgent matters)\nEmail: johnson@cancercenter.org",
        "ONCOLOGY REFERRAL\n\nDate: July 20, 2023\n\nRe: Jane Doe (DOB: 03/15/1958)\nMRN: 12345678\n\nDear Dr. Martinez,\n\nI am referring Ms. Doe for oncology evaluation and management of newly diagnosed breast cancer.\n\nRELEVANT HISTORY:\nMs. Doe is a 65-year-old female with no significant past medical history except for hypertension and type 2 diabetes, both well-controlled on current medications. No prior history of cancer. Family history significant for breast cancer in mother (diagnosed age 70) and maternal aunt (diagnosed age 65).\n\nPRESENTING ISSUE:\nPatient felt a lump in her left breast during self-examination. Diagnostic mammogram and ultrasound performed on July 10, 2023, revealed a 2.8 cm irregular mass at 2 o'clock position, 5 cm from the nipple. Ultrasound also identified suspicious left axillary lymphadenopathy with largest node measuring 1.5 cm.\n\nDIAGNOSTIC STUDIES:\n- Core needle biopsy (July 15, 2023): Invasive ductal carcinoma, grade 2.\n- Immunohistochemistry: ER 95% positive, PR 80% positive, HER2 negative (IHC 1+)\n- Axillary lymph node FNA: Positive for metastatic carcinoma\n- Staging CT chest/abdomen/pelvis (July 18, 2023): No evidence of distant metastases\n- DEXA scan (July 18, 2023): T-score -1.2 (osteopenia)\n\nCURRENT MEDICATIONS:\n1. Lisinopril 10mg daily\n2. Metformin 1000mg BID\n3. Multivitamin daily\n\nREQUEST:\nPlease evaluate for appropriate management of what appears to be Stage IIB (cT2N1M0) hormone-receptor positive, HER2-negative breast cancer. Patient is anxious to begin treatment and has expressed interest in clinical trials if appropriate.\n\nThank you for seeing this patient. She has been advised of this referral and will contact your office to schedule an appointment. Please let me know if you require additional information.\n\nSincerely,\n\nDr. Johnson\nPrimary Care Physician\nPhone: 555-123-4567\nEmail: johnson@primarycare.org"
      ]
    };

    // Randomly select a response based on the agent ID
    const possibleResponses = responses[agentId] || ["No response available for this agent type."];
    const randomIndex = Math.floor(Math.random() * possibleResponses.length);
    
    return possibleResponses[randomIndex];
  };

  useEffect(() => {
    // Get agent data based on the agent ID
    if (agentId && agentDefinitions[agentId]) {
      setAgentData(agentDefinitions[agentId]);
    } else {
      // Redirect to agent dashboard if agent ID is invalid
      navigate("/agent-dashboard");
    }
  }, [agentId, navigate]);

  const handleExampleClick = (example) => {
    setUserInput(example);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    // Add user message to history
    const userMessage = {
      role: "user",
      content: userInput,
      timestamp: new Date().toISOString()
    };
    
    setDemoHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // await fetch(agentData.apiEndpoint, { method: 'POST', body: JSON.stringify({ prompt: userInput }) });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get mock response
      const responseContent = mockApiResponse(userInput, agentId);
      
      // Add response to history
      const agentMessage = {
        role: "agent",
        content: responseContent,
        timestamp: new Date().toISOString()
      };
      
      setDemoHistory(prev => [...prev, agentMessage]);
      setUserInput("");
    } catch (error) {
      console.error("Error submitting to agent:", error);
      
      // Add error message to history
      const errorMessage = {
        role: "system",
        content: "There was an error processing your request. Please try again.",
        timestamp: new Date().toISOString()
      };
      
      setDemoHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!agentData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading agent details...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{agentData.name}</h1>
            <p className="text-gray-600">{agentData.description}</p>
          </div>
          <button
            onClick={() => navigate("/agent-dashboard")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Example Queries</h2>
        <div className="flex flex-wrap gap-2">
          {agentData.examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(example)}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition text-sm"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          {demoHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mb-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                />
              </svg>
              <p>No conversation history yet. Try asking the {agentData.name.toLowerCase()} a question!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {demoHistory.map((message, idx) => (
                <div 
                  key={idx} 
                  className={`${
                    message.role === "user" 
                      ? "bg-blue-50 ml-12" 
                      : message.role === "agent" 
                        ? "bg-gray-50 mr-12" 
                        : "bg-red-50 mx-12"
                  } p-3 rounded-lg`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {message.role === "user" 
                        ? "You" 
                        : message.role === "agent" 
                          ? agentData.name 
                          : "System"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-50 mr-12 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{agentData.name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={agentData.placeholder || "Type your message..."}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
              disabled={isLoading || !userInput.trim()}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentDemo; 