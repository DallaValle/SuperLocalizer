import { redirect } from 'next/navigation'

// Redirect the root (`/`) to the default locale page (`/en`).
// Using a server component redirect keeps this minimal and avoids changing middleware.
export default function RootPage() {
    redirect('/en')
}
