'use server';

import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createSessionToken, verifySessionToken, getSessionSecret } from '@/lib/jwt-helper';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'zusammen2026';

/**
 * Registriert einen neuen Admin / Register a new admin
 */
export async function register(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const secretKey = formData.get('secretKey') as string;

    // 1. Secret Key Check Reactivated
    if (secretKey !== ADMIN_SECRET) {
        return { success: false, error: 'invalidSecret' };
    }

    // 2. Validate Password Match
    if (password !== confirmPassword) {
        return { success: false, error: 'passwordMismatch' };
    }

    try {
        await dbConnect();

        // 3. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return { success: false, error: 'emailExists' };
        }

        // 4. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create User
        const role = (email === 'aymanploger@gmail.com' || email === 'aymanbob821@gmail.com') ? 'superadmin' : 'admin';
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role
        });

        // 6. Login immediately (Set cookie)
        const token = await createSessionToken(
            { email: user.email, role: user.role, name: user.name },
            getSessionSecret(),
            '7d'
        );

        const cookieStore = await cookies();
        cookieStore.set('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Remove insecure legacy cookies if they exist
        cookieStore.delete('is_admin');
        cookieStore.delete('admin_role');
        cookieStore.delete('admin_email');

        return { success: true };

    } catch (err: any) {
        console.error('Registration Error:', err);
        return { success: false, error: err.message || 'serverError' };
    }
}

/**
 * Handles the login process.
 */
export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        await dbConnect();

        // 1. Find User
        const user = await User.findOne({ email });
        
        // AUTO-UPGRADE YOUR ACCOUNT
        if (user && (user.email === 'aymanploger@gmail.com' || user.email === 'aymanbob821@gmail.com') && user.role !== 'superadmin') {
            user.role = 'superadmin';
            await user.save();
        }

        // Check if user exists AND matches password
        const isMatch = user && (await bcrypt.compare(password, user.password));

        if (isMatch) {
            // 2. Set Cookie using signed JWT
            const token = await createSessionToken(
                { email: user.email, role: user.role, name: user.name },
                getSessionSecret(),
                '7d'
            );

            const cookieStore = await cookies();
            cookieStore.set('admin_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });
            
            // Remove insecure legacy cookies
            cookieStore.delete('is_admin');
            cookieStore.delete('admin_role');
            cookieStore.delete('admin_email');

            return { success: true };
        } else if (user && (email === 'aymanploger@gmail.com' || email === 'aymanbob821@gmail.com') && password === 'admin123') {
            // AUTO-FIX: Force reset password for specific users if they try to login with 'admin123'
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
            await user.save();

            const token = await createSessionToken(
                { email: user.email, role: user.role, name: user.name },
                getSessionSecret(),
                '7d'
            );

            const cookieStore = await cookies();
            cookieStore.set('admin_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });
            
            cookieStore.delete('is_admin');
            cookieStore.delete('admin_role');
            cookieStore.delete('admin_email');
            
            return { success: true };
        } else {
            return { success: false, error: 'error' };
        }

    } catch (err) {
        console.error(err);
        return { success: false, error: 'serverError' };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    cookieStore.delete('is_admin');
    cookieStore.delete('admin_role');
    cookieStore.delete('admin_email');
}

/**
 * Gets the current logged-in user role server-side
 */
export async function getAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    
    if (!token) return null;

    try {
        const payload = await verifySessionToken(token, getSessionSecret());
        if (!payload) return null;
        
        // Force superadmin role for the developer emails even if the token has 'admin'
        const email = payload.email as string;
        let role = payload.role as string;
        
        if (email && (email.toLowerCase() === 'aymanploger@gmail.com' || email.toLowerCase() === 'aymanbob821@gmail.com' || email.toLowerCase() === 'aymanploger')) {
            role = 'superadmin';
        }

        return {
            name: payload.name as string,
            email: email,
            role: role
        };
    } catch (err) {
        return null;
    }
}

/**
 * Request Password Reset
 * Generates a token and sends an email.
 */
import Token from '@/models/Token';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get('email') as string;

    try {
        await dbConnect();

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return { success: true };
        }

        // 2. Delete existing tokens for this user
        await Token.deleteMany({ userId: user._id });

        // 3. Create new token
        const token = uuidv4();
        await Token.create({
            userId: user._id,
            token,
        });

        // 4. Send Email
        await sendPasswordResetEmail(user.email, token);

        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, error: 'serverError' };
    }
}

/**
 * Reset Password
 * Verifies token and updates password.
 */
export async function resetPassword(formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
        return { success: false, error: 'passwordMismatch' };
    }

    try {
        await dbConnect();

        // 1. Find Token
        const resetToken = await Token.findOne({ token });
        if (!resetToken) {
            return { success: false, error: 'invalidOrExpiredToken' };
        }

        // 2. Find User
        const user = await User.findById(resetToken.userId);
        if (!user) {
            return { success: false, error: 'userNotFound' };
        }

        // 3. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Update User
        user.password = hashedPassword;
        await user.save();

        // 5. Delete Token
        await Token.deleteOne({ _id: resetToken._id });

        return { success: true };

    } catch (err) {
        console.error(err);
        return { success: false, error: 'serverError' };
    }
}

/**
 * Fetch all admin users (for the admin dashboard)
 */
export async function getUsers() {
    try {
        await dbConnect();
        // Return simple JSON objects
        const users = await User.find({}).sort({ createdAt: -1 });
        return {
            success: true,
            users: users.map(u => ({
                _id: u._id.toString(),
                name: u.name,
                email: u.email,
                createdAt: u.createdAt,
                role: u.role
            }))
        };
    } catch (err) {
        console.error(err);
        return { success: false, error: 'serverError' };
    }
}

/**
 * Delete a user by ID
 */
export async function deleteUser(userId: string) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== 'superadmin') {
            return { success: false, error: 'unauthorized' };
        }

        await dbConnect();

        // Prevent self-deletion for safety
        const userToDelete = await User.findById(userId);
        if (userToDelete && userToDelete.email === session.email) {
             return { success: false, error: 'cannotDeleteSelf' };
        }

        await User.findByIdAndDelete(userId);
        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, error: 'serverError' };
    }
}

/**
 * Create a new admin user (without logging in)
 */
export async function createAdminUser(formData: FormData) {
    const session = await getAdminSession();
    if (!session || session.role !== 'superadmin') {
        return { success: false, error: 'unauthorized' };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Minimum validation
    if (!password || password.length < 6) {
        return { success: false, error: 'passwordTooShort' };
    }

    try {
        await dbConnect();

        const userExists = await User.findOne({ email });
        if (userExists) {
            return { success: false, error: 'emailExists' };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin' // Newly created users are always 'admin'
        });

        return { success: true };

    } catch (err: any) {
        console.error('Create Admin Error:', err);
        return { success: false, error: err.message || 'serverError' };
    }
}
