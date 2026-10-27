import React from 'react';
import { CheckSquare2, Plus, RefreshCw } from 'lucide-react';
import Button from '../common/Button.jsx';

const EmptyState = ({ isFiltered = false, onResetFilters, onAddNew }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
        <CheckSquare2 className="w-8 h-8 stroke-[1.8]" />
      </div>

      <h3 className="text-base font-bold text-slate-800">
        {isFiltered ? 'No matching tasks found' : 'All clear! No tasks yet'}
      </h3>

      <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
        {isFiltered
          ? 'Try adjusting your search criteria, priority filter, or status toggles to find what you are looking for.'
          : 'Stay organized and boost your productivity. Create your first task to get started right now.'}
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        {isFiltered ? (
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={onResetFilters}>
            Clear All Filters
          </Button>
        ) : (
          <Button variant="primary" size="sm" icon={Plus} onClick={onAddNew}>
            Create First Task
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
