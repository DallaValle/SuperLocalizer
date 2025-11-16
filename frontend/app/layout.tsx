import { Inter } from 'next/font/google';
import './globals.css';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//     title: 'SuperLocalizer',
//     description: 'Localization management dashboard',
// };

// interface RootLayoutProps {
//     children: React.ReactNode;
// }

// export default function RootLayout({ children }: RootLayoutProps) {
//     return (
//         <html lang="en">
//             <body className={inter.className}>{children}</body>
//         </html>
//     );
// }
import { NextIntlClientProvider } from 'next-intl';

type Props = {
    children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
    return (
        <html>
            <body>
                <NextIntlClientProvider>{children}</NextIntlClientProvider>
            </body>
        </html>
    );
}