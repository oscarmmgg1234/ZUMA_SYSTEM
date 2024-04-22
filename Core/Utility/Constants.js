/*
Author: Oscar Maldonado
Date: 04/18/2024
Engine Utility
*/
const { query_manager } = require("../../DB/query_manager");

const knex = query_manager;

const productConsumption = async (
  productBottleSizeML = 50,
  productQuantity,
  product_id
) => {
  const productBaseGallon = await knex.raw(
    "SELECT Product_Base_Gallon FROM product WHERE PRODUCT_ID = ?",
    [product_id]
  );
  const productBaseGallon_toMill =
    productBaseGallon[0][0].Product_Base_Gallon * 3785.41;
  return (productBottleSizeML * productQuantity) / productBaseGallon_toMill;
};

const glycerinCompsumption = async (
  productQuantity,
  productBottleSizeML = 50,
  ratio
) => {
  const glycerinBottleSize = await knex.raw(
    "SELECT GlycerinGallonUnitConstant FROM system_config WHERE system_config.Index = 1"
  );

  const glycerinBottleAmountGALLONS_toMill =
    glycerinBottleSize[0][0].GlycerinGallonUnitConstant * 3785.41;
  const productGlycerinAmountOZ_toMill = ratio * 29.5735;
  const totalMillInMixture =
    glycerinBottleAmountGALLONS_toMill + productGlycerinAmountOZ_toMill;

  return (
    (((productBottleSizeML * productQuantity) / totalMillInMixture) *
      productGlycerinAmountOZ_toMill) /
    glycerinBottleAmountGALLONS_toMill
  );
};

const ultil = {
  productConsumption: productConsumption,
  glycerinCompsumption: glycerinCompsumption,
};

exports.ultil = ultil;
