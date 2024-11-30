const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://nativlevymail:TFwoirJwvNfypwgj@cluster0.y84fc.mongodb.net/esims?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'esims';
const COLLECTION_NAME = 'Provider';
const AFFILIATE_LINK = 'https://airalo.pxf.io/c/5851184/2182295/15608?p.code=EF30'; // Your full affiliate link

async function updateAffiliateLinks() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Find the Airalo provider
    const airaloProvider = await collection.findOne({ name: "airalo" });

    if (!airaloProvider) {
      console.log("No provider found with the name 'airalo'");
      await client.close();
      return;
    }

    // Update each product's URL to include your affiliate link
    const updatedProducts = airaloProvider.products.map(product => {
      // Extract the original product path from the URL
      const url = new URL(product.url);
      const originalPath = url.searchParams.get('u'); // Extracts the 'u' parameter value

      // Construct the new URL with the affiliate link and original path
      const newUrl = `${AFFILIATE_LINK}&u=${encodeURIComponent(originalPath)}`;

      product.url = newUrl;
      return product;
    });

    // Update the provider's products with the modified URLs
    const result = await collection.updateOne(
      { _id: airaloProvider._id },
      { $set: { products: updatedProducts } }
    );

    console.log(`Updated URLs for ${result.modifiedCount} Airalo provider document(s).`);

    await client.close();
  } catch (error) {
    console.error('Error updating Airalo URLs:', error);
  }
}

updateAffiliateLinks();
