import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { 
  HomeIcon,
  DocumentTextIcon,
  DocumentArrowUpIcon,
  PencilSquareIcon,
  DocumentMagnifyingGlassIcon,
  ClockIcon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  LightBulbIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Text to Speech', href: '/text-to-speech', icon: DocumentTextIcon },
  { name: 'PDF to Speech', href: '/pdf-to-speech', icon: DocumentArrowUpIcon },
  { name: 'Paraphraser', href: '/paraphraser', icon: PencilSquareIcon },
  { name: 'Summarizer', href: '/summarizer', icon: DocumentMagnifyingGlassIcon },
  { name: 'Key Points', href: '/key-points', icon: LightBulbIcon },
  { name: 'Change Tone', href: '/change-tone', icon: SparklesIcon },
  { name: 'History', href: '/operations', icon: ClockIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5 rounded-full hover:bg-gray-100 transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-900" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-bg-primary px-6 pb-4 border-r border-gray-200">
                  {/* Logo */}
                  <div className="flex h-16 shrink-0 items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">S</span>
                      </div>
                      <span className="ml-2 text-xl font-semibold text-text-primary">subssum</span>
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-1">
                      {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              className={classNames(
                                isActive
                                  ? 'bg-bg-accent text-primary-600 font-medium'
                                  : 'text-text-secondary hover:bg-bg-accent hover:text-text-primary',
                                'group flex gap-x-3 rounded-lg p-2.5 text-sm transition-colors duration-200'
                              )}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <item.icon
                                className={classNames(
                                  isActive 
                                    ? 'text-primary-600' 
                                    : 'text-gray-400 group-hover:text-primary-500',
                                  'h-6 w-6 shrink-0 transition-colors duration-200'
                                )}
                                aria-hidden="true"
                              />
                              <span className="truncate">{item.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                      
                      {/* Log Out */}
                      <li className="mt-auto">
                        <a
                          href="#"
                          className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                        >
                          <ArrowLeftOnRectangleIcon
                            className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-600"
                            aria-hidden="true"
                          />
                          Log Out
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">subssum</span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={classNames(
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium'
                      )}
                    >
                      <item.icon
                        className={classNames(
                          isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-700',
                          'h-5 w-5 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
              
              {/* Log Out */}
              <li className="mt-auto">
                <a
                  href="#"
                  className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                >
                  <ArrowLeftOnRectangleIcon
                    className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-600"
                    aria-hidden="true"
                  />
                  Log Out
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;