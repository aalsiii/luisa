import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { password } = await req.json();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            return NextResponse.json(
                { message: 'Admin password not configured on server' },
                { status: 500 }
            );
        }

        if (password === adminPassword) {
            // In a real app, you'd verify a token or set a cookie.
            // For this simple implementation, we'll just return success 
            // and let the client handle the "logged in" state (e.g. localStorage).
            // A more secure way would be to set an HttpOnly cookie here.

            const response = NextResponse.json({ success: true });
            response.cookies.set('admin_token', 'logged-in', {
                httpOnly: true,
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });
            return response;
        } else {
            return NextResponse.json(
                { message: 'Invalid password' },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
