const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection string with your credentials
const MONGO_URI = 'mongodb+srv://nativlevymail:TFwoirJwvNfypwgj@cluster0.y84fc.mongodb.net/esims?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'esims';
const COLLECTION_NAME = 'Provider';

// Function to fetch provider data from the API and upsert it in MongoDB
async function fetchAndUpsertProvider(providerName) {
  const apiUrl = `https://esims.io/api/products/provider/${providerName}?currency=USD`;

  try {
    // Fetch data for the specified provider
    const response = await axios.get(apiUrl);
    const providerData = response.data;

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    // Get the database and collection
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Prepare provider data for upsert (insert or update)
    const newProvider = {
      name: providerData.name || providerName,
      products: providerData.products,
      hasMore: providerData.hasMore || false,
      totalSize: providerData.totalSize || providerData.products.length,
    };

    // Update existing provider data or insert if not found
    const result = await collection.updateOne(
      { name: providerName }, // Search criteria
      { $set: newProvider },   // Fields to update
      { upsert: true }         // Insert if the provider doesn't exist
    );

    if (result.upsertedId) {
      console.log(`${providerName} provider inserted with ID:`, result.upsertedId);
    } else {
      console.log(`${providerName} provider data updated.`);
    }

    // Close the MongoDB connection
    await client.close();
  } catch (error) {
    console.error(`Error fetching or updating data for ${providerName}:`, error);
  }
}

// Specify the provider name here
const providerName = 'bnesim'; // Change this name to any provider you want

// Run the function with the specified provider name
fetchAndUpsertProvider(providerName);
