import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconTrash, IconMessageCircle, IconClipboardList, IconMail, IconFlag, IconUserCircle, IconFileDescription } from "@tabler/icons-react";
import DraftMessageModal from "./DraftMessageModal";

const getTaskTypeStyle = (type) => {
  switch (type) {
    case 'PATIENT_MESSAGE_SUGGESTION':
      return { 
        icon: IconClipboardList, 
        bgColor: 'bg-yellow-100', 
        textColor: 'text-yellow-800', 
        label: 'Patient Follow-up'
      };
    case 'TASK':
       return { 
        icon: IconClipboardList, 
        bgColor: 'bg-blue-100', 
        textColor: 'text-blue-700', 
        label: 'General Task'
      };
    default:
      return { 
        icon: IconClipboardList, 
        bgColor: 'bg-gray-100', 
        textColor: 'text-gray-600', 
        label: type || 'Task'
      };
  }
};

function TaskCard({ task, deleteTask, updateTask, onViewTaskDetails }) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  const typeStyle = getTaskTypeStyle(task.suggestion_type);
  const showFollowUpActions = task.suggestion_type === 'PATIENT_MESSAGE_SUGGESTION';

  const handleOpenDraftMessageModal = (e) => {
    e.stopPropagation();
    console.log("Opening draft message modal for task:", task.id, task.content);
    setIsDraftModalOpen(true);
  };

  const handleCloseDraftMessageModal = () => {
    setIsDraftModalOpen(false);
  };

  const handleSendDraftedMessage = (messageText) => {
    console.log(`Message for task ID ${task.id} (${task.content}):`);
    console.log(messageText);
    // alert("Message logged to console. (Implement actual sending/saving)"); // Optional: keep or remove alert
  };
  
  const handleFlagReview = (e) => {
    e.stopPropagation();
    // console.log("Flag task for Clinician Review:", task.id, task.content);
    // alert(`Placeholder: Would flag task for clinician review: ${task.content}`);
    updateTask(task.id, { ...task, isFlagged: !task.isFlagged });
  };

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
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
        className={`relative flex h-[120px] min-h-[120px] cursor-grab items-center rounded-md border-2 ${task.isFlagged ? "border-yellow-500" : "border-blue-500"} bg-slate-100 p-3 text-left opacity-70 shadow-md`}
      />
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => onViewTaskDetails(task)}
        className={`task relative flex h-auto min-h-[120px] cursor-pointer flex-col justify-start rounded-md bg-white p-3 text-left shadow-sm border ${task.isFlagged ? "border-yellow-400 ring-2 ring-yellow-200" : "border-gray-200"} hover:border-indigo-500 hover:shadow-lg transition-all duration-150 ease-in-out`}
        onMouseEnter={() => setMouseIsOver(true)}
        onMouseLeave={() => setMouseIsOver(false)}
      >
        <div className="flex justify-between items-start mb-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${typeStyle.bgColor} ${typeStyle.textColor}`}
            title={`Type: ${typeStyle.label}`}
          >
            <typeStyle.icon size={13} className="mr-1.5" />
            {typeStyle.label}
          </span>
          
          <div className="flex items-center">
            {task.isFlagged && (
              <IconFlag size={16} className="text-yellow-500 mr-2" title="Flagged for Review"/>
            )}
            {mouseIsOver && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id);
                }}
                className="absolute top-2 right-2 z-10 flex-shrink-0 rounded bg-white p-1 text-gray-400 opacity-70 hover:bg-red-50 hover:text-red-600 hover:opacity-100 transition-colors"
                title="Delete Task"
              >
                <IconTrash size={16}/>
              </button>
            )}
          </div>
        </div>
        
        <p className="my-1 w-full flex-grow whitespace-pre-wrap text-sm font-medium text-gray-800">
          {task.content}
        </p>
        
        {task.related_criterion && task.related_criterion !== task.content && (
            <p className="text-xs text-gray-500 mt-1 italic">
                Context: {task.related_criterion}
            </p>
        )}

        <div className="text-xs text-gray-500 mt-auto space-y-0.5 border-t border-gray-100 pt-2">
            {task.patientId && (
              <p className="flex items-center truncate">
                <IconUserCircle size={14} className="mr-1.5 flex-shrink-0 text-gray-400"/> Patient: {task.patientId}
              </p>)
            }
            {task.trial_id && (
              <p className="flex items-center truncate" title={task.trial_title || task.trial_id}>
                 <IconFileDescription size={14} className="mr-1.5 flex-shrink-0 text-gray-400"/> Trial: {task.trial_id}
              </p>)
            }
        </div>
        
        {showFollowUpActions && (
          <div className="flex justify-start items-center gap-2 mt-2.5 pt-2 border-t border-gray-100"> 
            <button 
              onClick={handleOpenDraftMessageModal} 
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
              title="Draft a message to the patient about this item"
             >
               <IconMail size={14} />
               Draft Patient Message
            </button>
            <button 
               onClick={handleFlagReview}
               className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                task.isFlagged 
                ? "text-yellow-700 bg-yellow-200 hover:bg-yellow-300" 
                : "text-amber-700 bg-amber-100 hover:bg-amber-200"
               }`}
               title="Flag this item for internal clinician review"
             >
               <IconFlag size={14} />
               Flag for Review
            </button>
          </div>
        )}
      </div>

      {isDraftModalOpen && (
        <DraftMessageModal 
          isOpen={isDraftModalOpen}
          onClose={handleCloseDraftMessageModal}
          taskTitle={task.related_criterion || task.content}
          initialDraftText={task.draft_text || `Dear [Patient Name],\n\nRegarding your potential eligibility for trial ${task.trial_id || 'N/A'} (${task.trial_title || 'Trial Title N/A'}), we need some more information about:\n"${task.related_criterion || task.content}"\n\nCould you please provide details on this? Or let us know if you have any questions.\n\nThank you,\n[Your Name/Clinic Name]`}
          onSendMessage={handleSendDraftedMessage}
        />
      )}
    </>
  );
}

export default TaskCard;
