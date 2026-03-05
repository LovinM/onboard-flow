import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminDashboard from './pages/admin/AdminDashboard'
import Courses from './pages/admin/Courses'
import Users from './pages/admin/Users'
import ResetPassword from './pages/auth/ResetPassword'
import Enrollments from './pages/admin/Enrollments'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import Certificates from './pages/employee/Certificates'
import Feedback from './pages/employee/Feedback'
import EmployeeCourses from './pages/employee/EmployeeCourses'
import DeptHeadDashboard from './pages/depthead/DeptHeadDashboard'
import Team from './pages/depthead/Team'
import Reports from './pages/depthead/Reports'
import Settings from './pages/admin/Settings'
import AdminCertificates from './pages/admin/AdminCertificates'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Loading...</p>
    </div>
  )

  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(profile?.role)) return <Navigate to="/login" />

  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/certificates" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminCertificates />
  </ProtectedRoute>
} />
          <Route path="/admin/settings" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <Settings />
  </ProtectedRoute>
} />
          <Route path="/admin/courses" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Courses />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
               <Users />
            </ProtectedRoute>
          } />
          <Route path="/depthead/reports" element={
  <ProtectedRoute allowedRoles={['dept_head']}>
    <Reports />
  </ProtectedRoute>
} />

         <Route path="/employee" element={
  <ProtectedRoute allowedRoles={['employee']}>
    <EmployeeDashboard />
  </ProtectedRoute>
} />
         <Route path="/depthead" element={
  <ProtectedRoute allowedRoles={['dept_head']}>
    <DeptHeadDashboard />
  </ProtectedRoute>
} />
<Route path="/depthead/team" element={
  <ProtectedRoute allowedRoles={['dept_head']}>
    <Team />
  </ProtectedRoute>
} />
          <Route path="/admin/enrollments" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <Enrollments />
  </ProtectedRoute>
  
} />

<Route path="/employee/courses" element={
  <ProtectedRoute allowedRoles={['employee']}>
    <EmployeeCourses />
  </ProtectedRoute>
} />
<Route path="/employee/certificates" element={
  <ProtectedRoute allowedRoles={['employee']}>
    <Certificates />
  </ProtectedRoute>
} />
<Route path="/employee/feedback" element={
  <ProtectedRoute allowedRoles={['employee']}>
    <Feedback />
  </ProtectedRoute>
} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App