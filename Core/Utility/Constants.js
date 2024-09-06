/*
Author: Oscar Maldonado
Date: 04/18/2024
Engine Utility
*/
//one approach to having more consistent and accurate stock of product given gallons uncertainty

const { get } = require("http");

// not all gallons of a product are exact so modify equation to take in a error correction constant to account for this, modify database to keep track of negative stock specially in gallons to find a more avarage out stock of a product
const productConsumption = (
  productBase,
  productBottleSizeML = 50,
  productQuantity
) => {
  // auxilaryParam = productBase, auxilaryParam2 = productBottleSizeML, auxilaryParam3 = productQuantity
  const productBaseGallon_toMill = productBase * 3785.41;
  return (productBottleSizeML * productQuantity) / productBaseGallon_toMill;
  // the fix would be to keep track of shipments and consumption of product in gallons until depleted then add the negative stock to the stock of the product and intergrate and find k and as time goes then avarage out the calcualted stock of the product and use that K
  //k = actual stock of product integration over bottle count/ theoritical stock of product integration over bottle count
  // we can set this up and let this run and accumulate data over time to get a more accurate k value before we can use it
  //we can keep track by everytime we insert new shipment and if stock is < 0.5 then we can snapshot that for actual use of product and then calulcate using previous shipmnet of that product
};


const glycerinCompsumption = async (
  db_handle,
  productQuantity,
  productBottleSizeML = 50,
  ratioOZ
) => {
 

  const glycerinBottleSize = await db_handle.raw(
    "SELECT GlycerinGallonUnitConstant FROM system_config WHERE system_config.Index = 1"
  );

  const glycerinBottleAmountGALLONS_toMill =
    glycerinBottleSize[0][0].GlycerinGallonUnitConstant * 3785.41;
  const productGlycerinAmountOZ_toMill = ratioOZ * 29.5735;
  const totalMillInMixture =
    glycerinBottleAmountGALLONS_toMill + productGlycerinAmountOZ_toMill;
  return (
    (((productBottleSizeML * productQuantity) / totalMillInMixture) *
      productGlycerinAmountOZ_toMill) /
    glycerinBottleAmountGALLONS_toMill
  );
};
function generateRandomID(length) {
  // Create a random ID with a specified length
  let result = "";
  // Define the characters that can be included in the ID
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    // Append a random character from the characters string
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const util = {
  productConsumption: productConsumption,
  glycerinCompsumption: glycerinCompsumption,
  generateRandomID: generateRandomID,
};

exports.util = util;
