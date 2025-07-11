import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ListboxSelect({
  options = [],
  value,
  onChange,
  label,
  className = '',
  buttonClassName = '',
  optionsClassName = '',
  optionClassName = '',
  disabled = false,
  placeholder = 'Select an option',
  displayValue = (option) => option?.name || option?.label || option,
  displaySelected = (option) => option?.name || option?.label || option,
  ...props
}) {
  const selectedOption = options.find(opt => opt.id === value || opt.value === value || opt === value) || null;

  return (
    <Listbox 
      value={value} 
      onChange={onChange}
      disabled={disabled}
      {...props}
    >
      {({ open }) => (
        <div className={classNames('w-full', className)}>
          {label && (
            <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </Listbox.Label>
          )}
          <div className="relative">
            <Listbox.Button 
              className={classNames(
                'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm',
                disabled && 'opacity-70 cursor-not-allowed',
                buttonClassName
              )}
            >
              <span className="block truncate">
                {selectedOption ? displaySelected(selectedOption) : placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options 
                className={classNames(
                  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
                  optionsClassName
                )}
              >
                {options.map((option, index) => {
                  const optionId = option.id || option.value || index;
                  const optionLabel = option.name || option.label || option;
                  const isSelected = value === optionId || value === option;
                  
                  return (
                    <Listbox.Option
                      key={optionId}
                      className={({ active }) =>
                        classNames(
                          active ? 'bg-purple-600 text-white' : 'text-gray-900',
                          'relative cursor-default select-none py-2 pl-3 pr-9',
                          optionClassName
                        )
                      }
                      value={optionId}
                    >
                      {({ active }) => (
                        <>
                          <span className={classNames(
                            isSelected ? 'font-semibold' : 'font-normal', 
                            'block truncate'
                          )}>
                            {displayValue(option) || optionLabel}
                          </span>
                          {isSelected ? (
                            <span
                              className={classNames(
                                active ? 'text-white' : 'text-purple-600',
                                'absolute inset-y-0 right-0 flex items-center pr-4'
                              )}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  );
                })}
              </Listbox.Options>
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
}
