import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Layout from '@/components/Layout'
import Employees from '@/pages/Employees'
import EmployeeDetail from '@/pages/EmployeeDetail'
import Login from '@/pages/Login'
import Tasks from '@/pages/Tasks'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/employees" replace /> },
      { path: '/login', element: <Login /> },
      { path: '/employees', element: <Employees /> },
      { path: '/employees/:id', element: <EmployeeDetail /> },
      { path: '/tasks', element: <Tasks /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App