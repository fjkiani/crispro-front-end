import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_CLASSES } from './constants.jsx';

const VUSHeader = ({ 
    title = "VUS Explorer (research‑mode)",
    patientId,
    actions = [],
    className = DEFAULT_CLASSES.header
}) => {
    const navigate = useNavigate();

    const defaultActions = [
        {
            label: "Patient Record",
            onClick: () => navigate(`/medical-records/${patientId}`),
            condition: !!patientId
        }
    ];

    const allActions = [...defaultActions, ...actions];

    return (
        <div className={className}>
            <button 
                onClick={() => navigate(-1)} 
                className={DEFAULT_CLASSES.button}
            >
                &larr; Back
            </button>
            <h1 className="text-3xl font-bold text-center text-purple-400 flex-grow">
                {title}
            </h1>
            <div>
                {allActions
                    .filter(action => !action.condition || action.condition)
                    .map((action, index) => (
                        <button 
                            key={index}
                            onClick={action.onClick} 
                            className={`ml-2 ${DEFAULT_CLASSES.button} ${action.className || ''}`}
                        >
                            {action.label}
                        </button>
                    ))
                }
            </div>
        </div>
    );
};

export default VUSHeader;
