import express from "express";

const router = express.Router();


// =====================================================
// NOMINATIM - FIND LOCATION FROM CITY / PLACE NAME
// =====================================================

async function geocodeLocation(location) {

    const searchText =
        location.toLowerCase().includes("india")
            ? location
            : `${location}, India`;


    const params = new URLSearchParams({

        q: searchText,

        format: "jsonv2",

        limit: "1",

        countrycodes: "in",

        addressdetails: "1"

    });


    const response = await fetch(

        `https://nominatim.openstreetmap.org/search?${params}`,

        {

            method: "GET",

            headers: {

                "User-Agent":
                    "MediAssist/1.0 (medical assistant application)",

                "Accept":
                    "application/json",

                "Referer":
                    "http://localhost:5000/"

            }

        }

    );


    if (!response.ok) {

        throw new Error(
            `Nominatim API error: ${response.status}`
        );

    }


    const data =
        await response.json();


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        return null;

    }


    const place =
        data[0];


    return {

        latitude:
            Number(place.lat),

        longitude:
            Number(place.lon),

        displayName:
            place.display_name || location

    };

}


// =====================================================
// SEARCH NEARBY DOCTORS / HEALTHCARE
//
// Supports:
//
// 1. Coordinates:
//
// /api/doctors/search?lat=23.34&lon=85.30
//
// 2. Location:
//
// /api/doctors/search?location=Delhi
//
// =====================================================

router.get("/search", async (req, res) => {

    try {

        let {
            lat,
            lon,
            location
        } = req.query;


        let latitude;
        let longitude;

        let searchedLocation = null;


        // =================================================
        // OPTION 1: COORDINATES PROVIDED
        // =================================================

        if (lat && lon) {

            latitude =
                Number(lat);

            longitude =
                Number(lon);

        }


        // =================================================
        // OPTION 2: LOCATION NAME PROVIDED
        // =================================================

        else if (location) {

            const cleanLocation =
                String(location).trim();


            if (!cleanLocation) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid location."

                });

            }


            console.log(
                `📍 Geocoding location: ${cleanLocation}`
            );


            const coordinates =
                await geocodeLocation(
                    cleanLocation
                );


            if (!coordinates) {

                return res.status(404).json({

                    success: false,

                    message:
                        `Location "${cleanLocation}" could not be found.`

                });

            }


            latitude =
                coordinates.latitude;

            longitude =
                coordinates.longitude;

            searchedLocation =
                coordinates.displayName;


            console.log(
                "📍 Location found:",
                searchedLocation
            );

            console.log(
                "📍 Coordinates:",
                latitude,
                longitude
            );

        }


        // =================================================
        // NO LOCATION PROVIDED
        // =================================================

        else {

            return res.status(400).json({

                success: false,

                message:
                    "Latitude/longitude or location is required."

            });

        }


        // =================================================
        // VALIDATE COORDINATES
        // =================================================

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid latitude or longitude."

            });

        }


        if (
            latitude < -90 ||
            latitude > 90
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Latitude must be between -90 and 90."

            });

        }


        if (
            longitude < -180 ||
            longitude > 180
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Longitude must be between -180 and 180."

            });

        }


        // =================================================
        // OVERPASS QUERY
        // =================================================

        const query = `

[out:json][timeout:10];

(
    node["amenity"="hospital"]
        (around:2000,${latitude},${longitude});

    node["amenity"="clinic"]
        (around:2000,${latitude},${longitude});

    node["amenity"="doctors"]
        (around:2000,${latitude},${longitude});
);

out tags;

`;


        console.log(
            "🔎 Searching healthcare facilities..."
        );


        // =================================================
        // CALL OVERPASS
        // =================================================

        // =====================================================
// OVERPASS SERVERS
// =====================================================

const overpassServers = [

    "https://overpass.private.coffee/api/interpreter",

    "https://overpass-api.de/api/interpreter"

];


// =====================================================
// TRY OVERPASS SERVERS
// =====================================================

let response = null;

let lastError = null;


for (const server of overpassServers) {

    try {

        console.log(
            `🔎 Trying Overpass server: ${server}`
        );


        response = await fetch(

            server,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/x-www-form-urlencoded",

                    "User-Agent":
                        "MediAssist/1.0 (medical assistant application)",

                    "Accept":
                        "application/json"

                },

                body:
                    new URLSearchParams({

                        data: query

                    })

            }

        );


        if (response.ok) {

            console.log(
                `✅ Overpass server worked: ${server}`
            );

            break;

        }


        console.log(
            `⚠️ Overpass ${server} returned ${response.status}`
        );


        lastError =
            new Error(
                `Overpass API error: ${response.status}`
            );


    } catch (error) {

        console.log(
            `⚠️ Overpass server failed: ${server}`
        );


        lastError = error;

    }

}


// =====================================================
// IF ALL SERVERS FAILED
// =====================================================

if (
    !response ||
    !response.ok
) {

    throw (
        lastError ||
        new Error(
            "All Overpass servers failed."
        )
    );

}


        // =================================================
        // OVERPASS ERROR
        // =================================================

        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Overpass Error:",
                response.status,
                errorText
            );


            throw new Error(
                `Overpass API error: ${response.status}`
            );

        }


        // =================================================
        // READ JSON
        // =================================================

        const data =
            await response.json();


        if (
            !data ||
            !Array.isArray(data.elements)
        ) {

            return res.json({

                success: true,

                count: 0,

                searchedLocation,

                coordinates: {

                    latitude,

                    longitude

                },

                results: []

            });

        }


        // =================================================
        // FORMAT RESULTS
        // =================================================

        const places =
            data.elements.map((place) => {

                const tags =
                    place.tags || {};


                // -----------------------------------------
                // COORDINATES
                // -----------------------------------------

                const placeLat =
                    place.lat ??
                    place.center?.lat ??
                    null;


                const placeLon =
                    place.lon ??
                    place.center?.lon ??
                    null;


                // -----------------------------------------
                // ADDRESS
                // -----------------------------------------

                const addressParts = [

                    tags["addr:housenumber"],

                    tags["addr:street"],

                    tags["addr:suburb"],

                    tags["addr:city"],

                    tags["addr:state"],

                    tags["addr:postcode"]

                ].filter(Boolean);


                const address =
                    tags["addr:full"] ||
                    addressParts.join(", ");


                // -----------------------------------------
                // RESULT
                // -----------------------------------------

                return {

                    id:
                        place.id,

                    name:
                        tags.name ||
                        tags["official_name"] ||
                        "Healthcare Facility",

                    type:
                        tags.amenity ||
                        tags.healthcare ||
                        "Healthcare",

                    speciality:
                        tags["healthcare:speciality"] ||
                        tags["healthcare:specialty"] ||
                        "",

                    address:
                        address ||
                        "Address not available",

                    phone:
                        tags.phone ||
                        tags["contact:phone"] ||
                        "",

                    openingHours:
                        tags.opening_hours ||
                        "",

                    website:
                        tags.website ||
                        tags["contact:website"] ||
                        "",

                    latitude:
                        placeLat,

                    longitude:
                        placeLon

                };

            });


        // =================================================
        // REMOVE DUPLICATES
        // =================================================

        const uniquePlaces =
            places.filter(

                (place, index, self) =>

                    index ===
                    self.findIndex(

                        (item) =>
                            item.id === place.id

                    )

            );


        // =================================================
        // RESPONSE
        // =================================================

        console.log(
            `✅ Found ${uniquePlaces.length} healthcare facilities`
        );


        return res.json({

            success: true,

            count:
                uniquePlaces.length,

            searchedLocation,

            coordinates: {

                latitude,

                longitude

            },

            results:
                uniquePlaces

        });


    } catch (error) {

        // =================================================
        // ERROR
        // =================================================

        console.error(
            "❌ Doctor Search Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to search nearby healthcare facilities.",

            error:
                error.message

        });

    }

});


// =====================================================
// EXPORT
// =====================================================

export default router;