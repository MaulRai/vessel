export async function GET() {
    const isProduction = process.env.NODE_ENV === 'production';
    const appUrl = isProduction
        ? (process.env.NEXT_PUBLIC_APP_URL || 'https://vessel.finance')
        : 'http://localhost:3000';

    const manifest = {
        accountAssociation: {
            header: "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
            payload: "eyJkb21haW4iOiJ2ZXNzZWwuZmluYW5jZSJ9",
            signature: "placeholder_signature" // To be updated by the user after deployment
        },
        miniapp: {
            version: "1",
            name: "Vessel Finance",
            homeUrl: appUrl,
            iconUrl: `${appUrl}/vessel-icon.png`,
            splashImageUrl: `${appUrl}/vessel-logo.png`,
            splashBackgroundColor: "#000000",
            webhookUrl: `${appUrl}/api/webhook`,
            subtitle: "Export Financing on Base",
            description: "Fast, transparent export financing for SMEs using Base Network.",
            screenshotUrls: [
                `${appUrl}/screenshot1.png`
            ],
            primaryCategory: "finance",
            tags: ["finance", "export", "base", "miniapp"],
            heroImageUrl: `${appUrl}/vessel-logo.png`,
            tagline: "Finance your exports instantly",
            ogTitle: "Vessel Finance Mini App",
            ogDescription: "The future of export financing on Base.",
            ogImageUrl: `${appUrl}/vessel-logo.png`,
            noindex: false
        }
    };

    return Response.json(manifest);
}
