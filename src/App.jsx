import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import Search from './pages/Search'
import Upload from './pages/Upload'
import Compare from './pages/Compare'
import Changes from './pages/Changes'
import Leaderboard from './pages/Leaderboard'
import Appeal from './pages/Appeal'
import ProtectedRoute from './components/ProtectedRoute'
import AuthCallback from './pages/AuthCallback'

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
          <Route path="/changes" element={<ProtectedRoute><Changes /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/appeal" element={<ProtectedRoute><Appeal /></ProtectedRoute>} />
          <Route path="/callback" element={<AuthCallback />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
