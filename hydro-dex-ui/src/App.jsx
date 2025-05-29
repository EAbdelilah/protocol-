import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SpotTradingPage from './pages/SpotTradingPage';
import FundingPage from './pages/FundingPage';
import MarginTradingPage from './pages/MarginTradingPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage'; // Import TransactionHistoryPage
import './App.css'; // Assuming you have some basic styles

const Home = () => <div>Home Page Content</div>; // Placeholder for home page

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="main-layout">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/spot" element={<SpotTradingPage />} />
              <Route path="/funding" element={<FundingPage />} />
              <Route path="/margin" element={<MarginTradingPage />} />
              <Route path="/history" element={<TransactionHistoryPage />} /> {/* Add history page route */}
              {/* Add more routes here */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
