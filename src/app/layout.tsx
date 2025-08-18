
import type {Metadata} from 'next';
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Mailflow AI',
  description: 'The future of email marketing.',
};

const fontUrls = [
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap",
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Slabo+27px&display=swap",
  "https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Days+One&display=swap",
  "https://fonts.googleapis.com/css2?family=Russo+One&display=swap"
];


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {fontUrls.map(url => <link key={url} href={url} rel="stylesheet" />)}
      </head>
      <body className={cn("font-body antialiased")}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
