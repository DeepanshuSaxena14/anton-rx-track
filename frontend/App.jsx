import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AppealPage from './src/pages/AppealPage';

function App() {
  return (
    <Router>
      <div className="App" style={{ fontFamily: 'Inter, sans-serif' }}>
        <nav style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef', marginBottom: '2rem' }}>
          <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
            <li><strong>Anton RX Track</strong></li>
            <li><Link to="/appeal" style={{ textDecoration: 'none', color: '#0056b3' }}>Appeal Generator</Link></li>
            {/* P3 Teams will hook in their routes below */}
            {/* <li><Link to="/compare">Compare Policies</Link></li> */}
          </ul>
        </nav>

        <Routes>
          <Route path="/appeal" element={<AppealPage />} />
          <Route path="/" element={<div style={{ padding: '2rem' }}>Welcome to the RX Track Application. Please access the specific feature pages above.</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
