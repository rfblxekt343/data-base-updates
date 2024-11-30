const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://nativlevymail:TFwoirJwvNfypwgj@cluster0.y84fc.mongodb.net/esims?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'esims';
const COLLECTION_NAME = 'Provider';
const AFFILIATE_LINK_TEMPLATE = 'https://gomoworld.pxf.io/c/5851184/2070766/24792'; // Your affiliate base URL

async function updateAffiliateLinks() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Find all providers with a URL that needs to be updated
    const providers = await collection.find({}).toArray();

    if (providers.length === 0) {
      console.log("No providers found in the database.");
      await client.close();
      return;
    }

    // Loop through each provider and update their URLs
    for (let provider of providers) {
      const updatedProducts = provider.products.map(product => {
        // Extract the shortlink from the original URL
        const url = new URL(product.url);
        const shortlink = url.searchParams.get('shortlink'); // Get the shortlink value
        
        if (shortlink) {
          // Construct the new URL with your affiliate link
          const newUrl = `${AFFILIATE_LINK_TEMPLATE}&shortlink=${shortlink}`;
          product.url = newUrl;
        }

        return product;
      });

      // Update the provider's products with the modified URLs
      const result = await collection.updateOne(
        { _id: provider._id },
        { $set: { products: updatedProducts } }
      );

      console.log(`Updated URLs for ${result.modifiedCount} products in provider: ${provider.name}`);
    }

    await client.close();
  } catch (error) {
    console.error('Error updating provider URLs:', error);
  }
}

updateAffiliateLinks();
