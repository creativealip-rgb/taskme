import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { TaskStatus, TaskPriority, Task, TaskFormData, Subtask } from '../types/task';
import { createTaskSchema, updateTaskSchema, formatZodErrors } from '../schemas/task.schema';
import { subtasksApi } from '../services/api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskFormData) => void;
  task?: Task | null;
  apiErrors?: ApiValidationError[];
  initialDueDate?: string;
}

export interface ApiValidationError {
  path: string;
  message: string;
}

const getInitialFormData = (task?: Task | null, initialDueDate?: string): TaskFormData => {
  if (task) {
    return {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    };
  }
  return {
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: initialDueDate || ''
  };
};

const getInitialErrors = (apiErrors?: ApiValidationError[]): Record<string, string> => {
  if (!apiErrors || apiErrors.length === 0) return {};
  const errors: Record<string, string> = {};
  apiErrors.forEach((error) => {
    errors[error.path] = error.message;
  });
  return errors;
};

const priorityOptions = [
  { value: TaskPriority.LOW, label: 'Low', color: 'text-emerald-600' },
  { value: TaskPriority.MEDIUM, label: 'Medium', color: 'text-amber-600' },
  { value: TaskPriority.HIGH, label: 'High', color: 'text-rose-600' }
];

const statusOptions = [
  { value: TaskStatus.TODO, label: 'To Do' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.DONE, label: 'Done' }
];

export const TaskModal = ({ isOpen, onClose, onSave, task = null, apiErrors, initialDueDate }: TaskModalProps) => {
  const [formData, setFormData] = useState<TaskFormData>(() => getInitialFormData(task, initialDueDate));
  const [errors, setErrors] = useState<Record<string, string>>(() => getInitialErrors(apiErrors));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>([]);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task && task.subtasks) {
      setLocalSubtasks(task.subtasks);
    } else if (task && !task.subtasks) {
      setIsLoadingSubtasks(true);
      subtasksApi.getByTaskId(task.id).then((response) => {
        setLocalSubtasks(response.data || []);
        setIsLoadingSubtasks(false);
      }).catch(() => {
        setIsLoadingSubtasks(false);
      });
    } else {
      setLocalSubtasks([]);
    }
  }, [task]);

  useEffect(() => {
    setFormData(getInitialFormData(task, initialDueDate));
  }, [task, initialDueDate]);

  const formValidation = useMemo(() => {
    const schema = task ? updateTaskSchema : createTaskSchema;
    const dataToValidate = {
      ...formData,
      dueDate: formData.dueDate || undefined
    };

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      return {
        isValid: false,
        errorCount: result.error.issues.length,
        issues: result.error.issues
      };
    }

    return { isValid: true, errorCount: 0, issues: [] };
  }, [formData, task]);

  const validateField = useCallback((field: string, value: unknown) => {
    const schema = task ? updateTaskSchema : createTaskSchema;
    const fieldSchema = schema.shape[field as keyof typeof schema.shape];

    if (fieldSchema) {
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({ ...prev, [field]: result.error.issues[0].message }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  }, [task]);

  const validateForm = useCallback((): boolean => {
    if (!formValidation.isValid) {
      const formattedErrors = formatZodErrors({ issues: formValidation.issues } as never);
      setErrors(formattedErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [formValidation]);

  const handleChange = useCallback((field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  const handleBlur = useCallback((field: keyof TaskFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  }, [formData, validateField]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true
    });

    if (!validateForm()) {
      return;
    }

    onSave({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : ''
    });
    onClose();
  }, [formData, onSave, onClose, validateForm]);

  const handleAddSubtask = useCallback(async () => {
    if (!task || !newSubtaskTitle.trim()) return;

    try {
      const response = await subtasksApi.create(task.id, newSubtaskTitle.trim());
      setLocalSubtasks(prev => [...prev, response.data]);
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    } catch (err) {
      console.error('Failed to add subtask:', err);
    }
  }, [task, newSubtaskTitle]);

  const handleToggleSubtask = useCallback(async (subtaskId: string) => {
    try {
      const response = await subtasksApi.toggle(subtaskId);
      setLocalSubtasks(prev => prev.map(st =>
        st.id === subtaskId ? response.data : st
      ));
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  }, []);

  const handleDeleteSubtask = useCallback(async (subtaskId: string) => {
    if (!task) return;

    try {
      await subtasksApi.delete(subtaskId);
      setLocalSubtasks(prev => prev.filter(st => st.id !== subtaskId));
    } catch (err) {
      console.error('Failed to delete subtask:', err);
    }
  }, [task]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const getInputClassName = (fieldName: string) => {
    const hasError = errors[fieldName] && touched[fieldName];
    const isValid = touched[fieldName] && !errors[fieldName] && formData[fieldName as keyof TaskFormData];

    if (hasError) {
      return `
        w-full px-4 py-3
        bg-rose-50 border-rose-300
        focus:ring-rose-500/20 focus:border-rose-500
        border rounded-xl
        focus:outline-none focus:ring-2
        text-gray-900 placeholder-gray-400
        transition-all duration-150
      `;
    }

    if (isValid) {
      return `
        w-full px-4 py-3
        bg-emerald-50/30 border-emerald-300
        focus:ring-emerald-500/20 focus:border-emerald-500
        border rounded-xl
        focus:outline-none focus:ring-2
        text-gray-900 placeholder-gray-400
        transition-all duration-150
      `;
    }

    return `
      w-full px-4 py-3
      bg-gray-50 border-gray-200
      focus:ring-indigo-500/20 focus:border-indigo-500
      border rounded-xl
      focus:outline-none focus:ring-2
      text-gray-900 placeholder-gray-400
      transition-all duration-150
    `;
  };

  const getCharacterCount = (value: string, max: number) => {
    const isNearLimit = value.length > max * 0.9;
    return (
      <span className={`text-xs ${isNearLimit ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
        {value.length}/{max}
      </span>
    );
  };

  const isFormEmpty = !formData.title.trim() && !formData.description.trim();
  const hasErrors = Object.keys(errors).length > 0;
  const isSubmitDisabled = isFormEmpty || (hasErrors && Object.keys(touched).length > 0);
  const subtasks = localSubtasks;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${formValidation.isValid ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
              <svg className={`w-5 h-5 ${formValidation.isValid ? 'text-emerald-600' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {task ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                )}
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {task ? 'Edit Task' : 'Create Task'}
              </h2>
              <p className="text-xs text-gray-500">
                {formValidation.isValid
                  ? 'All fields are valid'
                  : task ? 'Update the task details below' : 'Fill in the details to create a new task'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-150"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
          {hasErrors && Object.keys(touched).length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-rose-800">
                  Please fix {formValidation.errorCount} error{formValidation.errorCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-800">
                Title <span className="text-rose-500">*</span>
              </label>
              {getCharacterCount(formData.title, 200)}
            </div>
            <div className="relative">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                className={getInputClassName('title')}
                placeholder="Enter task title..."
              />
              {touched.title && !errors.title && formData.title && (
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            {errors.title && touched.title && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-800">
                Description
              </label>
              {getCharacterCount(formData.description, 2000)}
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              className={getInputClassName('description')}
              style={{ height: '112px' }}
              placeholder="Add a description (optional)..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-800">
                Status
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="
                    w-full px-4 py-3 pr-10
                    bg-gray-50 border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                    text-gray-900 appearance-none cursor-pointer
                    transition-all duration-150
                  "
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-800">
                Priority
              </label>
              <div className="relative">
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className={`
                    w-full px-4 py-3 pr-10
                    border rounded-xl
                    focus:outline-none focus:ring-2
                    text-gray-900 appearance-none cursor-pointer
                    transition-all duration-150
                    ${formData.priority === TaskPriority.HIGH ? 'bg-rose-50 border-rose-200 focus:ring-rose-500/20 focus:border-rose-500' :
                      formData.priority === TaskPriority.MEDIUM ? 'bg-amber-50 border-amber-200 focus:ring-amber-500/20 focus:border-amber-500' :
                      'bg-emerald-50 border-emerald-200 focus:ring-emerald-500/20 focus:border-emerald-500'}
                  `}
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value} className={option.color}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-800">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="
                  w-full px-4 py-3
                  bg-gray-50 border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                  text-gray-900
                  transition-all duration-150
                "
              />
              <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {task && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-800">
                  Subtasks
                </label>
                <span className="text-xs text-gray-500">
                  {isLoadingSubtasks ? 'Loading...' : `${subtasks.filter(s => s.completed).length}/${subtasks.length} completed`}
                </span>
              </div>

              {isLoadingSubtasks ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : subtasks.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(subtask.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          subtask.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300 hover:border-emerald-400'
                        }`}
                      >
                        {subtask.completed && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {subtask.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {isAddingSubtask ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Subtask title..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    disabled={!newSubtaskTitle.trim()}
                    className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSubtask(false);
                      setNewSubtaskTitle('');
                    }}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingSubtask(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Subtask
                </button>
              )}
            </div>
          )}
        </form>

        <div className="flex gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="
              flex-1 px-4 py-2.5
              border border-gray-200 text-gray-700 font-medium
              rounded-xl hover:bg-gray-100 hover:border-gray-300
              transition-all duration-150
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`
              flex-1 px-4 py-2.5
              font-medium rounded-xl
              shadow-lg transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
              ${formValidation.isValid && !isFormEmpty
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'}
            `}
          >
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};
