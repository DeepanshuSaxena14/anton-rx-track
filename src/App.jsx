import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Search from './pages/Search'
import Upload from './pages/Upload'
import Compare from './pages/Compare'
import Changes from './pages/Changes'
import { LeaderboardPage, MonitorPage } from './pages/LeaderboardAndMonitor'

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main className="min-h-screen pt-14">
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/changes" element={<Changes />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/monitor" element={<MonitorPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
