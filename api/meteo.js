export default async function handler(req, res) {
    // Set cache headers for Vercel
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { city = "Nyon" } = req.query;

    try {
        // Step 1: Get access token
        const credentials = Buffer.from(
            `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
        ).toString("base64");

        const tokenResponse = await fetch(
            "https://api.srgssr.ch/oauth/v1/accesstoken?grant_type=client_credentials",
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Cache-Control": "no-cache",
                    "Content-Length": "0",
                },
            }
        );

        if (!tokenResponse.ok) {
            return res.status(tokenResponse.status).json({
                error: "Failed to get access token",
                details: await tokenResponse.text(),
            });
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Step 2: Get geolocation ID for the city
        const locationResponse = await fetch(
            `https://api.srgssr.ch/srf-meteo/v2/geolocationNames?name=${encodeURIComponent(city)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Cache-Control": "no-cache",
                },
            }
        );

        if (!locationResponse.ok) {
            return res.status(locationResponse.status).json({
                error: "Failed to get geolocation",
                details: await locationResponse.text(),
            });
        }

        const locationData = await locationResponse.json();

        if (!locationData || locationData.length === 0) {
            return res.status(404).json({
                error: "City not found",
                city: city,
            });
        }

        const geolocationId = locationData[0].geolocation.id;

        // Step 3: Get forecast for the geolocation ID
        const forecastResponse = await fetch(
            `https://api.srgssr.ch/srf-meteo/v2/forecastpoint/${geolocationId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Cache-Control": "no-cache",
                },
            }
        );

        if (!forecastResponse.ok) {
            return res.status(forecastResponse.status).json({
                error: "Failed to get forecast",
                details: await forecastResponse.text(),
            });
        }

        const forecastData = await forecastResponse.json();

        // Return the forecast data
        return res.status(200).json({
            city: city,
            geolocation_id: geolocationId,
            forecast: forecastData,
        });
    } catch (error) {
        console.error("Meteo API error:", error);
        return res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
}
