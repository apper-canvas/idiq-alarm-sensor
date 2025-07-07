import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from '@/components/Layout';
import Dashboard from '@/components/pages/Dashboard';
import Contractors from '@/components/pages/Contractors';
import Requisitions from '@/components/pages/Requisitions';
import Timesheets from '@/components/pages/Timesheets';
import Reports from '@/components/pages/Reports';
import Agencies from '@/components/pages/Agencies';
import Settings from '@/components/pages/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contractors" element={<Contractors />} />
          <Route path="/requisitions" element={<Requisitions />} />
          <Route path="/timesheets" element={<Timesheets />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-container"
        style={{ zIndex: 9999 }}
      />
    </Router>
  );
}

export default App;