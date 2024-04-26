/*
Author: Oscar Maldonado
Date: 04/18/2024
Engine Utility
*/
const { query_manager } = require("../../DB/query_manager");

const knex = query_manager;

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
