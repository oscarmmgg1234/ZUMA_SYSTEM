/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2024-05-01 22:20:49

    Description: This file is the one that will generate the PDFs for the application

*/

const { PDFDocument } = require("pdf-lib");
const { query_manager } = require("../../DB/query_manager");

const knex = query_manager;

class pdf_generator {
  constructor() {
    if (!pdf_generator.instance) {
      pdf_generator.instance = this;
    }
    this.productsPerBatch = 30; // Limit of products per PDF
  }

  async merge_pdf(buffers) {
    const mergedPdf = await PDFDocument.create();
    for (let buffer of buffers) {
      const pdf = await PDFDocument.load(buffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }
    return await mergedPdf.save();
  }

  async generateMultiplePDF(products, template = "INVENTORY_SHEET") {
    const batches = [];
    for (let i = 0; i < products.products.length; i += this.productsPerBatch) {
      const batch = products.products.slice(i, i + this.productsPerBatch);
      const pdfBlob = await this.inventoryPDFA4(
        batch,
        template,
        products.company
      );
      batches.push(Buffer.from(pdfBlob));
    }
    return await this.merge_pdf(batches);
  }

  async inventoryPDFA4(batch, template = "INVENTORY_SHEET", company) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
      cache: "no-cache",
      body: JSON.stringify({
        data: {
          company: company ? company : null,
          product: batch.map((item) => ({
            id: item.PRODUCT_ID,
            product: item.PRODUCT_NAME,
            stock: item.STOCK,
            active: item.ACTIVE_STOCK,
            stored: item.STORED_STOCK,
          })),
        },
        template: template,
      }),
    };

    try {
      const process = await fetch(
        "http://192.168.1.176:3003/PDF/PDFA4_Generate",
        requestOptions
      );
      const response = await process.arrayBuffer();
      return response;
    } catch (error) {
      console.error("error", error);
    }
  }

  async generatePDFsForAllProducts() {
    const inventory = await knex.raw(`SELECT product_inventory.*, product.TYPE
FROM product_inventory
JOIN product ON product_inventory.PRODUCT_ID = product.PRODUCT_ID
ORDER BY product.TYPE;
`);
    const products = inventory[0];
    return await this.generateMultiplePDF({ products });
  }

  async generateInventoryByCompany(company_id) {
    const inventory =
      await knex.raw(`SELECT product_inventory.*, product.COMPANY
FROM product_inventory
JOIN product ON product_inventory.PRODUCT_ID = product.PRODUCT_ID
WHERE product.COMPANY = ${company_id}`);
    const company = await knex.raw(
      `SELECT NAME FROM company WHERE COMPANY_ID = ${company_id}`
    );

    const products = inventory[0];
    return await this.generateMultiplePDF(
      { products, company: company[0][0].NAME },
      "INVENTORY_BY_COMPANY_SHEET"
    );
  }
}

module.exports = new pdf_generator();
