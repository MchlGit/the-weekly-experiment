import express from 'express';
import bodyParser from "body-parser";
import axios from 'axios';
import 'dotenv/config';

const app = express();
const port = 3000;
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_PLACES_API_KEY_DEV;
let restaurant;


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get('/', async (req, res) => {
    restaurant = await getRestaurant();
    console.log(restaurant);
    res.render('index.ejs', {restaurant: restaurant});
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})


if (!FOURSQUARE_API_KEY) {
    console.warn('⚠️ FOURSQUARE_PLACES_API_KEY is not set');
}

async function getRestaurantsNear({ lat, lon, limit = 10 }) {
    const url = 'https://places-api.foursquare.com/places/search';

    const response = await axios.get(url, {
        headers: {
            'X-Places-Api-Version': '2025-06-17',
            Authorization: 'Bearer ' + FOURSQUARE_API_KEY,
        },
        params: {
            ll: `${lat},${lon}`,
            fsq_category_ids: '4d4b7105d754a06374d81259', // restaurants category
            limit,
        },
    });

    return response.data.results;
}

async function getRestaurant() {
    try {
        // for now, hardcode a location (e.g., Seattle)
        const lat = 47.6062;
        const lon = -122.3321;

        const restaurants = await getRestaurantsNear({lat, lon, limit: 20});

        if (!restaurants.length) {
            return "No restaurants found";
            //return res.status(404).json({error: 'No restaurants found'});
        }

        const random = restaurants[Math.floor(Math.random() * restaurants.length)];
        return random.name;
    } catch (err) {
        console.log("THERE");
        console.error(err.response?.data || err.message);
        //res.status(500).json({error: 'Failed to fetch restaurant suggestion'});
        return 'Failed to fetch restaurant suggestion';
    }
}