import React from 'react';
import KanbanBoard from '../../KanbanBoard';

const PatientWorkflowTab = ({ workflowTasks, handleTaskMove }) => {
    const workflowColumns = [
        { id: 'review_required', title: 'Review Required' },
        { id: 'contacting_site', title: 'Contacting Site' },
        { id: 'applied', title: 'Applied' },
        { id: 'discarded', title: 'Discarded' }
    ];

    return (
        <div className="h-[600px] border border-gray-200 rounded-lg p-4 bg-gray-50">
            <KanbanBoard
                columns={workflowColumns}
                tasks={workflowTasks}
                onTaskMove={handleTaskMove}
            />
        </div>
    );
};

export default PatientWorkflowTab;
