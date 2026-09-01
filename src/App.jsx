import { useState } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import About from './components/About'

function App() {
  const [page, setPage] = useState('about')

  if (page === 'about') return <About onNavigate={setPage} />

  return page === 'login'
    ? <Login onNavigate={setPage} />
    : <Signup onNavigate={setPage} />
}

export default App
