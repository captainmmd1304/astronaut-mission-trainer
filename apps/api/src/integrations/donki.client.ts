// PLACEHOLDER (no code yet)
// NASA DONKI client (base https://api.nasa.gov/DONKI/). Needs NASA_API_KEY.
// Fetch FLR (flares), CME and optionally CMEAnalysis for a date window. Validate responses with zod and
// normalize into SolarEvent[] from @amt/shared. Handle 429 (rate limit) by throwing a typed error so the
// service can fall back to cache. VERIFY whether CMEAnalysis exposes Mars impact data (see docs/DATA_SOURCES.md).
