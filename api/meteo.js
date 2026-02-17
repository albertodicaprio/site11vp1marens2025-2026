import fs from "fs/promises";

async function readCache(cacheKey) {
    try {
        const cache_path = "/tmp/" + cacheKey + "-cache.json";
        const cache_ttl = 3600 * 1000; // 1 hour
        const raw = await fs.readFile(cache_path, "utf8");
        const parsed = JSON.parse(raw);

        if (Date.now() - parsed.timestamp > cache_ttl) {
            console.log("Cache expired, returning null");
            return null;
        }
        console.log("Cache hit, returning cached data");
        return parsed.data;
    } catch (error) {
        console.log("Some error reading cache, returning null", error);
        return null;
    }
}

async function writeCache(cacheKey, data) {
    const payload = {
        timestamp: Date.now(),
        data,
    };

    const cache_path = "/tmp/" + cacheKey + "-cache.json";
    await fs.writeFile(cache_path, JSON.stringify(payload));
}

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
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Create cache key
        const cacheKey = "meteo";

        console.log({
            "vercel": process.env.VERCEL,
            "vercel_env": process.env.VERCEL_ENV,
            "node_env": process.env.NODE_ENV
        });
        const isDev = process.env.VERCEL !== "1";
        console.log("isDev:", isDev);

        if (isDev) {
            cachedData = await readCache(cacheKey);
        } else {
            cache = await getCache();
            cachedData = await cache.get(cacheKey);
        }
        if (cachedData) {
            console.log("Returning from cache");
            return res.status(200).json({ ...cachedData, cached: true });
        }

        console.log("Fetching fresh meteo data");
        // Fetch data from API
        const data = await fetchMeteoData("Nyon");
        if (isDev) {
            writeCache(cacheKey, data);
        } else {
            await cache.set(cacheKey, data, { ttl: 3600 });
        }
        return res.status(200).json({ ...data, cached: false });
    } catch (error) {
        console.error("Meteo API error:", error);
        return res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
}
