// middleware.js (place at project root)
export const config = {
    // match the exact paths you want protected
    matcher: ['/private(.*)']
};

export default function middleware(request) {
    console.log('Middleware triggered for request:', request.url);
    // read cookies from the incoming request headers
    const cookie = request.headers.get('cookie') || '';
    const url = new URL(request.url);
    console.log('Cookies:', cookie);

    // check for our auth cookie (issued by /api/login)
    if (!cookie.includes('auth=1')) {
        // redirect to the login page if not authenticated
        return Response.redirect(`${url.origin}/login.html`, 302);
    }

    return;
}
