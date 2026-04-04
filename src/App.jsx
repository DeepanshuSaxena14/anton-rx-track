import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import Search from './pages/Search'
import Upload from './pages/Upload'
import Compare from './pages/Compare'
import Changes from './pages/Changes'
import Leaderboard from './pages/Leaderboard'
import Monitor from './pages/Monitor'

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main className="min-h-screen pt-14">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/changes" element={<Changes />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/monitor" element={<Monitor />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
