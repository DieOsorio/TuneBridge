import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/profile/ProfileContext';
import { SocialProvider } from './context/SocialContext';
import { MusicProvider } from './context/music/MusicContext';
import { InstrumentDetailsProvider } from './context/music/InstrumentDetailsContext';
import { SingerDetailsProvider } from './context/music/SingerDetailsContext';
import { DjDetailsProvider } from './context/music/DjDetailsContext';
import { ProducerDetailsProvider } from './context/music/ProducerDetailsContext';
import { ComposerDetailsProvider } from './context/music/ComposerDetailsContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <SocialProvider>
          <MusicProvider>
            <InstrumentDetailsProvider>
              <SingerDetailsProvider>
                <DjDetailsProvider>
                  <ProducerDetailsProvider>
                    <ComposerDetailsProvider>
                      <App />
                    </ComposerDetailsProvider>
                  </ProducerDetailsProvider>
              </DjDetailsProvider>
            </SingerDetailsProvider>
            </InstrumentDetailsProvider>
          </MusicProvider>
        </SocialProvider>
      </ProfileProvider>
    </AuthProvider>
  </StrictMode>
);
