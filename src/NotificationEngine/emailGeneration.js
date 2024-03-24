require("dotenv").config();
const { EmailClient } = require("@azure/communication-email");
const { productAlert } = require("./productStockAlert");
const { db_interface } = require("../DB/interface");
const db_api = new db_interface();

// Ensure that the COMMUNICATION_SERVICES_CONNECTION_STRING environment variable is set
const connectionString =
  process.env["COMMUNICATION_SERVICES_CONNECTION_STRING"];
const client = new EmailClient(connectionString);

async function main() {
  const products = await productAlert();
  const recipents = await db_api.emailservice.getRecipents();

  const formatRecipents = recipents.map((recipent) => {
    return { address: recipent.Email };
  });

  if (products.length === 0) {
    return;
  }

  const productList = products.map((product) => `${product.NAME}`).join("\n");
  const emailMessage = {
    senderAddress:
      "DoNotReply@2d2301f7-972c-4314-8cdc-6c49fbb2cf07.azurecomm.net",
    content: {
      subject: "Zuma Low Stock Alert",
      plainText: `The following Products require review and/or ordering to avoid stockout issues:\n\n${productList}`,
      html: `
  <div style="background-color:#A5BEBA;padding:20px;text-align:center;">
    <h1 style="color:white;font-family:Arial, sans-serif;">Zuma Automated Alert</h1>
  </div>
  <div style="font-family:Arial, sans-serif;padding:20px;">
    <p>The following Products require review and/or ordering to avoid stockout issues:</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <th style="border:1px solid #ddd;padding:8px;background-color:#f2f2f2;">Name of Product</th>
        <th style="border:1px solid #ddd;padding:8px;background-color:#f2f2f2;">Stock</th>
        <th style="border:1px solid #ddd;padding:8px;background-color:#f2f2f2;">Stored Stock</th>
        <th style="border:1px solid #ddd;padding:8px;background-color:#f2f2f2;">Active Stock</th>
        <th style="border:1px solid #ddd;padding:8px;background-color:#f2f2f2;">Unit Type</th>
      </tr>
      ${products
        .map(
          (product) =>
            `<tr>
            <td style="border:1px solid #ddd;padding:8px;">${product.NAME}</td>
            <td style="border:1px solid #ddd;padding:8px;">${product.stock.STOCK}</td>
            <td style="border:1px solid #ddd;padding:8px;">${product.stock.STORED_STOCK}</td>
            <td style="border:1px solid #ddd;padding:8px;">${product.stock.ACTIVE_STOCK}</td>
            <td style="border:1px solid #ddd;padding:8px;">${product.UNIT_TYPE}S</td>
           </tr>`
        )
        .join("")}
    </table>
  </div>
`,
    },
    recipients: {
      to: formatRecipents,
    },
  };

  try {
    if (products.length === 0) {
      return;
    }
    const poller = await client.beginSend(emailMessage);
    const result = await poller.pollUntilDone();
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

exports.emailGeneration = main;
