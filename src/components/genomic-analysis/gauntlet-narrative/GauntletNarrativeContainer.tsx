import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import Stage1_TestEnemyWeapon from './Stage1_TestEnemyWeapon';
import Stage2_DefineVictory from './Stage2_DefineVictory';
import Stage3_ForgeSuperiorWeapon from './Stage3_ForgeSuperiorWeapon';
import FinalDossier from './FinalDossier';

type Stage = 'initial' | 'enemy_tested' | 'benchmark_set' | 'forge_complete';

const GauntletNarrativeContainer = ({ geneData, onComplete, reconData, onRunRecon, isReconLoading }) => {
    const [currentAct, setCurrentAct] = useState(1);
    const [enemyScore, setEnemyScore] = useState(null);
    const [maxImpactScore, setMaxImpactScore] = useState(null);

    const handleAct1Complete = (result) => {
        setEnemyScore(result);
        setCurrentAct(2);
    };

    const handleAct2Complete = (result) => {
        setMaxImpactScore(result);
        setCurrentAct(3);
    };

    const handleAct3Complete = (result) => {
        // The final onComplete from the parent is called here
        onComplete(result);
    };

    return (
        <Box sx={{ mt: 4 }}>
            {currentAct >= 1 && <Stage1_TestEnemyWeapon geneData={geneData} onComplete={handleAct1Complete} />}
            {currentAct >= 2 && <Stage2_DefineVictory geneData={geneData} enemyScore={enemyScore} onComplete={handleAct2Complete} />}
            {currentAct >= 3 && (
                <Stage3_ForgeSuperiorWeapon 
                    geneData={geneData} 
                    onComplete={handleAct3Complete}
                    reconData={reconData}
                    onRunRecon={onRunRecon}
                    isReconLoading={isReconLoading}
                />
            )}
        </Box>
    );
};

export default GauntletNarrativeContainer;
