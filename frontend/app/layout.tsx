import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'SuperLocalizer',
    description: 'Localization management dashboard',
};

type Props = {
    children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
    return (
        <html>
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}