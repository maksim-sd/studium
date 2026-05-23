import { useState, useContext } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useUserStore } from './store/UserStore.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Profile from './pages/Profile.jsx'
import Tasks from './pages/Tasks.jsx'
import Task from './pages/Task.jsx'
import Chats from './pages/Chats.jsx'
import Responses from './pages/Responses.jsx'
import CreateNewTask from './pages/CreateNewTask.jsx'
import Shop from './pages/Shop.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import EditUsers from './pages/EditUsers.jsx'
import HelpUsBecomBetter from './pages/HelpUsBecomeBetter.jsx'
import PageNotFound from './pages/NotFound.jsx'
import './App.css'

import { UserProvider } from './userContext.jsx'


function ProtectedRoute ({ allowedRoles }) {
  const isAuth = useUserStore((state) => state.isAuth)
  const user =  useUserStore((state) => state.currentUserData)

  if (!isAuth) {
    return (
      <Navigate to='/login' replace />
    )
  } 
  
  if (!allowedRoles.includes(user?.groups_id[0])) {
    console.log(user?.groups_id[0])
    console.log(allowedRoles)
    return (
      <Navigate to='/page-not-found' replace />
    )
  }

  return <Outlet />
}

function App() {

  return (
    <>
      <Header />
      <Routes>
        <Route path='/login' element={ <LoginPage /> }/>
        <Route path='/page-not-found' element={ <PageNotFound /> }/>
        <Route element={<ProtectedRoute allowedRoles={[3, 2, 1]} />}>
          <Route path='/profile' element={ <Profile /> }/>
          <Route path='/tasks' element={ <Tasks /> }/>
          <Route path='/tasks/:taskId' element={ <Task /> }/>
          <Route path='/chats' element={ <Chats /> }/>
          <Route path='/chats/:chatId'/>
          <Route path='/help-us-become-better' element={ <HelpUsBecomBetter /> }/>
          <Route path='*' element={ <PageNotFound /> }/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[3]} />}>
          <Route path='/studium-store' element={ <Shop /> }/>
          <Route path='/order-story' element={ <OrdersPage /> }/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[1, 2]} />}>
          <Route path='/tasks/:taskId/edit' element={ <CreateNewTask type='edit' /> }/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[2]} />}>
          <Route path='/create-new-task' element={ <CreateNewTask type='create' /> }/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[1]} />}>
          <Route path='/tasks/:taskId/responses' element={ <Responses /> }/>
          <Route path='/moderate-task/:taskId' element={ <CreateNewTask type='moderate' /> }/>
          <Route path='/tasks/:taskId/edit-users' element={ <EditUsers /> }/>
        </Route>
      </Routes>
      <Footer />
    </>
  )
}

export default App
