import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import "./styles/styles.css";
import "./styles/responsive.css";
import "./styles/NewStyles.css";
import './App.css';
import Login from './views/login/Login';
import HomePage from './views/home/Home';
import AuthCode from './views/login/AuthCode';
import DIDComponent from './components/sms/DIDComponent';
import ChatsView from './components/chats/Chats';
import DarkMode from './components/utils/DarkMode';
import Test from './views/home/Test';

function App() {
  return (

    <div>

      <div className="d-none">
        <DarkMode />
      </div>

      <ToastContainer
        position="top-right"    // Position of toast on the screen
        autoClose={2000}        // Auto close after 2 seconds (global default)
        hideProgressBar={false} // Show progress bar
        newestOnTop={false}     // Display new toasts on top
        closeOnClick            // Close on click
        rtl={false}             // Right-to-left text direction
        pauseOnFocusLoss        // Pause on focus loss
        draggable               // Allow dragging of toasts
        pauseOnHover            // Pause on hover
        theme="colored"         // Colored theme for toasts
      />

      <Router>
        <Routes>

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path='/login' element={<Login />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/auth' element={<AuthCode />} />
          <Route path='/didcomponent' element={<DIDComponent />} />
          <Route path='/chat' element={<ChatsView />} />
          <Route path='/test' element={<Test />} />
        </Routes>
      </Router>
    </div>

  );
}

export default App;
