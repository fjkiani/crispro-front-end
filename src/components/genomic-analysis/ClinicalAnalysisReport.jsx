import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { Science, Gavel, Healing, Article } from '@mui/icons-material';

const ClinicalAnalysisReport = ({ analysis }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const tabs = [
        {
            label: "Abstract",
            icon: <Article />,
            content: analysis.scientific_abstract,
        },
        {
            label: "Mechanism",
            icon: <Science />,
            content: analysis.mechanism_of_action,
        },
        {
            label: "Significance",
            icon: <Gavel />,
            content: analysis.clinical_significance,
        },
        {
            label: "Therapeutics",
            icon: <Healing />,
            content: analysis.therapeutic_implications,
        },
    ];

    return (
        <Box sx={{ my: 3 }}>
            <Typography variant="h6" gutterBottom>Clinical Dossier (AI Analyst)</Typography>
            <Paper>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    {tabs.map((tab, index) => (
                        <Tab 
                            key={index} 
                            icon={tab.icon} 
                            label={tab.label} 
                            sx={{ textTransform: 'none' }} 
                        />
                    ))}
                </Tabs>
                <Box sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    {tabs.map((tab, index) => (
                        <Typography 
                            key={index}
                            variant="body1"
                            hidden={activeTab !== index}
                        >
                            {tab.content}
                        </Typography>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

export default ClinicalAnalysisReport; 