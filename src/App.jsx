import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './components/HomePage'
import ContactPage from './components/ContactPage'

function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="app-shell">
      <Header page={page} onNavigate={setPage} />
      {page === 'contact' ? <ContactPage onNavigate={setPage} /> : <HomePage onNavigate={setPage} />}
      <Footer onNavigate={setPage} />
    </div>
  )
}

export default App
