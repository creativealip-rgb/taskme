import { useState } from 'react';
import { TaskPriority, TaskStatus, Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  // eslint-disable-next-line no-unused-vars
  onEdit: (_task: Task) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (_taskId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onStatusChange?: (_taskId: string, _newStatus: TaskStatus) => void;
  // eslint-disable-next-line no-unused-vars
  onPriorityChange?: (_taskId: string, _newPriority: TaskPriority) => void;
  isKanban?: boolean;
}

const priorityConfig: Record<TaskPriority, { 
  color: string; 
  icon: React.ReactNode; 
  label: string;
  bgColor: string;
  borderColor: string;
}> = {
  [TaskPriority.LOW]: {
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    borderColor: 'border-emerald-200',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    label: 'Low'
  },
  [TaskPriority.MEDIUM]: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    borderColor: 'border-amber-200',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    ),
    label: 'Medium'
  },
  [TaskPriority.HIGH]: {
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 hover:bg-rose-100',
    borderColor: 'border-rose-200',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    label: 'High'
  }
};

const priorityOptions = [
  { value: TaskPriority.LOW, label: 'Low', color: 'text-emerald-700 bg-emerald-50' },
  { value: TaskPriority.MEDIUM, label: 'Medium', color: 'text-amber-700 bg-amber-50' },
  { value: TaskPriority.HIGH, label: 'High', color: 'text-rose-700 bg-rose-50' },
];

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.TODO]: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
    </svg>
  ),
  [TaskStatus.IN_PROGRESS]: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  [TaskStatus.DONE]: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
};

export const TaskCard = ({ task, onEdit, onDelete, onPriorityChange, isKanban = false }: TaskCardProps) => {
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const formatDate = (dateString?: string): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
  const priority = priorityConfig[task.priority];

  const handlePriorityChange = (newPriority: TaskPriority) => {
    if (onPriorityChange && newPriority !== task.priority) {
      onPriorityChange(task.id, newPriority);
    }
    setIsPriorityOpen(false);
  };

  return (
    <div 
      className={`
        group bg-white rounded-xl border border-gray-100 
        shadow-sm hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-200 ease-out cursor-pointer
        ${isOverdue ? 'ring-1 ring-rose-200' : ''}
      `}
      onClick={() => onEdit(task)}
    >
      {/* Card Content */}
      <div className="p-4">
        {/* Header: Title and Delete Button */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
            {task.title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="
              opacity-0 group-hover:opacity-100 
              text-gray-400 hover:text-rose-500 
              transition-all duration-150 p-1 -mr-1 -mt-1 rounded-md hover:bg-rose-50
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        {/* Description */}
        {task.description && (
          <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
        
        {/* Footer: Priority Dropdown and Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Dropdown */}
            {isKanban && onPriorityChange ? (
              <div 
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                  className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                    ${priority.bgColor} ${priority.borderColor} ${priority.color}
                    transition-all duration-150 hover:shadow-sm
                  `}
                >
                  {priority.icon}
                  {priority.label}
                  <svg className="w-3 h-3 ml-0.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isPriorityOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsPriorityOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[100px]">
                      {priorityOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handlePriorityChange(option.value)}
                          className={`
                            w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2
                            ${option.color}
                            ${task.priority === option.value ? 'bg-gray-50' : 'hover:bg-gray-50'}
                            transition-colors duration-150
                          `}
                        >
                          {option.value === TaskPriority.LOW && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          )}
                          {option.value === TaskPriority.MEDIUM && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                            </svg>
                          )}
                          {option.value === TaskPriority.HIGH && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          )}
                          {option.label}
                          {task.priority === option.value && (
                            <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Static Priority Badge for non-kanban or when callback not provided */
              <span className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                ${priority.bgColor} ${priority.borderColor} ${priority.color}
              `}>
                {priority.icon}
                {priority.label}
              </span>
            )}
            
            {/* Status Badge (only in list view) */}
            {!isKanban && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {statusIcons[task.status]}
                {task.status.replace('_', ' ')}
              </span>
            )}
          </div>
          
          {/* Due Date */}
          {task.dueDate && (
            <span className={`
              inline-flex items-center gap-1.5 text-xs font-medium
              ${isOverdue ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded-full' : 'text-gray-400'}
            `}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
      
      {/* Bottom Accent Line */}
      <div className={`
        h-1 w-full 
        ${task.priority === TaskPriority.HIGH ? 'bg-rose-400' : 
          task.priority === TaskPriority.MEDIUM ? 'bg-amber-400' : 'bg-emerald-400'}
      `} />
    </div>
  );
};
