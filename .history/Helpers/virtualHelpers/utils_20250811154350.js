/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-08-11 09:17:32

 temp

*/

exports.updateProductToken = async (db_handle, productID) => {
  const getToken = "SELECT * from product WHERE PRODUCT_ID = ?";
  const product = await db_handle.raw(getToken, [productID]);
  const parsedProduct = product[0][0];

  console.log(parsedProduct);
};
