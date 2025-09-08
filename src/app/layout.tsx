'use client';

import Image from 'next/image';
import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const handleResetClick = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.location.href = '/';
  };

  return (
    <html lang="en">

      <head>
        <title>Identify concerns in this neuroserpin study</title>
        <meta name="description" content="NEUROSERPIN" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>

      <body>
        <header className="header"> {/* Header class from globals.css */}
          <button
            className="favicon-button" // Favicon button class
            onClick={handleResetClick}
            title="Reset Application"
          >
            <Image
              src="/favicon.ico"
              alt="Logo - Reset"
              width={40}
              height={40}
              className="favicon" // Favicon class
              priority
            />
          </button>
          <div className="title-container"> {/* Title container class */}
            <h1 className="title">Identify concerns in this neuroserpin study</h1> {/* Title class */}
          </div>
        </header>

        <main>{children}</main>

      </body>

    </html>
  );
}