import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/profile/ProfileContext';
import { SocialProvider } from './context/social/SocialContext';
import { MusicProvider } from './context/music/MusicContext';
import { ViewProvider } from './context/ViewContext';

// if (import.meta.env.MODE === 'development') {
//   import('@welldone-software/why-did-you-render').then(({ default: whyDidYouRender }) => {
//     whyDidYouRender(React, {
//       trackAllPureComponents: true,
//     });
//   });
// }

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <ProfileProvider>
            <SocialProvider>
              <MusicProvider>
                <ViewProvider>
                <App />
                <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
                </ViewProvider>
              </MusicProvider>
            </SocialProvider>
          </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
