
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 1. Import the Google Provider here
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. Wrap your App with your exact Google Client ID */}
    <GoogleOAuthProvider clientId="1081590793376-aiqb1qa5ft0mgn88c110p2ueg1auglcs.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);