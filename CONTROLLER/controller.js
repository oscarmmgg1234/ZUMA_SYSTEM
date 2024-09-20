/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2024-09-14 14:15:08

 temp

*/

const { query_manager } = require("../DB/query_manager");
const { H_Sucess } = require("../Utils/sucessHandling");
const { H_Error } = require("../Utils/errorHandling");


const knex = query_manager;

class controller {
  constructor() {
    if (!controller.instance) {
      controller.instance = this;
    }
  }

  async getLabels(params) {
    //order by created date or by label title
    //created, label
    //create triggers to keep track of items per label, and delete and reduce from that index
    const labels = await knex.raw(
      `SELECT * FROM records_labels ORDER BY ${params} ASC`
    );
    if (labels[0].length === 0) {
      return H_Error([], "No labels found");
    }
    return H_Sucess(labels[0], "Labels found");
  }

  async getLabelCountRecords(label) {
    const count = await knex("records").where({ label: label }).count();
    return count;
  }

  async deleteLabel(id, label) {
    if (this.getLabelCountRecords(label) > 0) {
      return H_Error([], "Label has records");
    }
    const labels = await knex("records_labels").where({ id: id }).del();
    if (labels === 0) {
      return H_Error([], "No label found for deletion");
    }
    return H_Sucess([], "Label deleted");
  }

  async checkLabelExists(params, handle = null) {
    if (handle) {
      const label = await handle("records_labels").where({
        label: params.label,
      });
      if (label.length > 0) {
        return true;
      }
      return false;
    }
    const label = await knex("records_labels").where({ label: params.label });
    if (label.length > 0) {
      return true;
    }
    return false;
  }
  async createLabel(params, handle = null) {
    if (await this.checkLabelExists(params, handle)) {
      return H_Error([], "Label already exists");
    }
    if (handle) {
      const label = await handle.raw(
        "INSERT INTO records_labels (label, metaData) VALUES (?, ?)",
        [
          params.label,
          params.metaData
            ? JSON.stringify(params.metaData)
            : JSON.stringify({}),
        ]
      );
      return H_Sucess([], "Label created");
    }
    const label = await knex.raw(
      "INSERT INTO records_labels (label, metaData) VALUES (?, ?)",
      [
        params.label,
        params.metaData ? JSON.stringify(params.metaData) : JSON.stringify({}),
      ]
    );
    return H_Sucess([], "Label created");
  }

  async updateLabel(params) {
    //cascade update in label name
    const label = await knex("records_labels")
      .where({ id: params.id })
      .update({ label: params.label });
  }

  async insertRecord(params) {
    try {
      return await knex.transaction(async (trx) => {
        try {
          // First, create the label (assuming this involves another table)
          await this.createLabel(params, trx);

          // Insert the record with the transaction
          const record = await trx.raw(
            "INSERT INTO records (`blob`, `metaData`, `label`, `title`) VALUES (?, ?, ?, ?)", // Escaping `blob`
            [params.blob, params.metaData, params.label, params.title]
          );

          return H_Sucess([], "Record created");
        } catch (err) {
          console.error("Transaction failed:", err);
          throw err; // The transaction will be rolled back automatically
        }
      });
    } catch (err) {
      console.error("Error during record insertion:", err);
      return H_Error([], "Error creating record");
    }
  }

  async insertMultipleRecordsBatch(records) {
    return knex.transaction(async (trx) => {
      try {
        // Use batch insert instead of inserting one by one
        await trx("records").insert(records);
        return H_Sucess([], "Records created successfully");
      } catch (err) {
        console.error("Transaction failed:", err);
        throw err; // Transaction will be automatically rolled back
      }
    });
  }

  async getRecords(label) {
    try {
      // Use a transaction to ensure consistency
      const records = await knex("records")
        .select(
          "batchID as batchIdentifier",
          "upload_date",
          "orderIndex",
          "label",
          "blob",
          "metaData"
        )
        .where("label", label)
        .orderBy("upload_date", "desc")
        .orderByRaw("COALESCE(orderIndex, 0)");

      return H_Sucess(records, "sucess retriving records"); // This will return the array of records

      return H_Sucess(records[0], "Records found"); // Returning the records data
    } catch (err) {
      console.error("Error getting records:", err);
      return H_Error([], "Error getting records");
    }
  }

  async moveRecord(params) {
    //change records label name
    //keep orderIndex and or batchId the same it dont matter really
  }
}

function getControllerInstance() {
  return new controller();
}

module.exports = { getControllerInstance };
