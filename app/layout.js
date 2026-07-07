// app/layout.js
import './globals.css';

export const metadata = {
  title: 'VulnMarket - Premium Tech Shop',
  description:
    'VulnMarket - Your one-stop shop for premium tech products. [EDUCATIONAL PURPOSES ONLY]',
  keywords: 'electronics, gadgets, tech, shop, ecommerce',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        {/* VULN: API key exposed in meta tag */}
        <meta name="analytics-key" content="vm_analytics_key_8f3a2b1c9d4e5f6g7h8i9j0k" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-900 text-slate-100 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
