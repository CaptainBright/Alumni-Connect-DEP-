import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Directory from './pages/Directory'
import Jobs from './pages/Jobs'
import Resources from './pages/Resources'
import Donation from './pages/Donation'
import Login from './pages/Login'
import Register from './pages/Register'
import Footer from './components/Footer'

export default function App(){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/directory" element={<Directory/>}/>
          <Route path="/jobs" element={<Jobs/>}/>
          <Route path="/resources" element={<Resources/>}/>
          <Route path="/donation" element={<Donation/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
