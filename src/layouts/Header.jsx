import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';

const Header = ({ setSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-500 hover:text-amber lg:hidden transition-colors"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Right side controls */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
          {/* Notifications */}
          <button
            type="button"
            className="p-2 rounded-full text-gray-400 hover:text-amber hover:bg-gray-100 transition-colors"
            aria-label="View notifications"
          >
            <BellIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-x-2 p-1.5 -m-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-500 to-secondary-500 flex items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-white">LW</span>
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-1 text-sm font-semibold leading-6 text-amber" aria-hidden="true">
                  Lawal Wahab
                </span>
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-gray-900/5 focus:outline-none overflow-hidden">
                <div className="p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={`${active ? 'bg-gray-100' : ''
                          } flex items-center gap-2 px-4 py-2.5 text-sm text-amber rounded-md transition-colors`}
                      >
                        <UserCircleIcon className="h-5 w-5 text-gray-400" />
                        Your profile
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={`${active ? 'bg-gray-100' : ''
                          } flex items-center gap-2 px-4 py-2.5 text-sm text-amber rounded-md transition-colors`}
                      >
                        <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
                        Settings
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={`${active ? 'bg-gray-100' : ''
                          } flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 rounded-md transition-colors`}
                      >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5 text-red-400" />
                        Sign out
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;