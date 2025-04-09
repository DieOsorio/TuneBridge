import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/profile/ProfileContext';
import { SocialProvider } from './context/social/SocialContext';
import { MusicProvider } from './context/music/MusicContext';
import { ProfileIdProvider } from './context/profile/ProfileIdContext';
import { ViewProvider } from './context/ViewContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <ProfileProvider>
            <ProfileIdProvider>
              <SocialProvider>
                <MusicProvider>
                  <ViewProvider>
                  <App />
                  <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
                  </ViewProvider>
                </MusicProvider>
              </SocialProvider>
            </ProfileIdProvider>
          </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
