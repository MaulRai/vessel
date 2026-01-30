export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Farcaster Mini App Webhook received:', body);

        // You can handle different events here:
        // - notifications: enabled/disabled
        // - app: added/removed

        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
