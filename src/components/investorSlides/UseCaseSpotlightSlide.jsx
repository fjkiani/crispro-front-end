import React from 'react';
import { Slide } from '../common/SlideComponents';

const UseCaseSpotlightSlide = ({
  headline = "Default Use Case Headline",
  scenario = "Default Scenario Description",
  problem = { title: "Problem", icon: null, description: "", iconColor: "text-red-700" },
  platformInAction = { title: "Platform In Action", icon: null, steps: [], iconColor: "text-blue-700" },
  outcome = { title: "Outcome", icon: null, description: "", iconColor: "text-green-700" },
}) => {
  const ProblemIcon = problem.icon;
  const ActionIcon = platformInAction.icon;
  const OutcomeIcon = outcome.icon;

  return (
    <Slide className="bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 text-center">{headline}</h1>
        <p className="text-lg text-gray-600 mb-10 text-center italic">{scenario}</p>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Problem Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200">
            {ProblemIcon && <ProblemIcon className={`w-10 h-10 ${problem.iconColor} mx-auto mb-3`} />}
            <h3 className={`text-xl font-semibold ${problem.iconColor} mb-2 text-center`}>{problem.title}</h3>
            <p className="text-sm text-gray-700 text-center">{problem.description}</p>
          </div>

          {/* Platform in Action Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
            {ActionIcon && <ActionIcon className={`w-10 h-10 ${platformInAction.iconColor} mx-auto mb-3`} />}
            <h3 className={`text-xl font-semibold ${platformInAction.iconColor} mb-2 text-center`}>{platformInAction.title}</h3>
            <ul className="list-decimal list-inside text-sm text-gray-700 space-y-2 text-left">
              {platformInAction.steps.map((step, index) => <li key={index}>{step}</li>)}
            </ul>
          </div>

          {/* Outcome Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-green-200">
            {OutcomeIcon && <OutcomeIcon className={`w-10 h-10 ${outcome.iconColor} mx-auto mb-3`} />}
            <h3 className={`text-xl font-semibold ${outcome.iconColor} mb-2 text-center`}>{outcome.title}</h3>
            <p className="text-sm text-gray-700 text-center">{outcome.description}</p>
          </div>
        </div>
      </div>
    </Slide>
  );
};

export default UseCaseSpotlightSlide; 