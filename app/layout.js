import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { UserProvider } from '../contexts/UserContext';
import { UploadingProvider } from '../contexts/UploadingContext';
import { PostHogProvider } from '../contexts/PostHogContext';
import { Toaster } from 'react-hot-toast';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata = {
  title: 'drafted. - Video Resume Platform',
  description: 'Stand out with a 30-second video resume. Connect with thousands of recruiters.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={poppins.variable} id="root">
        <PostHogProvider>
          <AuthProvider>
            <UserProvider>
              <UploadingProvider>
                {children}
                <Toaster 
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))',
                      color: '#e5e7eb',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      backdropFilter: 'blur(16px)',
                    },
                  }}
                />
              </UploadingProvider>
            </UserProvider>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
