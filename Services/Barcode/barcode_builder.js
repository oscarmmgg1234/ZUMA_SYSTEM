const bwipjs = require("bwip-js");
const sharp = require("sharp");

const barcode_builder = (args, callback) => {
  const promises = [];
  const text = args.employee_id + ">" + args.product_id + ">" + args.quantity + ">" + args.id;
  for (let i = 0; i < parseInt(args.multiplier); i++) {
    const promise = new Promise((resolve, reject) => {
      bwipjs.toBuffer(
        {
          bcid: "qrcode",
          text: text,
          scale: 1,
          height: 20,
          includetext: false,
        },
        async (err, barcodeBuffer) => {
          if (err) {
            console.error("Error in bwip-js:", err);
            return reject(err);
          }

          try {
            // Placeholder: using a 1x1 white pixel for demonstration
            // const textImage = await sharp({
            //   create: {
            //     width: 1,
            //     height: 1,
            //     channels: 4,
            //     background: { r: 255, g: 255, b: 255, alpha: 1 },
            //   },
            // }).toBuffer();

            // // Composite barcode and text
            // const compositeBuffer = await sharp(barcodeBuffer)
            //   .composite([{ input: textImage, top: 0, left: 50 }])
            //   .toBuffer();
            const employeeText = await sharp(
              Buffer.from(
                `<svg width="300" height="20"><text x="0" y="11" font-family="Verdana" font-size="11"><tspan>Emp:</tspan><tspan font-weight="bold">${args.employee.substr(
                  0,
                  10
                )}</tspan></text></svg>`
              )
            ).toBuffer();
            const productText = await sharp(
              Buffer.from(
                `<svg width="300" height="20"><text x="0" y="11" font-family="Verdana" font-size="11"><tspan>Prod:</tspan><tspan font-weight="bold">${args.product_name.substr(
                  0,
                  13
                )}</tspan></text></svg>`
              )
            ).toBuffer();
            const quantityText = await sharp(
              Buffer.from(
                `<svg width="300" height="20"><text x="0" y="11" font-family="Verdana" font-size="11"><tspan>Quantity:</tspan><tspan font-weight="bold">${args.quantity.toString()}</tspan></text></svg>`
              )
            ).toBuffer();

            const b = await sharp(barcodeBuffer).resize(100, 100).toBuffer();

            const main_view = await sharp({
              create: {
                width: 300,
                height: 120,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 },
              },
            })
              .png()
              .toBuffer();

            const compo = await sharp(main_view)
              .composite([
                { input: b, top: 10, left: 180 },
                { input: employeeText, top: 20, left: 10, text: args.employee },
                { input: productText, top: 45, left: 10 },
                { input: quantityText, top: 70, left: 10 },
              ])
              .toBuffer();

            console.log("Buffer created successfully.");
            resolve(compo);
          } catch (sharpErr) {
            console.error("Error in Sharp:", sharpErr);
            reject(sharpErr);
          }
        }
      );
    });
    promises.push(promise);
  }

  Promise.all(promises)
    .then((buffer_arr) => {
      callback(buffer_arr);
    })
    .catch((err) => {
      console.error("Error in Promise.all:", err);
      callback(err);
    });
};
exports.barcode_builder = barcode_builder;
