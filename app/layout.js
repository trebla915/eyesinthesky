import './globals.css';
import { IncidentsProvider } from './components/IncidentsProvider';
import PWAInstallPrompt from './components/PWAInstallPrompt';

export const metadata = {
  title: 'Eyes In The Sky',
  description: 'El Paso city dashboard — live incidents, traffic & alerts',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Eyes In The Sky',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
};

export const viewport = {
  themeColor: '#0a0f1e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-white dashboard-bg bg-grid">
        <IncidentsProvider>
          {children}
          <PWAInstallPrompt />
        </IncidentsProvider>
      </body>
    </html>
  );
}


