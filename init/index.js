// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");

// const Mongo_URL = "mongodb://127.0.0.1:27017/wanderLust";
// main()
// .then(()=>{
//     console.log("Connected to DB");
// })
// .catch((err) =>{
//     console.log(err);
// });

// async function main(){
//     await mongoose.connect(Mongo_URL);
// }


// const initDB = async() =>{
//     await Listing.deleteMany({});
//     initData.data = initData.data.map((obj) =>({...obj, owner: "67973431c7f92cb2c997a04b"}))
//     await Listing.insertMany(initData.data);
//     console.log("Data was initialized");
// }

// initDB();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));// Make sure you've installed node-fetch
const MAPTILER_API_KEY =  process.env.MAP_API_KEY;


const Mongo_URL = "mongodb://127.0.0.1:27017/feedingHands";
main()
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(Mongo_URL);
}

const geocodeLocation = async (location) => {
    const geocodeUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${MAPTILER_API_KEY}`;
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    let coordinates = [0, 0]; // Default value in case no coordinates are found
    if (data.features && data.features.length > 0) {
        coordinates = data.features[0].geometry.coordinates; // [lng, lat]
    }

    return coordinates;
};

const initDB = async () => {
    await Listing.deleteMany({}); // Remove all previous data

    // Map through data, geocode the location, and add the coordinates
    initData.data = await Promise.all(initData.data.map(async (obj) => {
        const coordinates = await geocodeLocation(obj.location); // Geocode each location
        return { ...obj, owner: "67973431c7f92cb2c997a04b", coordinates }; // Add coordinates to the object
    }));

    await Listing.insertMany(initData.data); // Insert the modified data into the database
    console.log("Data was initialized with coordinates.");
};

initDB();