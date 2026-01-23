import React from 'react';
import { Slide } from '../common/SlideComponents'; // Corrected path

const TitleSlide = () => (
  <Slide className="bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center max-w-4xl">
      <div className="text-6xl mb-6">🧬</div>
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        CrisPRO Oncology Co-Pilot
      </h1>
      <h2 className="text-2xl text-gray-600 mb-8">
        Revolutionizing Cancer Care Through AI-Powered Precision Medicine
      </h2>
      <div className="text-lg text-gray-500 mb-8">
        Empowering oncologists with intelligent agents for genomic analysis, clinical trials matching, and personalized treatment planning
      </div>
      <div className="text-sm text-gray-400">
        Confidential • For Investor Review • {new Date().getFullYear()}
      </div>
    </div>
  </Slide>
);

export default TitleSlide; 