import { getCache } from "@vercel/functions";

/**
 * Fetch meteo data from the API
 * Fetches access token, geolocation ID, and forecast data
 */
async function fetchMeteoData(city) {
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
        throw new Error(
            `Failed to get access token: ${tokenResponse.status} ${await tokenResponse.text()}`
        );
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
        throw new Error(
            `Failed to get geolocation: ${locationResponse.status} ${await locationResponse.text()}`
        );
    }

    const locationData = await locationResponse.json();

    if (!locationData || locationData.length === 0) {
        throw new Error(`City not found: ${city}`);
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
        throw new Error(
            `Failed to get forecast: ${forecastResponse.status} ${await forecastResponse.text()}`
        );
    }

    const forecastData = await forecastResponse.json();

    return {
        city,
        geolocation_id: geolocationId,
        forecast: forecastData,
    };
}

export default async function handler(req, res) {
    // Set cache headers for Vercel
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Create cache key
        const cacheKey = "meteo";
        const cache = getCache();

        // Check if data exists in cache
        const cachedData = await cache.get(cacheKey);

        if (cachedData) {
            console.log("Returning from cache");
            return res.status(200).json({ ...cachedData, cached: true });
        }

        console.log("Fetching fresh meteo data");
        // Fetch data from API
        const data = await fetchMeteoData("Nyon");

        // Store in cache with 1-hour TTL (3600 seconds)
        await cache.set(cacheKey, data, { ttl: 3600 });

        return res.status(200).json({ ...data, cached: false });
    } catch (error) {
        console.error("Meteo API error:", error);
        return res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
}
