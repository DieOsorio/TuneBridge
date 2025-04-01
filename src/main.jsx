import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/profile/ProfileContext';
import { SocialProvider } from './context/SocialContext';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <SocialProvider>
          <App />
        </SocialProvider>
      </ ProfileProvider>
    </AuthProvider>
  // </StrictMode>
)
