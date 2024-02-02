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
    console.log("No products require review or ordering.");
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
        <ul>${products
          .map((product) => `<li>${product.NAME}</li>`)
          .join("")}</ul>
      </div>
    `,
    },
    recipients: {
      to: formatRecipents,
    },
  };

  try {
    const poller = await client.beginSend(emailMessage);
    const result = await poller.pollUntilDone();

    console.log("Email sent! Result:", result);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

exports.emailGeneration = main;
