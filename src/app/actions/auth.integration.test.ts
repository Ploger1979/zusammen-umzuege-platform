import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { login, register } from './auth';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

// Mock Next.js cookies
const mockSet = vi.fn();
const mockDelete = vi.fn();
vi.mock('next/headers', () => ({
    cookies: () => Promise.resolve({
        set: mockSet,
        delete: mockDelete,
    }),
}));

describe('Auth Actions Integration Tests', () => {
    beforeAll(async () => {
        // Ensure connection to memory server
        await dbConnect();
    });

    afterEach(async () => {
        // Clear mock calls
        vi.clearAllMocks();
        // Clear User collection
        await User.deleteMany({});
    });

    const mockAdminData = {
        name: 'Test Admin',
        email: 'test-admin@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        secretKey: process.env.ADMIN_SECRET || 'zusammen2026'
    };

    it('rejects unknown user login', async () => {
        const formData = new FormData();
        formData.append('email', 'unknown@example.com');
        formData.append('password', 'wrongpassword');

        const result = await login(formData);
        
        expect(result).toEqual({ success: false, error: 'error' });
        expect(mockSet).not.toHaveBeenCalled();
    });

    it('registers a new admin and logs in automatically', async () => {
        const formData = new FormData();
        formData.append('name', mockAdminData.name);
        formData.append('email', mockAdminData.email);
        formData.append('password', mockAdminData.password);
        formData.append('confirmPassword', mockAdminData.confirmPassword);
        formData.append('secretKey', mockAdminData.secretKey);

        const result = await register(formData);
        expect(result).toEqual({ success: true });

        // Verify User was created in DB
        const user = await User.findOne({ email: mockAdminData.email });
        expect(user).not.toBeNull();
        expect(user.role).toBe('admin');
        
        // Verify password was hashed
        const isMatch = await bcrypt.compare(mockAdminData.password, user.password);
        expect(isMatch).toBe(true);

        // Verify cookie was set
        expect(mockSet).toHaveBeenCalledTimes(1);
        expect(mockSet.mock.calls[0][0]).toBe('admin_session');
    });

    it('logs in with correct fake admin credentials', async () => {
        // 1. Manually create user in memory DB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mockAdminData.password, salt);
        await User.create({
            name: mockAdminData.name,
            email: mockAdminData.email,
            password: hashedPassword,
            role: 'admin'
        });

        // 2. Attempt login
        const formData = new FormData();
        formData.append('email', mockAdminData.email);
        formData.append('password', mockAdminData.password);

        const result = await login(formData);
        expect(result).toEqual({ success: true });

        // Verify cookie was set
        expect(mockSet).toHaveBeenCalledTimes(1);
        expect(mockSet.mock.calls[0][0]).toBe('admin_session');
    });

    it('rejects wrong password', async () => {
        // 1. Manually create user in memory DB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mockAdminData.password, salt);
        await User.create({
            name: mockAdminData.name,
            email: mockAdminData.email,
            password: hashedPassword,
            role: 'admin'
        });

        // 2. Attempt login with wrong password
        const formData = new FormData();
        formData.append('email', mockAdminData.email);
        formData.append('password', 'WrongPassword123!');

        const result = await login(formData);
        expect(result).toEqual({ success: false, error: 'error' });
        expect(mockSet).not.toHaveBeenCalled();
    });
});
