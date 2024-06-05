/*
Author: Oscar Maldonado
Date: 04/18/2024
Engine Utility
*/

const productConsumption = (
  productBase,
  productBottleSizeML = 50,
  productQuantity
) => {
  // auxilaryParam = productBase, auxilaryParam2 = productBottleSizeML, auxilaryParam3 = productQuantity
  const productBaseGallon_toMill = productBase * 3785.41;
  return (productBottleSizeML * productQuantity) / productBaseGallon_toMill;
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
