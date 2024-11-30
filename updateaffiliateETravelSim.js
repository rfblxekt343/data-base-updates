const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://nativlevymail:TFwoirJwvNfypwgj@cluster0.y84fc.mongodb.net/esims?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'esims';
const COLLECTION_NAME = 'Provider';
const NEW_AFFILIATE_CODE = '252'; // New affiliate code

async function updateEtravelsimUrls() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Find the etravelsim provider
    const etravelsimProvider = await collection.findOne({ name: "etravelsim" });

    if (!etravelsimProvider) {
      console.log("No provider found with the name 'etravelsim'");
      await client.close();
      return;
    }

    // Update each product's URL to modify only the 'aff' attribute
    const updatedProducts = etravelsimProvider.products.map(product => {
      let newUrl = product.url;

      // Replace the 'aff' attribute with the new code
      if (newUrl.includes('aff=')) {
        newUrl = newUrl.replace(/aff=\d+/, `aff=${NEW_AFFILIATE_CODE}`);
      } else {
        // If 'aff' is not found, add it at the end
        newUrl += `${newUrl.includes('?') ? '&' : '?'}aff=${NEW_AFFILIATE_CODE}`;
      }

      product.url = newUrl;
      return product;
    });

    // Update the provider's products with the modified URLs
    const result = await collection.updateOne(
      { _id: etravelsimProvider._id },
      { $set: { products: updatedProducts } }
    );

    console.log(`Updated URLs for ${result.modifiedCount} etravelsim provider document(s).`);

    await client.close();
  } catch (error) {
    console.error('Error updating etravelsim URLs:', error);
  }
}

updateEtravelsimUrls();
