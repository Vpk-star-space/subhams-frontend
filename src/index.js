import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import InstallPopup from './components/InstallPopup';
import { GoogleOAuthProvider } from '@react-oauth/google';

// The install event + service worker are handled in public/index.html.
// Here we only mount InstallPopup ONCE so it never unmounts between screens.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="1081590793376-aiqb1qa5ft0mgn88c110p2ueg1auglcs.apps.googleusercontent.com">
      <App />
      <InstallPopup />
    </GoogleOAuthProvider>
  </React.StrictMode>
);