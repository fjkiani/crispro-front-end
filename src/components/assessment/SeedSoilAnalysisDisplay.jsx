import React from 'react';

const Section = ({ title, children }) => (
  <div className="bg-gray-800 p-4 rounded-lg mb-4">
    <h3 className="text-xl font-bold text-green-400 mb-2">{title}</h3>
    {children}
  </div>
);

const KeyValue = ({ label, value }) => (
  <div className="mb-1">
    <span className="font-semibold text-gray-400">{label}: </span>
    <span className="text-white">{value}</span>
  </div>
);

const ThreatAssessmentSummary = ({ data }) => {
  if (!data) return <p className="text-gray-500">No initial threat assessment data available.</p>;
  return (
    <div>
      <KeyValue label="Threat Level" value={data.threat_level} />
      <p className="mt-2 text-gray-300">{data.summary}</p>
    </div>
  );
};

const ProfileDisplay = ({ profile, title }) => {
  if (!profile || !profile.essentiality_profile) return <p className="text-gray-500">No {title} data available.</p>;
  return (
    <div>
      <h4 className="font-bold text-lg mb-2 text-cyan-400">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
        {profile.essentiality_profile.slice(0, 6).map((gene, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded">
            <KeyValue label={gene.target_gene} value={gene.essentiality_score.toFixed(3)} />
          </div>
        ))}
      </div>
    </div>
  );
}

const ThreatReportDisplay = ({ report }) => {
  if (!report || !report.synthetic_lethalities) return <p className="text-gray-500">No threat report data available.</p>;
  return (
    <div>
      <KeyValue label="Synthetic Lethalities Found" value={report.synthetic_lethalities_identified} />
      <div className="mt-2">
        {report.synthetic_lethalities.map((lethal, index) => (
          <div key={index} className="bg-red-900 bg-opacity-20 p-3 rounded mt-2">
            <h5 className="font-bold text-red-400">{lethal.gene}</h5>
            <p className="text-sm text-gray-300">Vulnerability Increase: {lethal.vulnerability_increase.toFixed(3)}</p>
            <p className="text-xs text-gray-400 mt-1">{lethal.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


const SeedSoilAnalysisDisplay = ({ data }) => {
  if (!data || !data.stages) {
    return <p className="text-yellow-400">Awaiting analysis results...</p>;
  }

  const { stages } = data;

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-purple-400">Seed & Soil Campaign Report</h2>
      
      <Section title="Stage 1: Initial Threat Assessment">
        <ThreatAssessmentSummary data={stages.initial_threat_assessment} />
      </Section>

      <Section title="Stage 2: Digital Twin Creation (Metastatic Site Baseline)">
        <ProfileDisplay profile={stages.digital_twin_creation} title="Baseline Soil Profile" />
      </Section>

      <Section title="Stage 3: Invasion Simulation">
        <ProfileDisplay profile={stages.invasion_simulation} title="Pathogen-Stressed Soil Profile" />
      </Section>
      
      <Section title="Stage 4: Synthetic Lethality Analysis">
        <ThreatReportDisplay report={stages.threat_report} />
      </Section>

    </div>
  );
};

export default SeedSoilAnalysisDisplay; 