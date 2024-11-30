const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection string with your credentials
const MONGO_URI = 'mongodb+srv://nativlevymail:TFwoirJwvNfypwgj@cluster0.y84fc.mongodb.net/esims?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'esims';
const COLLECTION_NAME = 'Provider';

// Function to fetch provider data from the API and add it to MongoDB
async function fetchAndAddProvider(providerName) {
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

    // Prepare provider data for upsert
    const updateData = {
      $set: {
        name: providerData.name || providerName,
        products: providerData.products,
        hasMore: providerData.hasMore || false,
        totalSize: providerData.totalSize || providerData.products.length,
      },
    };

    // Perform upsert (update if exists, insert if not)
    const result = await collection.updateOne(
      { name: providerData.name || providerName },
      updateData,
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log(`${providerName} provider inserted with ID:`, result.upsertedId._id);
    } else {
      console.log(`${providerName} provider updated successfully.`);
    }

    // Close the MongoDB connection
    await client.close();
  } catch (error) {
    console.error(`Error fetching or inserting data for ${providerName}:`, error);
  }
}

// Specify the provider name here
const providerName = 'etravelsim'; // Change this name to any provider you want

// Run the function with the specified provider name
fetchAndAddProvider(providerName);
