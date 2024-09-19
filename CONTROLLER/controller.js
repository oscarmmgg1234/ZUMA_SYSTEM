/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2024-09-14 14:15:08

 temp

*/

const { query_manager } = require("../DB/query_manager");
const {H_Sucess} = require("../Utils/sucessHandling");
const {H_Error} = require("../Utils/errorHandling");
const { v4: uuidv4 } = require("uuid");

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
      "SELECT * FROM records_labels ORDER BY ? DESC",
      [params]
    );
    if (labels[0].length === 0) {
      return H_Error([], "No labels found");
    }
    return H_Sucess(labels, "Labels found");
  }

  async getLabelCountRecords(label) {
    const count = await knex("records").where({ label: label }).count();
    return count;
  }

  async deleteLabel(id, label) {
    if (this.getLabelCountRecords(label) > 0) {
      return new errorHandling([], "Label has records").error();
    }
    const labels = await knex("records_labels").where({ id: id }).del();
    if (labels === 0) {
      return new errorHandling([], "No label found for deletion").error();
    }
    return new sucessHandling([], "Label deleted").sucess();
  }

  async checkLabelExists(params) {
    const label = await knex("records_labels").where({ label: params.label });
    if (label.length > 0) {
      return true;
    }
    return false;
  }
  async createLabel(params) {
    if (await this.checkLabelExists(params)) {
      return new errorHandling([], "Label already exists").error();
    }
    const label = await knex.raw(
      "INSERT INTO records_labels (label, meta-data) VALUES (?, ?)",
      [params.label, params.metaData ? params.metaData : ""]
    );
    return new sucessHandling([], "Label created").sucess();
  }

  async updateLabel(params) {
    //cascade update in label name
    const label = await knex("records_labels")
      .where({ id: params.id })
      .update({ label: params.label });
  }

  async insertRecord(params) {
    //params.label
    knex.transaction(async (trx) => {
      try {
        const exist = this.checkLabelExists(params);
        if (!exist) {
          const createStatus = await this.createLabel(params);
          if (!createStatus.status) {
            throw new Error("Error creating label");
          }
        }
        const record = await knex.raw(
          "INSERT INTO records (blob, metaData, label, title) VALUES (?, ? ,?, ?)",
          [params.blob, params.metaData, params.label, params.title]
        );
        trx.commit();
        return new sucessHandling([], "Record created").sucess();
      } catch (err) {
        trx.rollback();
        return new errorHandling([], "Error creating record").error();
      }
    });
  }
  async insertMutipleRecordsPerTransaction(params) {
    knex.transaction(async (trx) => {
      try {
        const batchID = uuidv4();

        for (let i = 0; i < params.blobs.length; i++) {
          const record = await trx.raw(
            "INSERT INTO records (blob, metaData, batchID, orderIndex, label, title) VALUES (?, ? ,?, ?, ?, ?)",
            [
              params.blobs[i],
              params.metaData,
              batchID,
              i + 1,
              params.label,
              params.title,
            ]
          );
        }
        trx.commit();
        return new sucessHandling([], "Records created").sucess();
      } catch (err) {
        trx.rollback();
        return new errorHandling([], "Error creating record").error();
      }
    });
  }
  async getRecords(params) {
    await knex.transaction(async (trx) => {
      try {
        const records = await trx.raw(
          `SELECT 
            COALESCE(batchID, CONCAT('independent_', id)) as batchIdentifier, 
            MIN(created) as created, 
            MIN(orderIndex) as orderIndex, 
            label, 
            COUNT(*) as documentCount 
         FROM records 
         WHERE label = ? 
         GROUP BY batchIdentifier, label 
         ORDER BY COALESCE(orderIndex, created), created`,
          [params.label]
        );
        trx.commit();
        return new sucessHandling(records, "Records found").sucess();
      } catch (err) {
        trx.rollback();
        return new errorHandling([], "Error getting records").error();
      }
    });
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
