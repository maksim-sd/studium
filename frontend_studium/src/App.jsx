import { useState, useContext, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useUserStore } from './store/UserStore.jsx'
import { ToastContainer, Zoom } from 'react-toastify'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
// import Profile from './pages/Profile.jsx'
// import Tasks from './pages/Tasks.jsx'
import Task from './pages/Task.jsx'
import Chats from './pages/Chats.jsx'
import Responses from './pages/Responses.jsx'
import CreateNewTask from './pages/CreateNewTask.jsx'
import Shop from './pages/Shop.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import EditUsers from './pages/EditUsers.jsx'
import HelpUsBecomBetter from './pages/HelpUsBecomeBetter.jsx'
import PageNotFound from './pages/NotFound.jsx'
import FullScreenLoader from './pages/FullScreenLoader.jsx'
import './App.css'

const Profile = lazy(() => import('./pages/Profile.jsx'))
const Tasks = lazy(() => import('./pages/Tasks.jsx'))

const LazyRoute = ({ children }) => (
  <Suspense fallback={<FullScreenLoader />}>
    {children}
  </Suspense>
)

function PublicRoute() {
  const isAuth = useUserStore((state) => state.isAuth)
  const isLoading = useUserStore((state) => state.isLoading)

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (isAuth) {
    return (
      <Navigate to='/profile' replace />
    )
  }

  return <Outlet />
}

function ProtectedRoute ({ allowedRoles }) {
  const isAuth = useUserStore((state) => state.isAuth)
  const user =  useUserStore((state) => state.currentUserData)
  const userGroup = useUserStore((state) => state.groups)
  const isLoading = useUserStore((state) => state.isLoading)

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (!isAuth) {
    return (
      <Navigate to='/login' replace />
    )
  }
  
  if (!allowedRoles.includes(userGroup)) {
    return (
      <Navigate to='/page-not-found' replace />
    )
  }

  return <Outlet />
}

function App() {
  const navigate = useNavigate()
  const { checkAuth, isLoading, isAuth } = useUserStore()
  
  useEffect(() => {   
    const initApp = async () => {
      const hasVisited = localStorage.getItem('hasVisitedBefore')

      if (!hasVisited) {
        localStorage.setItem('hasVisitedBefore', 'true')
        navigate('/login', { replace: true })
        setCheckingAuth(false)
      }

      await checkAuth()
    } 
    initApp()
  }, [checkAuth, navigate])

  if (isLoading) {
    return <FullScreenLoader />
  }

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} transition={Zoom} />
      <Header />
      <Routes>
        <Route element={<PublicRoute />}>
        <Route path='/' element={ <LandingPage /> }/>
          <Route path='/login' element={ <LoginPage /> }/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["Модератор", "Заказчик", "Исполнитель"]} />}>
          <Route path='/profile' element={ <LazyRoute> <Profile /> </LazyRoute> }/>
          <Route path='/profile/:userId' element={ <Profile /> }/>
          <Route path='/tasks' element={ <Tasks /> }/>
          <Route path='/tasks/:taskId' element={ <Task /> }/>
          <Route path='/chats' element={ <Chats /> }/>
          <Route path='/chats/:chatId' element={ <Chats /> }/>
          <Route path='/help-us-become-better' element={ <HelpUsBecomBetter /> }/>
          <Route path='*' element={ <PageNotFound /> }/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["Исполнитель"]} />}>
          <Route path='/studium-store' element={ <Shop /> }/>
          <Route path='/order-story' element={ <OrdersPage /> }/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["Модератор", "Заказчик"]} />}>
          <Route path='/tasks/:taskId/edit' element={ <CreateNewTask type='edit' /> }/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["Заказчик"]} />}>
          <Route path='/create-new-task' element={ <CreateNewTask type='create' /> }/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["Модератор"]} />}>
          <Route path='/tasks/:taskId/responses' element={ <Responses /> }/>
          <Route path='/moderate-task/:taskId' element={ <CreateNewTask type='moderate' /> }/>
          <Route path='/tasks/:taskId/edit-users' element={ <EditUsers /> }/>
        </Route>
        <Route path='/page-not-found' element={ <LazyRoute> <PageNotFound /> </LazyRoute> }/>
      </Routes>
      <Footer />
    </>
  )
}

export default App
