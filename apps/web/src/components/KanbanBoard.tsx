import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { TaskStatus, TaskPriority, Task } from '../types/task';

interface KanbanBoardProps {
  tasks: Task[];
  // eslint-disable-next-line no-unused-vars
  onEditTask: (_task: Task) => void;
  // eslint-disable-next-line no-unused-vars
  onDeleteTask: (_taskId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onMoveTask: (_taskId: string, _newStatus: TaskStatus) => void;
  // eslint-disable-next-line no-unused-vars
  onPriorityChange?: (_taskId: string, _newPriority: TaskPriority) => void;
}

interface Column {
  id: TaskStatus;
  title: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  countColor: string;
}

const columns: Column[] = [
  { 
    id: TaskStatus.TODO, 
    title: 'To Do', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    gradient: 'from-slate-50 to-slate-100/50',
    borderColor: 'border-slate-200',
    countColor: 'bg-slate-100 text-slate-600'
  },
  { 
    id: TaskStatus.IN_PROGRESS, 
    title: 'In Progress', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-blue-50 to-indigo-100/50',
    borderColor: 'border-blue-200',
    countColor: 'bg-blue-100 text-blue-700'
  },
  { 
    id: TaskStatus.DONE, 
    title: 'Done', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-emerald-50 to-teal-100/50',
    borderColor: 'border-emerald-200',
    countColor: 'bg-emerald-100 text-emerald-700'
  }
];

export const KanbanBoard = ({ tasks, onEditTask, onDeleteTask, onMoveTask, onPriorityChange }: KanbanBoardProps) => {
  const getTasksByStatus = (status: TaskStatus) => tasks.filter(task => task.status === status);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) {
      return;
    }

    // Dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get the new status from the destination droppableId
    const newStatus = destination.droppableId as TaskStatus;
    
    // Call the move task function
    onMoveTask(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div 
              key={column.id} 
              className={`flex flex-col rounded-xl border ${column.borderColor} bg-gradient-to-b ${column.gradient} min-h-[500px] shadow-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${column.countColor} bg-opacity-50`}>
                    {column.icon}
                  </div>
                  <h2 className="font-semibold text-gray-800 text-sm tracking-wide">{column.title}</h2>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${column.countColor}`}>
                  {columnTasks.length}
                </span>
              </div>
              
              {/* Droppable Tasks Container */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px]
                      transition-colors duration-200
                      ${snapshot.isDraggingOver ? 'bg-white/50 ring-2 ring-indigo-400/30 ring-inset' : ''}
                    `}
                  >
                    {columnTasks.length === 0 ? (
                      <div className={`
                        flex flex-col items-center justify-center h-32 text-gray-400
                        border-2 border-dashed border-gray-200 rounded-xl
                        ${snapshot.isDraggingOver ? 'border-indigo-300 bg-indigo-50/30' : ''}
                      `}>
                        <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-xs">
                          {snapshot.isDraggingOver ? 'Drop here' : 'No tasks'}
                        </span>
                      </div>
                    ) : (
                      columnTasks.map((task, index) => (
                        <Draggable 
                          key={task.id} 
                          draggableId={task.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                              className={`
                                transition-all duration-200
                                ${snapshot.isDragging ? 'rotate-2 scale-105 z-50' : ''}
                              `}
                            >
                              <TaskCard
                                task={task}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                                onStatusChange={onMoveTask}
                                onPriorityChange={onPriorityChange}
                                isKanban={true}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
