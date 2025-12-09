export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { password } = req.body;

    if (password === process.env.AUTH_PASSWORD) {
        // Valid password → set secure cookie
        res.setHeader(
            "Set-Cookie",
            `auth=1; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400;`
        );

        return res.status(200).json({ success: true });
    }

    return res.status(401).json({ success: false, error: "Wrong password" });
}
