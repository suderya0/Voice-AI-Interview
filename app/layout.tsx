import './globals.css';

export const metadata = {
  title: 'AI Interview Platform',
  description: 'AI-powered interview platform - Practice interviews with AI and get real-time feedback',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

