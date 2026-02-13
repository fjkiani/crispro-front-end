import React from 'react';
import { Box } from '@mui/material';
import CA125Tracker from '../CA125Tracker';
import NextTestCard from '../NextTestCard';

const MonitoringTab = ({ ca125Intelligence, nextTestRecommender, ca125Value }) => {
  return (
    <Box>
      {/* CA-125 Tracker */}
      {ca125Intelligence && (
        <Box mb={3}>
          <CA125Tracker
            current_value={ca125Value}
            burden_class={ca125Intelligence.burden_class || ca125Intelligence.disease_burden}
            forecast={ca125Intelligence.forecast || ca125Intelligence.expected_response}
            resistance_rule={ca125Intelligence.resistance_signals}
            monitoring_strategy={ca125Intelligence.monitoring_strategy}
          />
        </Box>
      )}

      {/* Next Test Recommender */}
      <Box mb={3}>
        <NextTestCard recommendations={nextTestRecommender?.recommendations || []} />
      </Box>
    </Box>
  );
};

export default MonitoringTab;
