import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/admit/Login';
import Register from './components/admit/Register';
import ClientLogin from './components/client/Login';
import ClientRegister from './components/client/Register';
import './App.css'
import AdmitDashboard from './components/admit/Dashboard';
import ClientDashboard from './components/client/Dashboard';
import AdmitProtectedRoute from './components/admit/ProtectedRoute';
import ClientProtectedRoute from './components/client/ProtectedRoute';
import EditClient from './components/admit/EditClient';
import AddProduct from './components/client/AddProduct';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <AdmitProtectedRoute>
            <AdmitDashboard />
          </AdmitProtectedRoute>
        } />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/register" element={<ClientRegister />} />
        <Route path="/client/dashboard" element={
          <ClientProtectedRoute>
            <ClientDashboard />
          </ClientProtectedRoute>
        } />
        <Route path="/dashboard/client/:id" element={
          <AdmitProtectedRoute>
            <EditClient />
          </AdmitProtectedRoute>
        } />
        <Route path="/client/addproduct" element={
          <ClientProtectedRoute>
            <AddProduct />
          </ClientProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
