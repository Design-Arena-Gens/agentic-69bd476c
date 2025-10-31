import './globals.css';

export const metadata = {
  title: 'Sentence Palette Explorer',
  description:
    'Browse and search the Sentence Palette examples grouped by research paper sections.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
