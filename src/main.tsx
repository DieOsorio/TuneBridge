import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/profile/ProfileContext';
import { SocialProvider } from './context/social/SocialContext';
import { MusicProvider } from './context/music/MusicContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { SettingsProvider } from './context/settings/SettingsContext';
import { GroupsProvider } from './context/groups/GroupsContext';
import { AdminProvider } from './context/admin/AdminContext';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <I18nextProvider i18n={i18n}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ProfileProvider>
              <SocialProvider>
                <MusicProvider>
                  <GroupsProvider>
                    <AdminProvider>
                      <App />
                      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
                    </AdminProvider>
                  </GroupsProvider>
                </MusicProvider>
              </SocialProvider>
            </ProfileProvider>
          </LocalizationProvider>
        </I18nextProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
  // </StrictMode>
);
