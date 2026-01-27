/**
 * Experimental Routes
 * 
 * Routes that are experimental, A/B tests, or demos
 * These should be DEV-gated for production safety
 */

import React from 'react';
import { Route } from 'react-router-dom';
import InvestorSlideshow from '../pages/InvestorSlideshow';
import DemoSummarizer from '../pages/DemoSummarizer';
import FoodValidatorAB from '../pages/FoodValidatorAB';
import BatchFoodValidator from '../pages/BatchFoodValidator';
import RunxConquest from '../pages/RunxConquest';
import CampaignRunner from '../pages/CampaignRunner';
import { pik3caTrinityCampaignConfig } from '../config/campaigns/pik3ca_trinity_campaign_config';

/**
 * Experimental Routes - DEV-Gated
 * 
 * TIER 4: Routes that should only be available in development
 * These are wrapped in import.meta.env.DEV check in App.jsx
 * 
 * Note: These routes are exported as a function that returns routes conditionally
 */
export const getExperimentalRoutes = () => {
  if (!import.meta.env.DEV) {
    return [];
  }
  
  return [
    <Route key="investor-slideshow" path="/investor-slideshow" element={<InvestorSlideshow />} />,
    <Route key="demo-summarizer" path="/demo-summarizer" element={<DemoSummarizer />} />,
    <Route key="food-validator" path="/food-validator" element={<FoodValidatorAB />} />,
    <Route key="batch-food-validator" path="/batch-food-validator" element={<BatchFoodValidator />} />,
    <Route key="runx-conquest" path="/runx-conquest" element={<RunxConquest />} />,
    <Route key="runx-conquest-demo" path="/runx-conquest/:demoId" element={<RunxConquest />} />,
    <Route 
      key="campaign-pik3ca" 
      path="/campaigns/pik3ca-de-risking" 
      element={<CampaignRunner config={pik3caTrinityCampaignConfig} />} 
    />,
  ];
};

// Export route definitions for documentation
export const experimentalRouteDefinitions = [
  {
    path: '/investor-slideshow',
    component: 'InvestorSlideshow',
    reason: 'Demo only - investor presentations',
  },
  {
    path: '/demo-summarizer',
    component: 'DemoSummarizer',
    reason: 'Demo only - demo summarization tool',
  },
  {
    path: '/food-validator',
    component: 'FoodValidatorAB',
    reason: 'Experimental A/B test - food validation',
  },
  {
    path: '/batch-food-validator',
    component: 'BatchFoodValidator',
    reason: 'Experimental - batch food validation',
  },
  {
    path: '/runx-conquest',
    component: 'RunxConquest',
    reason: 'Campaign demo - RUNX conquest campaign',
  },
  {
    path: '/campaigns/pik3ca-de-risking',
    component: 'CampaignRunner',
    reason: 'Campaign demo - PIK3CA de-risking campaign',
  },
];
