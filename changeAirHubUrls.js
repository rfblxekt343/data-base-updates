const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://nativlevymail:TFwoirJwvNfypwgj@cluster0.y84fc.mongodb.net/esims?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'esims';
const COLLECTION_NAME = 'Provider';

async function cleanAndFormatAirhubUrls() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Find the airhub provider
    const provider = await collection.findOne({ name: 'airhub' });
    if (!provider) {
      console.log('No provider named "airhub" found.');
      return;
    }

    // Format URLs in products
    const updatedProducts = provider.products.map((product) => {
      const url = new URL(product.url);
      let cleanUrl;

      // Extract and decode the 'u' query parameter if it exists
      if (url.searchParams.has('u')) {
        const decodedUrl = decodeURIComponent(url.searchParams.get('u'));
        cleanUrl = decodedUrl.split('?')[0]; // Remove query parameters
      } else {
        cleanUrl = product.url.split('?')[0]; // Remove query parameters if no 'u' exists
      }

      // Format the URL with the new structure
      const formattedUrl = `https://gighubsystemsinc.sjv.io/9Lg7M0?u=${encodeURIComponent(cleanUrl)}`;

      return { ...product, url: formattedUrl }; // Replace with the formatted URL
    });

    // Update the database with formatted URLs
    const result = await collection.updateOne(
      { name: 'airhub' },
      { $set: { products: updatedProducts } }
    );

    console.log(`Formatted URLs for ${result.modifiedCount} products.`);
    await client.close();
  } catch (error) {
    console.error('Error formatting URLs:', error);
  }
}

cleanAndFormatAirhubUrls();
