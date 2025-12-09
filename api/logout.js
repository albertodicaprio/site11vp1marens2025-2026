export default function handler(req, res) {
    // Delete cookie
    res.setHeader(
        "Set-Cookie",
        `auth=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict;`
    );
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({ success: true });
}
