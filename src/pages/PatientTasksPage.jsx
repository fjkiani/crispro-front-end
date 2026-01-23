import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard'; // Adjust path if necessary

const KANBAN_TASKS_KEY = 'kanbanTasks';

// Define your default columns here. These could also be loaded from localStorage or a config if they are dynamic.
const defaultColumns = [
  { id: 'followUpNeeded', title: 'Follow-up Needed' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
  // Add other columns as needed by your workflow
];

const PatientTasksPage = () => {
  const { patientId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState(defaultColumns);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) {
      setError("Patient ID not found in URL.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const savedTasksRaw = localStorage.getItem(KANBAN_TASKS_KEY);
      let allTasks = [];
      if (savedTasksRaw) {
        allTasks = JSON.parse(savedTasksRaw);
        if (!Array.isArray(allTasks)) {
          console.error("Stored kanbanTasks is not an array, resetting.");
          allTasks = [];
        }
      }
      
      const filteredTasks = allTasks.filter(task => task.patientId === patientId);
      console.log(`PatientTasksPage: Loaded ${allTasks.length} total tasks, filtered to ${filteredTasks.length} for patient ${patientId}`, filteredTasks);
      setTasks(filteredTasks);

      // For now, columns are static. If you save/load columns from localStorage, do it here.
      // setColumns(loadedColumns || defaultColumns);

    } catch (e) {
      console.error("Failed to load or parse tasks from localStorage:", e);
      setError("Failed to load tasks. Data might be corrupted.");
      setTasks([]); // Clear tasks on error
    } finally {
      setIsLoading(false);
    }
  }, [patientId]); // Reload if patientId changes

  const handleUpdateTask = (taskId, updatedProperties) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updatedProperties } : task
      );
      const allTasksFromStorageRaw = localStorage.getItem(KANBAN_TASKS_KEY);
      let allTasksFromStorage = [];
      if (allTasksFromStorageRaw) {
          try {
              allTasksFromStorage = JSON.parse(allTasksFromStorageRaw);
              if (!Array.isArray(allTasksFromStorage)) allTasksFromStorage = [];
          } catch (e) {
              console.error("Error parsing all tasks from storage for update:", e);
              allTasksFromStorage = [];
          }
      }
      const otherPatientTasks = allTasksFromStorage.filter(t => t.patientId !== patientId);
      localStorage.setItem(KANBAN_TASKS_KEY, JSON.stringify([...otherPatientTasks, ...newTasks.filter(task => task.patientId === patientId)])); // Ensure only current patient's tasks are re-saved if manipulating a global list
      return newTasks;
    });
  };

  // --- Basic handlers for KanbanBoard (can be expanded later) ---
  // These handlers would typically update localStorage and state.
  // For now, they are minimal to get the board displaying.

  const handleTasksChange = (active, over) => {
    // This is a simplified drag-and-drop handler for tasks between columns or reordering
    // A more complete implementation would update the task's columnId or its order
    setTasks((prevTasks) => {
      const activeTaskIndex = prevTasks.findIndex((t) => t.id === active.id);
      if (activeTaskIndex === -1) return prevTasks; // Should not happen
      const overTaskIndex = over?.data.current?.type === 'Task' ? prevTasks.findIndex((t) => t.id === over.id) : -1;
      let newTasks = [...prevTasks];

      if (over?.data.current?.type === 'Column' && newTasks[activeTaskIndex].columnId !== over.id) {
        newTasks[activeTaskIndex] = { ...newTasks[activeTaskIndex], columnId: over.id };
      } else if (overTaskIndex !== -1 && activeTaskIndex !== overTaskIndex) {
        newTasks = arrayMove(newTasks, activeTaskIndex, overTaskIndex);
        if (newTasks[activeTaskIndex].columnId !== newTasks[overTaskIndex].columnId && newTasks[overTaskIndex].columnId !== newTasks[activeTaskIndex].columnId) {
             // This condition seems complex, ensure it correctly reflects desired behavior when dropping task on another task in different column.
             // Often, the target task's column is not changed, only the dragged task's column or position.
        }
      }
      localStorage.setItem(KANBAN_TASKS_KEY, JSON.stringify(newTasks.filter(t => t.patientId === patientId)));
      // If KANBAN_TASKS_KEY stores ALL tasks, then fetch all, update relevant, save all.
      // For simplicity with current design that filters on load:
      const allTasksFromStorageRaw = localStorage.getItem(KANBAN_TASKS_KEY);
      let allTasksFromStorage = [];
      if (allTasksFromStorageRaw) { /* ... parsing ... */ allTasksFromStorage = JSON.parse(allTasksFromStorageRaw); }
      const otherPatientTasks = allTasksFromStorage.filter(t => t.patientId !== patientId);
      localStorage.setItem(KANBAN_TASKS_KEY, JSON.stringify([...otherPatientTasks, ...newTasks]));
      return newTasks;
    });
  };
  
  // Placeholder for arrayMove if not available (e.g., from @dnd-kit/sortable)
  // You might need to import this or implement a simple version
  function arrayMove(array, from, to) {
    const newArray = array.slice();
    const [item] = newArray.splice(from, 1);
    newArray.splice(to, 0, item);
    return newArray;
  }

  // Add more handlers (create, delete, update for tasks and columns) as needed
  // For example:
  const handleCreateTask = (columnId, content) => {
    const newTask = {
      id: `task_${patientId}_${Date.now()}`,
      columnId,
      content: content || "New Task", // Default content
      patientId: patientId,
      // Add other relevant fields like trial_id, suggestion_type, etc. if needed directly here
      // or ensure they are passed if this task is created from a suggestion elsewhere
    };
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      // Update localStorage with all tasks
      const allTasksFromStorageRaw = localStorage.getItem(KANBAN_TASKS_KEY);
      let allTasksFromStorage = [];
      if (allTasksFromStorageRaw) { /* ... parsing ... */ allTasksFromStorage = JSON.parse(allTasksFromStorageRaw);}
      const otherPatientTasks = allTasksFromStorage.filter(t => t.patientId !== patientId);
      localStorage.setItem(KANBAN_TASKS_KEY, JSON.stringify([...otherPatientTasks, ...updatedTasks]));
      return updatedTasks;
    });
  };

  const taskContextSummary = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { trials: [], generalContexts: [] };
    }

    const trialContextsMap = new Map();
    const generalContextsSet = new Set();

    tasks.forEach(task => {
      const context = task.related_criterion?.trim() || task.content?.replace(/^Clarify:\s*/, '').trim();
      if (!context) return;

      if (task.trial_id) {
        if (!trialContextsMap.has(task.trial_id)) {
          trialContextsMap.set(task.trial_id, {
            trialId: task.trial_id,
            trialTitle: task.trial_title || 'N/A', // Assuming trial_title might exist
            contexts: new Set(),
          });
        }
        trialContextsMap.get(task.trial_id).contexts.add(context);
      } else {
        generalContextsSet.add(context);
      }
    });

    const trialsSummary = Array.from(trialContextsMap.values()).map(trial => ({
      ...trial,
      contexts: Array.from(trial.contexts),
    }));

    return {
      trials: trialsSummary,
      generalContexts: Array.from(generalContextsSet),
    };
  }, [tasks]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Follow-up Tasks for Patient: {patientId}</h1>
      
      {(taskContextSummary.trials.length > 0 || taskContextSummary.generalContexts.length > 0) && tasks.length > 0 && (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-md shadow">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Key Contexts for Follow-up:</h2>
          
          {taskContextSummary.trials.map((trial, index) => (
            <div key={trial.trialId || index} className="mb-3 last:mb-0">
              <h3 className="text-md font-semibold text-indigo-700">
                Trial: {trial.trialTitle} <span className="text-sm text-gray-500">({trial.trialId})</span>
              </h3>
              {trial.contexts.length > 0 ? (
                <ul className="list-disc list-inside pl-4 space-y-0.5 mt-1">
                  {trial.contexts.map((context, ctxIndex) => (
                    <li key={ctxIndex} className="text-sm text-slate-600">
                      {context}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic pl-4 mt-1">No specific contexts for this trial.</p>
              )}
            </div>
          ))}

          {taskContextSummary.generalContexts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <h3 className="text-md font-semibold text-slate-600">General Tasks:</h3>
              <ul className="list-disc list-inside pl-4 space-y-0.5 mt-1">
                {taskContextSummary.generalContexts.map((context, index) => (
                  <li key={index} className="text-sm text-slate-600">
                    {context}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {(taskContextSummary.trials.length === 0 && taskContextSummary.generalContexts.length === 0) && (
             <p className="text-sm text-slate-500 italic">No specific contexts identified in current tasks.</p>
          )}
        </div>
      )}
      
      <KanbanBoard 
        columns={columns}
        tasks={tasks}
        onTasksChange={handleTasksChange} 
        onCreateTask={handleCreateTask}   
        onUpdateTask={handleUpdateTask} 
      />
    </div>
  );
};

export default PatientTasksPage; 