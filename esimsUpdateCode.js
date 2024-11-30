const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://nativlevymail:TFwoirJwvNfypwgj@cluster0.y84fc.mongodb.net/esims?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'esims';
const COLLECTION_NAME = 'Provider';
const AFFILIATE_CODE = 'SMARTESIM'; // Your affiliate coupon code
const AFFILIATE_ID = '190390'; // Your affiliate ID for esims.sm



async function updateEsimSmUrls() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Find the provider (assuming "esims.sm" is stored in your database)
    const provider = await collection.findOne({ name: "etravelsim" });

    if (!provider) {
      console.log("No provider found with the name 'esims.sm'");
      await client.close();
      return;
    }

    // Update each product's URL to include your affiliate link and coupon code
    const updatedProducts = provider.products.map(product => {
      let newUrl = product.url;

      // Remove any existing affiliate code or coupon in the URL
      newUrl = newUrl.replace(/(\?|\&)coupon=[^&]+/, '');
      newUrl = newUrl.replace(/(\?|\&)aff_id=[^&]+/, '');

      // Add your affiliate ID and coupon code
      newUrl += `${newUrl.includes('?') ? '&' : '?'}aff_id=${AFFILIATE_ID}&coupon=${AFFILIATE_CODE}`;

      product.url = newUrl;
      return product;
    });

    // Update the provider's products with the modified URLs
    const result = await collection.updateOne(
      { _id: provider._id },
      { $set: { products: updatedProducts } }
    );

    

    await client.close();
  } catch (error) {
    console.error('Error updating esims.sm URLs:', error);
  }
}

updateEsimSmUrls();
