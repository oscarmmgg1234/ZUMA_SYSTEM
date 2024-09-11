function extractMLType(token) {
  const first = token.split(" ");
  const second = first.map((item) => item.split(":"));
  const targetToken = second.filter((item) => item[1] == "2j2h");
  //now we have an array of arrays
  const bottleSize = targetToken[0][4] ? targetToken[0][4] : null;
  if (!bottleSize) {
    return null;
  }
  return parseFloat(bottleSize);
} 

function isGlycerin(token){
    const first = token.split(" ");
    const second = first.map((item) => item.split(":"));
    const targetToken = second.filter((item) => item[1] == "2q3e");
    if (targetToken.length > 0) {
      return true;
    }
    return false;
}

function calcBottleCount(gallon, token, glycerin = false) {
  const galllon = 3785.41;
  const glycerinRatio = 768.912;
  const mixture = glycerin ? glycerinRatio + gallon : galllon;
  return mixture / extractMLType(token);
}

function theoreticalBottleCount(gallon, token) {
  const mlType = extractMLType(token);
  if (!mlType) {
    return null;
  }
  return calcBottleCount(gallon, token, isGlycerin(token));
}


//create barcode bot to reduce inactive barcodes and free up space

module.exports.theoreticalBottleCount = theoreticalBottleCount;
