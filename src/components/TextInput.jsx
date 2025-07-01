import React from 'react';

/**
 * A generic, reusable text input or textarea component.
 * @param {string} value - The current value of the input.
 * @param {function} onChange - A function called with the new value when it changes.
 * @param {boolean} multiline - If true, renders a <textarea> instead of an <input>.
 * @param {object} props - Any other props (e.g., placeholder, rows, id) to pass to the element.
 */
const TextInput = ({ value, onChange, multiline = false, className = '', ...props }) => {
  const baseClasses = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";

  const commonProps = {
    className: `${baseClasses} ${className}`,
    value: value,
    // We pass the new value directly, which is simpler for the parent component.
    onChange: (e) => onChange(e.target.value),
    ...props,
  };

  if (multiline) {
    return <textarea {...commonProps} />;
  }

  return <input type="text" {...commonProps} />;
};

export default TextInput;