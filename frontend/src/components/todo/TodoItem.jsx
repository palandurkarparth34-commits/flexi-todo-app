import React from 'react';
import { Check, Calendar, Tag, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { PriorityBadge } from '../common/Badge.jsx';

const TodoItem = ({ todo, onToggle, onEdit, onDelete, isToggling = false, isDeleting = false }) => {
  const { _id, title, description, completed, priority, dueDate, tags = [] } = todo;

  // Check if due date is overdue
  const isOverdue = dueDate && !completed && new Date(dueDate) < new Date();

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 shadow-sm hover:shadow-md ${
        completed
          ? 'bg-slate-50/70 border-slate-200'
          : isOverdue
          ? 'border-rose-200 hover:border-rose-300'
          : 'border-slate-200/90 hover:border-indigo-200'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Toggle Checkbox Button */}
        <button
          type="button"
          onClick={() => onToggle(_id)}
          disabled={isToggling}
          aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
          className={`flex-shrink-0 mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
              : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 bg-white'
          }`}
        >
          {completed && <Check className="w-4 h-4 stroke-[2.5]" />}
        </button>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h4
              onClick={() => onToggle(_id)}
              className={`text-base font-semibold leading-snug cursor-pointer transition-colors ${
                completed ? 'line-through text-slate-400' : 'text-slate-800 hover:text-indigo-600'
              }`}
            >
              {title}
            </h4>

            {/* Actions (visible on hover on desktop, always visible on mobile) */}
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEdit(todo)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                title="Edit task"
                aria-label="Edit task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(_id)}
                disabled={isDeleting}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Delete task"
                aria-label="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p
              className={`mt-1 text-sm leading-relaxed ${
                completed ? 'text-slate-400 line-through' : 'text-slate-600'
              }`}
            >
              {description}
            </p>
          )}

          {/* Meta Details: Priority, Due Date, Tags */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={priority} />

            {dueDate && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  isOverdue
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{formatDate(dueDate)}</span>
                {isOverdue && <span className="font-semibold">(Overdue)</span>}
              </span>
            )}

            {tags && tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    <Tag className="w-3 h-3 text-indigo-400" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
