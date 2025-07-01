import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout = ({ children, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content wrapper */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        <Header setSidebarOpen={setSidebarOpen} />
        
        {/* Main content area with proper width inheritance */}
        <main className="flex-1 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 w-full">
            <div className="w-full">
              {children}
            </div>
          </div>
        </main>
        
        {/* Footer will stick to bottom */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;