import React from 'react';
import { Search, X, SlidersHorizontal, Trash2 } from 'lucide-react';
import Button from '../common/Button.jsx';

const TodoFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  onClearCompleted,
  completedCount = 0,
}) => {
  const { search, completed, priority, sortBy, order } = filters;

  const hasActiveFilters = search || completed !== '' || priority !== '' || sortBy !== 'createdAt';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm mb-6 space-y-4">
      {/* Top row: Search and Status pills */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search tasks by title or description..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => onFilterChange('completed', '')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              completed === ''
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('completed', 'false')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              completed === 'false'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('completed', 'true')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              completed === 'true'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Bottom row: Priority dropdown, Sort options, Reset & Clear completed */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priority}
              onChange={(e) => onFilterChange('priority', e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSortBy, newOrder] = e.target.value.split('-');
                onFilterChange('sortBy', newSortBy);
                onFilterChange('order', newOrder);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="dueDate-asc">Due Date (Soonest)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline flex items-center gap-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Clear Completed Action */}
        {completedCount > 0 && (
          <button
            onClick={onClearCompleted}
            className="text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1 font-medium ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Completed ({completedCount})
          </button>
        )}
      </div>
    </div>
  );
};

export default TodoFilters;
