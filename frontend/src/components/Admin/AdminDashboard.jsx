import React, { useState } from 'react';
import AllBookingsTable from './AllBookingsTable';
import PendingApprovalsTable from './PendingApprovalsTable';
// import { exportDatabaseAdmin } from '../../services/api'; // No longer needed

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
  // const [exportMessage, setExportMessage] = useState(''); // No longer needed for this button

  /* // This handler is no longer needed as the button is removed
  const handleExportDB = async () => {
     setExportMessage('Exporting...');
     try {
         const response = await exportDatabaseAdmin();
         setExportMessage(response.data.msg || "Export successful!");
     } catch (error) {
         setExportMessage(error.response?.data?.msg || "Export failed.");
         console.error("Export error:", error);
     }
  };
  */

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Admin Dashboard</h1>
      
      {/* Button and export message removed from here */}
      {/*
      <div className="mb-4">
         <button onClick={handleExportDB} className="btn-primary mr-4">Export Bookings to SQLite</button>
         {exportMessage && <span className="text-sm text-gray-600">{exportMessage}</span>}
      </div>
      */}

      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`${
              activeTab === 'pending'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
            aria-current={activeTab === 'pending' ? 'page' : undefined}
          >
            Pending Approvals
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
            aria-current={activeTab === 'all' ? 'page' : undefined}
          >
            All Bookings
          </button>
        </nav>
      </div>

      {activeTab === 'pending' && <PendingApprovalsTable />}
      {activeTab === 'all' && <AllBookingsTable />}
    </div>
  );
};

export default AdminDashboard;