import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import DocumentVerification from './components/admin/DocumentVerification';
import DriverManagement from './components/admin/DriverManagement';
import RideManagement from './components/admin/RideManagement';
import UserManagement from './components/admin/UserManagement';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <AdminLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="/admin/drivers" element={<DriverManagement />} />
                    <Route path="/admin/documents" element={<DocumentVerification />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/rides" element={<RideManagement />} />
                </Route>
                <Route path="/" element={<Navigate to="/admin" />} />
            </Routes>
        </Router>
    );
};

export default App; 