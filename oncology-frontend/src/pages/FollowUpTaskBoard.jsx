import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { arrayMove } from "@dnd-kit/sortable";
import KanbanBoard from '../components/KanbanBoard';

console.log('[FollowUpTaskBoard] VITE_API_ROOT:', import.meta.env.VITE_API_ROOT);
const API_BASE_URL = import.meta.env.VITE_API_ROOT;

const defaultCols = [
  { id: "followUpNeeded", title: "Follow-up Needed" },
  { id: "inProgress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const generateId = () => Math.floor(Math.random() * 10001);

// Remove KANBAN_COLUMNS_KEY and KANBAN_TASKS_KEY if not used elsewhere for columns
// const KANBAN_COLUMNS_KEY = 'kanbanFollowUpColumns'; 
// const KANBAN_TASKS_KEY = 'kanbanFollowUpTasks'; // No longer used for tasks

const FollowUpTaskBoard = () => {
  const { patientId } = useParams(); // Keep for potential patient-specific views if this component is reused
  const navigate = useNavigate();

  const [columns, setColumns] = useState(defaultCols); // Columns can remain static or use localStorage if needed
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks from API
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const fetchAllTasks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks`);
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("API did not return an array for tasks:", data);
          throw new Error("Invalid task data format from server.");
        }
        // If on a patient-specific view (patientId is present), filter tasks.
        // Otherwise, show all tasks for the global workload dashboard.
        const relevantTasks = patientId ? data.filter(task => task.patientId === patientId) : data;
        setTasks(relevantTasks);
      } catch (e) {
        console.error("Error fetching tasks from API:", e);
        setError(e.message);
        setTasks([]);
      } finally {
        setIsLoading(false);
    }
    };

    fetchAllTasks();
  }, [patientId]); // Refetch if patientId changes (for when used in patient-specific context)

  // --- Kanban Handler Functions ---
  // Note: Task update functions (addTask, handleTaskMove, handleDeleteTask, handleUpdateTask)
  // will now need to make API calls to persist changes to the backend, instead of just localStorage.
  // For this step, we'll focus on displaying. Persistence will be a follow-up.

  const addTask = useCallback(async (taskText, taskColumnId = 'followUpNeeded', taskPatientId = null) => {
    if (!taskText) return;
    // This is a simplified add. A real version would POST to backend and update state with response.
    const newTask = {
      id: generateId().toString(), // Temporary ID, backend should generate real one
      columnId: taskColumnId,
      content: taskText,
      title: taskText, // Assuming content can be title for now
      patientId: taskPatientId || patientId || null,
      status: taskColumnId, // Map columnId to status for now
      // Add other necessary fields like priority, dueDate if applicable
    };
    // Optimistically update UI, then sync with backend
    setTasks(prevTasks => [...prevTasks, newTask]);
    try {
      // Example POST (adjust API and payload as needed)
      const response = await fetch(`${API_BASE_URL}/api/tasks`, { // Or a more specific endpoint like /api/tasks/create
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (!response.ok) {
        throw new Error('Failed to save task to backend');
      }
      const savedTask = await response.json();
      // Replace temporary task with saved task from backend (especially ID)
      setTasks(prevTasks => prevTasks.map(t => t.id === newTask.id ? savedTask : t));
    } catch (err) {
      console.error("Failed to save new task:", err);
      // Revert optimistic update if needed
      setTasks(prevTasks => prevTasks.filter(t => t.id !== newTask.id));
      setError("Failed to save task. Please try again.");
    }
  }, [patientId]);

  const handleCreateColumn = useCallback(() => {
    const newColumn = {
      id: generateId().toString(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns(prev => [...prev, newColumn]);
    // localStorage.setItem(KANBAN_COLUMNS_KEY, JSON.stringify([...columns, newColumn])); // If saving columns to LS
  }, [columns.length]);

  const handleDeleteColumn = useCallback((id) => {
    setColumns(prev => prev.filter((col) => col.id !== id));
    setTasks(prev => prev.filter((task) => task.columnId !== id)); // Also remove tasks in the deleted column
     // Update localStorage for columns if used
  }, []);

  const handleUpdateColumn = useCallback((id, title) => {
    setColumns(prev => prev.map((col) => (col.id === id ? { ...col, title } : col)));
    // Update localStorage for columns if used
  }, []);

  const handleCreateTask = useCallback((columnId) => {
    // For now, use a prompt or a default task content
    const content = prompt("Enter task content:");
    if (content) {
        addTask(content, columnId);
    }
  }, [addTask]);

  const handleDeleteTask = useCallback(async (taskId) => {
    const originalTasks = tasks;
    setTasks(prev => prev.filter((task) => task.id !== taskId));
    try {
      // Example DELETE (adjust API endpoint)
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete task from backend');
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
      setTasks(originalTasks); // Revert
      setError("Failed to delete task. Please try again.");
    }
  }, [tasks]);

  const handleUpdateTask = useCallback(async (taskId, newContent, newColumnId) => {
    const originalTasks = tasks;
    setTasks(prev => 
      prev.map((task) => 
        task.id === taskId ? { ...task, content: newContent, title: newContent, columnId: newColumnId || task.columnId, status: newColumnId || task.columnId } : task
      )
    );
    try {
      // Example PUT (adjust API endpoint and payload)
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;
      const updatedTaskData = { ...taskToUpdate, content: newContent, title: newContent, columnId: newColumnId || taskToUpdate.columnId, status: newColumnId || taskToUpdate.columnId };

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTaskData)
      });
      if (!response.ok) {
        throw new Error('Failed to update task on backend');
      }
    } catch (err) {
      console.error("Failed to update task:", err);
      setTasks(originalTasks); // Revert
      setError("Failed to update task. Please try again.");
    }
  }, [tasks]);

  const handleTaskMove = useCallback(async (active, over) => {
    const activeId = active.id.toString();
    const overId = over.id.toString();
    let newColumnId = null;

    if (over.data.current?.type === "Column") {
      newColumnId = overId;
    } else if (over.data.current?.type === "Task") {
      const overTask = tasks.find(t => t.id.toString() === overId);
      if (overTask) newColumnId = overTask.columnId;
    }

    if (!newColumnId) return; // Could not determine target column

    const originalTasks = [...tasks];
    const activeTaskIndex = tasks.findIndex((t) => t.id.toString() === activeId);
    if (activeTaskIndex === -1) return;

    const updatedTask = { 
        ...tasks[activeTaskIndex], 
        columnId: newColumnId, 
        status: newColumnId // Assuming columnId maps to status
    };

    // Optimistic UI update
      setTasks((prevTasks) => {
          let newTasks = [...prevTasks];
        newTasks[activeTaskIndex] = updatedTask;
        // If moving to a different task's position (not just a column drop)
          if (over.data.current?.type === "Task") { 
            const overTaskIndex = newTasks.findIndex((t) => t.id.toString() === overId);
            if (overTaskIndex !== -1 && activeTaskIndex !== overTaskIndex) {
                newTasks = arrayMove(newTasks, activeTaskIndex, overTaskIndex);
            }
              }
        return newTasks;
    });

    try {
      // API call to update task's columnId/status and potentially order
      const response = await fetch(`${API_BASE_URL}/api/tasks/${activeId}/move`, { // Or just PUT to /api/tasks/:id
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: newColumnId, /* potentially order info */ })
      });
      if (!response.ok) {
        throw new Error('Failed to move task on backend');
      }
    } catch (err) {
      console.error("Failed to move task:", err);
      setTasks(originalTasks); // Revert optimistic update
      setError("Failed to move task. Please try again.");
    }
  }, [tasks]);


  if (isLoading) return <div className="container mx-auto p-6 text-center">Loading tasks...</div>;
  if (error) return <div className="container mx-auto p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button 
            onClick={() => navigate(-1)} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded"
        >
            &larr; Back
        </button>
        <h1 className="text-3xl font-bold text-center text-gray-700">
          Follow-up Task Board {patientId && `for ${patientId}`}
        </h1>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <KanbanBoard 
        columns={columns}
        tasks={tasks}
        onColumnsChange={setColumns} // Column changes are still local (localStorage or static)
        onTasksChange={handleTaskMove} // Task moves will need API calls
        onCreateColumn={handleCreateColumn}
        onDeleteColumn={handleDeleteColumn}
        onUpdateColumn={handleUpdateColumn}
        onCreateTask={handleCreateTask}   // Task creation will need API calls
        onDeleteTask={handleDeleteTask} // Task deletion will need API calls
        onUpdateTask={handleUpdateTask} // Task updates will need API calls
      />
    </div>
  );
};

export default FollowUpTaskBoard; 