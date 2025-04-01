import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/profile/ProfileContext';
import { SocialProvider } from './context/SocialContext';
import { MusicProvider } from './context/music/MusicContext';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <SocialProvider>
          <MusicProvider>
            <App />
          </MusicProvider>
        </SocialProvider>
      </ProfileProvider>
    </AuthProvider>
  // </StrictMode>
);
