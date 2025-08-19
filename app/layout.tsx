import type React from "react"
import type { Metadata } from "next"
// import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

// const inter = Inter({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-inter",
// })

export const metadata: Metadata = {
  title: "Project Sanctuary - Personal Project Manager",
  description: "A gentle space to reconnect with your unfinished projects and move forward with intention",
  generator: "part of it i made",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Project Sanctuary",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Project Sanctuary",
    title: "Personal Project Manager",
    description: "A gentle space to reconnect with your unfinished projects and move forward with intention",
  },
  icons: {
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Project Sanctuary" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Project Sanctuary" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                      
                      // Check for updates every 30 seconds
                      setInterval(() => {
                        registration.update();
                      }, 30000);
                      
                      // Listen for service worker messages
                      navigator.serviceWorker.addEventListener('message', (event) => {
                        if (event.data.type === 'UPDATE_AVAILABLE') {
                          showUpdateNotification(event.data.version);
                        }
                        if (event.data.type === 'UPDATE_COMPLETE') {
                          hideUpdateNotification();
                          showUpdateCompleteMessage(event.data.version);
                        }
                      });
                      
                      // Check for waiting service worker
                      if (registration.waiting) {
                        showUpdateNotification('latest');
                      }
                      
                      // Listen for new service worker
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              showUpdateNotification('latest');
                            }
                          });
                        }
                      });
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
              
              function showUpdateNotification(version) {
                // Remove existing notification
                const existing = document.getElementById('pwa-update-notification');
                if (existing) existing.remove();
                
                // Create notification element
                const notification = document.createElement('div');
                notification.id = 'pwa-update-notification';
                notification.style.cssText = \`
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                  color: white;
                  padding: 16px 20px;
                  border-radius: 12px;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                  z-index: 10000;
                  font-family: system-ui, -apple-system, sans-serif;
                  font-size: 14px;
                  max-width: 320px;
                  backdrop-filter: blur(10px);
                  border: 1px solid rgba(255,255,255,0.1);
                  animation: slideIn 0.3s ease-out;
                \`;
                
                notification.innerHTML = \`
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="flex: 1;">
                      <div style="font-weight: 600; margin-bottom: 4px;">Update Available</div>
                      <div style="opacity: 0.9; font-size: 12px;">Version \${version} is ready to install</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button onclick="installUpdate()" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        cursor: pointer;
                        font-weight: 500;
                      ">Install</button>
                      <button onclick="dismissUpdate()" style="
                        background: transparent;
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        cursor: pointer;
                      ">Later</button>
                    </div>
                  </div>
                \`;
                
                // Add animation styles
                const style = document.createElement('style');
                style.textContent = \`
                  @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                  }
                  @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                  }
                \`;
                document.head.appendChild(style);
                
                document.body.appendChild(notification);
              }
              
              function installUpdate() {
                if (navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
                }
                hideUpdateNotification();
                showLoadingMessage();
              }
              
              function dismissUpdate() {
                hideUpdateNotification();
              }
              
              function hideUpdateNotification() {
                const notification = document.getElementById('pwa-update-notification');
                if (notification) {
                  notification.style.animation = 'slideOut 0.3s ease-in';
                  setTimeout(() => notification.remove(), 300);
                }
              }
              
              function showLoadingMessage() {
                const loading = document.createElement('div');
                loading.id = 'pwa-loading';
                loading.style.cssText = \`
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: #10b981;
                  color: white;
                  padding: 12px 20px;
                  border-radius: 8px;
                  z-index: 10000;
                  font-family: system-ui, -apple-system, sans-serif;
                  font-size: 14px;
                \`;
                loading.textContent = 'Installing update...';
                document.body.appendChild(loading);
              }
              
              function showUpdateCompleteMessage(version) {
                const loading = document.getElementById('pwa-loading');
                if (loading) loading.remove();
                
                const complete = document.createElement('div');
                complete.style.cssText = \`
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: #10b981;
                  color: white;
                  padding: 12px 20px;
                  border-radius: 8px;
                  z-index: 10000;
                  font-family: system-ui, -apple-system, sans-serif;
                  font-size: 14px;
                \`;
                complete.textContent = \`Updated to version \${version}!\`;
                document.body.appendChild(complete);
                
                setTimeout(() => {
                  complete.style.animation = 'slideOut 0.3s ease-in';
                  setTimeout(() => complete.remove(), 300);
                }, 3000);
              }
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
