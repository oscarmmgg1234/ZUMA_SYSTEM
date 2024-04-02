const bwipjs = require("bwip-js");
const sharp = require("sharp");
const { db } = require("../../DB/db_init.js");
const { queries } = require("../../DB/queries.js");

const barcode_builder = (args, callback) => {
  const promises = [];
  for (let i = 0; i < parseInt(args.multiplier); i++) {
    let id = args.id;
    if (i > 0) {
      id = Math.floor(Math.random() * 1000000000);
      db(
        queries.tools.barcode_log,
        [
          id,
          args.employee_id,
          args.product_name,
          args.quantity,
          args.src == "Manually Printed"
            ? "Manually Printed"
            : "Active/Passive",
          args.TRANSACTIONID,
        ],
        (err, result) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
    else{
       db(
         queries.tools.barcode_log,
         [
           args.id,
           args.employee_id,
           args.product_name,
           args.quantity,
           args.src == "Manually Printed"
             ? "Manually Printed"
             : "Active/Passive",
           args.TRANSACTIONID,
         ],
         (err, result) => {
           if (err) {
             console.log(err);
           }
         }
       );
    }

    const text = id + ">" + args.TRANSACTIONID;

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
            const zumaLogo = await sharp(
              Buffer.from(
                `<svg width="300" height="50">
      <style>
        .underline { font: bold 25px Verdana; }
      </style>
      <text x="0" y="30" class="underline">ZUMA</text>
      <line x1="0" y1="35" x2="82" y2="35" stroke="black" stroke-width="2"/>
    </svg>`
              )
            ).toBuffer();

            const time = new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "America/Los_Angeles",
            });
            const timePrinted = await sharp(
              Buffer.from(
                `<svg width="300" height="20"><text x="0" y="9" font-family="Verdana" font-size="9"><tspan>Created:</tspan><tspan font-weight="bold">${time}</tspan></text></svg>`
              )
            ).toBuffer();

            const employeeText = await sharp(
              Buffer.from(
                `<svg width="300" height="20"><text x="0" y="11" font-family="Verdana" font-size="11"><tspan>Created by:</tspan><tspan font-weight="bold">${args.employee.substr(
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
            .greyscale()
            .sharpen()
              .toBuffer();

            const compo = await sharp(main_view)
              .composite([
                { input: b, top: 9, left: 180 },
                { input: zumaLogo, top: -2, left: 20 },
                { input: employeeText, top: 46, left: 10, text: args.employee },
                { input: productText, top: 60, left: 10 },
                { input: quantityText, top: 75, left: 10 },
                { input: timePrinted, top: 90, left: 10 },
              ])

              .toBuffer();

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
    .then(async (buffer_arr) => {
      const pngBuffer = buffer_arr.map((buffer) => buffer.toString("base64"));
      callback(pngBuffer);
      // var pdfBuffer = [];
      // for (buffer of buffer_arr) {
      //   pdfBuffer.push(await createPDFBuffer(buffer));
      // }
      // const mergedPdfBuffer = await mergePDFBuffers(pdfBuffer);
      // fs.writeFileSync("mergedPdfBuffer.pdf", mergedPdfBuffer);
      // callback(mergedPdfBuffer);
    })
    .catch((err) => {
      console.error("Error in Promise.all:", err);
      callback(err);
    });
};
exports.barcode_builder = barcode_builder;
