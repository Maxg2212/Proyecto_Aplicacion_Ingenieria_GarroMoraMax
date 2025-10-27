// App.js (with routing)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Home from './Home';
import Historial from './Historial';

function App() {
  const [history, setHistory] = useState([]);

  // Load from localStorage when component mounts
  useEffect(() => {
    const savedHistory = localStorage.getItem('treeIdentificationHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('treeIdentificationHistory', JSON.stringify(history));
  }, [history]);

  const addToHistory = (item) => {
    setHistory(prevHistory => [item, ...prevHistory]);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('treeIdentificationHistory');
  };

  return (
    <Router>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Tree Identifier
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/history">
                History
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid>
        <Routes>
          <Route 
            path="/" 
            element={<Home addToHistory={addToHistory} />} 
          />
          <Route 
            path="/history" 
            element={
              <Historial 
                history={history} 
                clearHistory={clearHistory} 
              />
            } 
          />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;