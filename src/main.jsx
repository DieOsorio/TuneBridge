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
import { ThemeProvider } from './context/ThemeContext';
import { ProfileGroupsProvider } from './context/profile/ProfileGroupsContext';
import { ProfileGroupMembersProvider } from './context/profile/ProfileGroupMembersContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ProfileProvider>
              <ProfileGroupsProvider>
                <ProfileGroupMembersProvider>
                  <SocialProvider>
                    <MusicProvider>
                      <ViewProvider>
                        <App />
                        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
                      </ViewProvider>
                    </MusicProvider>
                  </SocialProvider>
                </ProfileGroupMembersProvider> 
              </ProfileGroupsProvider>
            </ProfileProvider>
          </LocalizationProvider>    
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
