const axios = require('axios');
const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGO_URI = 'mongodb+srv://nativlevymail:TFwoirJwvNfypwgj@cluster0.y84fc.mongodb.net/esims?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'esims';
const COLLECTION_NAME = 'Provider';

// BNeSIM API configuration
const BNESIM_API_BASE_URL = 'https://api.bnesim.com/v0.1';
const BNESIM_AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual auth token

async function fetchAndAddBNeSIMProvider() {
  const apiUrl = `${BNESIM_API_BASE_URL}/product/`;

  try {
    const response = await axios.get(apiUrl, {
      params: {
        auth_token: BNESIM_AUTH_TOKEN
      },
      headers: { 
        'accept': 'application/json'
      }
    });

    const apiData = response.data;

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    // Get the database and collection
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Prepare provider data for upsert
    const updateData = {
      $set: {
        name: 'BNeSIM',
        products: (apiData.products || []).map(product => ({
          id: product.id,
          name: product.name,
          duration: product.duration,
          minutes: product.minutes,
          volumeHomeCountries: product.volume_home_countries,
          price: product.price,
          description: product.description,
          type: product.type,
          externalId: product.external_id
        })),
        regionNames: apiData.region_names || [],
        coverageCountries: apiData.coverage_countries || [],
        hasMore: false,
        totalSize: (apiData.products || []).length,
        lastUpdated: new Date()
      }
    };

    // Perform upsert
    const result = await collection.updateOne(
      { name: 'BNeSIM' },
      updateData,
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('BNeSIM provider inserted with ID:', result.upsertedId._id);
    } else {
      console.log('BNeSIM provider updated successfully.');
    }

    // Close the MongoDB connection
    await client.close();

  } catch (error) {
    console.error('Error fetching BNeSIM data:', 
      error.response ? error.response.data : error.message
    );
  }
}

// Run the function
fetchAndAddBNeSIMProvider();