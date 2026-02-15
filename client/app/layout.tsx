import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BootstrapClient from "@/components/BootstrapClient";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "InterviewPulse",
  description: "Interview Experience Sharing Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BootstrapClient />
        <AuthProvider>
          {/* ✅ FIX: Single Toaster at root level */}
          <Toaster 
            position="top-right"
            toastOptions={{
              // Custom styling
              duration: 3000,
              style: {
                background: 'rgba(20, 24, 40, 0.95)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
              },
              success: {
                iconTheme: {
                  primary: '#00D4FF',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}