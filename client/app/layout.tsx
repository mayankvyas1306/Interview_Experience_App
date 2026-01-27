import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BootstrapClient from "@/components/BootstrapClient";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "InterviewPulse",
  description: "Interview Experience Sharing Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BootstrapClient/>
        <AuthProvider>
        <Navbar/>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
