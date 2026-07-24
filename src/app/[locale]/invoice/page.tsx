import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import InvoiceGenerator from '@/components/InvoiceGenerator';

export default async function ProtectedInvoicePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    // 1. Get Access to Cookies
    // الوصول إلى الكوكيز المخزنة في المتصفح
    const cookieStore = await cookies();

    // 2. Check for 'admin_session' cookie
    // التحقق من وجود الكوكي الخاص بجلسة الأدمن
    const hasSession = cookieStore.has('admin_session');

    // 3. Security Gate
    // إذا لم يكن الكوكي موجوداً، قم بإعادة التوجيه لصفحة تسجيل الدخول فوراً
    if (!hasSession) {
        redirect(`/${locale}/login`);
    }

    // 4. Grant Access
    // إذا كان المسموح له، قم بعرض مولد الفواتير
    return <InvoiceGenerator />;
}
