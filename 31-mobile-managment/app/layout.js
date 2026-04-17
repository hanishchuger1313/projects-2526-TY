import './globals.css'

export const metadata = {
  title: 'Mobile Shop Lifecycle Management',
  description: 'Complete lifecycle management for mobile devices',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
