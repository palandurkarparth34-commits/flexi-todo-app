import React from 'react';

export const PriorityBadge = ({ priority = 'medium', className = '' }) => {
  const styles = {
    high: 'bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10',
    medium: 'bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/10',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/10',
  };

  const labels = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  };

  const dotColors = {
    high: 'bg-rose-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  };

  const key = priority?.toLowerCase() || 'medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[key] || styles.medium} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[key] || dotColors.medium}`} />
      {labels[key] || priority}
    </span>
  );
};

export const StatusBadge = ({ completed = false, className = '' }) => {
  return completed ? (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Completed
    </span>
  ) : (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Pending
    </span>
  );
};
