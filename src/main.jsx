import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/profile/ProfileContext';
import { SocialProvider } from './context/social/SocialContext';
import { MusicProvider } from './context/music/MusicContext';
import { ProfileGroupsProvider } from './context/profile/ProfileGroupsContext';
import { ProfileGroupMembersProvider } from './context/profile/ProfileGroupMembersContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { SettingsProvider } from './context/settings/SettingsContext';
// import { GroupsProvider } from './context/groups/GroupsContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <I18nextProvider i18n={i18n}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <ProfileProvider>
                <ProfileGroupsProvider>
                  <ProfileGroupMembersProvider>
                    <SocialProvider>
                      <MusicProvider>
                        {/* <GroupsProvider> */}
                          <App />
                          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
                        {/* </GroupsProvider> */}
                      </MusicProvider>
                    </SocialProvider>
                  </ProfileGroupMembersProvider> 
                </ProfileGroupsProvider>
              </ProfileProvider>
            </LocalizationProvider>    
          </I18nextProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  // </StrictMode>
);
