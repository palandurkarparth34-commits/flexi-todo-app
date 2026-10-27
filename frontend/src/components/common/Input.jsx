import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconClick,
      className = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-sm">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <LeftIcon className="w-4 h-4" />
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            required={required}
            className={`
              block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400
              transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
              disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
              ${LeftIcon ? 'pl-9' : ''}
              ${RightIcon ? 'pr-9' : ''}
              ${error ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300'}
              ${className}
            `}
            {...props}
          />

          {RightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition ${
                onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
              }`}
              tabIndex={onRightIconClick ? 0 : -1}
            >
              <RightIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
