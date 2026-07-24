'use client';

import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { LogOut, LayoutDashboard } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { logout } from '@/app/actions/auth';
import Cookies from 'js-cookie';

// import { useLocale } from 'next-intl';

export function LoginStatus() {
    // const locale = useLocale();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // const router = useRouter();

    useEffect(() => {
        // Check for the cookie client-side
        const session = Cookies.get('is_admin');
        const sessionExists = !!session;
        if (sessionExists !== isLoggedIn) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoggedIn(sessionExists);
        }
    }, [isLoggedIn]);

    // const handleLogout = async () => {
    //     await logout();
    //     Cookies.remove('is_admin'); // Remove the visible UI cookie
    //     setIsLoggedIn(false);
    //     router.refresh(); // Refresh to update UI
    //     router.push('/');
    // };

    if (!isLoggedIn) return null;

    // User requested to hide these small links and put logout directly on the admin page
    return null;
}
