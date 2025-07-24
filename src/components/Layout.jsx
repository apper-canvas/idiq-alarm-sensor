import React, { useState } from "react";
import AgencyPortal from "@/components/pages/AgencyPortal";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPortal, setCurrentPortal] = useState('bank'); // 'bank' or 'agency'

  const togglePortal = () => {
    setCurrentPortal(prev => prev === 'bank' ? 'agency' : 'bank');
    setSidebarOpen(false); // Close sidebar when switching portals
  };
return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {currentPortal === 'bank' && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
<Header 
onMenuClick={() => setSidebarOpen(true)} 
            title={currentPortal === 'bank' ? "nProcurement Demo" : "Agency Portal"}
            currentPortal={currentPortal}
            onPortalToggle={togglePortal}
            showMenuButton={currentPortal === 'bank'}
          />
          
<main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              {currentPortal === 'agency' ? <AgencyPortal /> : children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;