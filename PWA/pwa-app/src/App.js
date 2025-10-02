import logo from './logo.svg';
import './App.css';
import {Navbar, Nav} from 'react-bootstrap'
import Home from './Home';
import About from './About';
import Historial from './Historial';
import {Link, Route, BrowserRouter as Router, Routes} from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Router>
      <Navbar bg="success" data-bs-theme="dark">
          <Navbar.Brand href="#home">Navbar</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/historial">Historial</Nav.Link>
          </Nav>
      </Navbar>
      <Routes>
        <Route path = "/" element={<Home />}></Route>
        <Route path = "/historial" element={<Historial />}></Route>
        <Route path = "/about" element={<About />}></Route>
      </Routes>   
      </Router>
    </div>
  );
}

export default App;
