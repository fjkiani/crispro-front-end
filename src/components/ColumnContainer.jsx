import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import TaskCard from "./TaskCard";
import { IconPlus, IconTrash } from "@tabler/icons-react";

function ColumnContainer({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
  onViewTaskDetails
}) {
  const [editMode, setEditMode] = useState(false);

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex h-[calc(100vh-200px)] md:h-[calc(100vh-250px)] w-[300px] sm:w-[350px] flex-col rounded-md border-2 border-pink-500 bg-slate-200 opacity-60 shadow-lg"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col w-[300px] sm:w-[350px] rounded-lg bg-slate-100 shadow-md"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          if (!editMode) setEditMode(true);
        }}
        className="text-md flex h-[60px] cursor-grab items-center justify-between rounded-t-lg bg-slate-200 p-3 font-semibold text-slate-700 border-b border-slate-300"
      >
        <div className="flex gap-2 items-center flex-grow">
          {!editMode && <span className="truncate">{column.title}</span>}
          {editMode && (
            <input
              className="rounded border border-slate-400 bg-white px-2 py-1 text-slate-800 outline-none focus:border-indigo-500 w-full"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />
          )}
        </div>
        {!editMode && (
        <button
            onClick={(e) => {
              e.stopPropagation();
            deleteColumn(column.id);
          }}
            className="rounded p-1 text-slate-500 hover:bg-slate-300 hover:text-red-600"
            title="Delete column"
        >
            <IconTrash size={18} />
        </button>
        )}
      </div>

      <div className="flex flex-grow flex-col gap-3 overflow-y-auto overflow-x-hidden p-3 min-h-[100px]">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
              onViewTaskDetails={onViewTaskDetails}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-sm text-slate-500 py-4 italic">
              No tasks in this column.
            </div>
          )}
        </SortableContext>
      </div>

      <button
        className="flex items-center justify-center gap-2 rounded-b-lg border-t border-slate-300 p-3 text-sm text-slate-600 hover:bg-slate-200 hover:text-indigo-600 active:bg-slate-300"
        onClick={() => {
          createTask(column.id);
        }}
      >
        <IconPlus size={18} />
        Add task
      </button>
    </div>
  );
}

export default ColumnContainer;
