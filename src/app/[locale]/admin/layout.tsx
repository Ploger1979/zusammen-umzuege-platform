import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { useLocale } from 'next-intl';

export default async function AdminLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) {
        redirect(`/${locale}/login`);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* We can add a shared Admin Header here if we want, or keep it per page. 
                For now, we just wrap the children to ensure auth. */}
            {children}
        </div>
    );
}
