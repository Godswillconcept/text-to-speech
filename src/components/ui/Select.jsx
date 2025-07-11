import React from 'react';

const Select = ({
  id,
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  isLoading = false,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="label">
          <span className="label-text text-sm font-medium text-gray-700">
            {label}
          </span>
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-in-out
            ${disabled || isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:border-indigo-300'}
            ${className}`}
          value={value}
          onChange={onChange}
          disabled={disabled || isLoading}
          aria-describedby={helperText ? `${id}-helper` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value || option.id || option}
              value={option.value || option.id || option}
              className="py-2"
            >
              {option.label || option.name || option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isLoading ? 'animate-spin' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            {isLoading ? (
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            )}
          </svg>
        </div>
      </div>
      {helperText && (
        <label className="label">
          <span className="label-text-alt text-xs text-gray-500" id={`${id}-helper`}>
            {helperText}
          </span>
        </label>
      )}
    </div>
  );
};

export default Select;
