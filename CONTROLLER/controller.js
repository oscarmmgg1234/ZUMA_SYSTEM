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
    //to get labels we are going to incorporate a offset
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
    //checks for records that are not deleted
    const count = await knex("records")
      .where({ label: label })
      .andWhere({ isDeleted: 0 })
      .count();
    return count[0]["count(*)"];
  }

  async deleteLabel(id, label) {
    const check = await this.getLabelCountRecords(label);
    if (check > 0) {
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

  async titleExists(title, handle = null) {
    if (handle) {
      const record = await handle("records").where({ title: title });
      if (record.length > 0) {
        return H_Error([], "Title already exists");
      }
      return H_Sucess([], "Title available");
    }
    const record = await knex("records").where({ title: title });
    if (record.length > 0) {
      return H_Error([], "Title already exists");
    }
    return H_Sucess([], "Title available");
  }

  async insertRecord(params) {
    //make sure that title is unique update db to unique key
    try {
      return await knex.transaction(async (trx) => {
        try {
          const status = await this.titleExists(params.title, trx);

          if (status.status === false) {
            return H_Error([], "Title already exists");
          }
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
    //make sure that title is unique update db to unique key
    return knex.transaction(async (trx) => {
      try {
        const status = await this.titleExists(params.title, trx);

        if (status.status === false) {
          return H_Error([], "Title already exists");
        }
        // Use batch insert instead of inserting one by one
        await trx("records").insert(records);
        return H_Sucess([], "Records created successfully");
      } catch (err) {
        console.error("Transaction failed:", err);
        throw err; // Transaction will be automatically rolled back
      }
    });
  }

  async getRecords(label, page = 0) {
    try {
      const _limit_entries = 15; // Number of entries per page
      const _offset = page * _limit_entries; // Calculate the starting point for the current page

      // Get total record count for the label
      //when addding records on local device keep a local version of many things to not have to reupdate and refetch front end data which would be expesive and slow
      //when it comes to loading pages i will have to load and offload as entries are loaded because its crazy amount of memory where dealing with
      const getRecordCount = await this.getLabelCountRecords(label);

      // If no records found, return a meaningful error
      if (getRecordCount === 0) {
        return H_Error([], "No records found");
      }

      // If page exceeds available data, return an error or empty response
      if (_offset >= getRecordCount) {
        return H_Error([], "No more records available");
      }

      // Retrieve records using limit and offset for pagination
      const records = await knex("records")
        .select(
          "batchID as batchIdentifier",
          "upload_date",
          "orderIndex",
          "record_id",
          "label",
          "blob",
          "metaData"
        )
        .where("label", label)
        .andWhere("isDeleted", 0)
        .orderBy("upload_date", "ASC") // Order by date and orderIndex
        .orderByRaw("COALESCE(orderIndex, 0)")
        .limit(_limit_entries) // Limit the number of records fetched
        .offset(_offset); // Offset based on the page

      return H_Sucess(records, "Successfully retrieved records");
    } catch (err) {
      console.error("Error getting records:", err);
      return H_Error([], "Error getting records");
    }
  }

  async moveRecord(params) {
    //change records label name
    //keep orderIndex and or batchId the same it dont matter really
    //record_id, label, or send to misc documents folder
    try {
      const record = await knex("records")
        .where({ record_id: params.record_id })
        .update({ label: params.label });

      return H_Sucess([], "Record moved");
    } catch (err) {
      console.error("Error moving record:", err);
      return H_Error([], "Error moving record");
    }
  }

  async deleteRecord(recordID) {
    //change isDeleted to 1
    //record_id
    try {
      const record = await knex("records")
        .where({ record_id: recordID })
        .update({ isDeleted: 1 });

      return H_Sucess([], "Record deleted");
    } catch (err) {
      console.error("Error deleting record:", err);
      return H_Error([], "Error deleting record");
    }
  }

  async undoDeleteRecord(recordID) {
    try {
      const record = await knex("records")
        .where({ record_id: recordID })
        .update({ isDeleted: 0 });

      return H_Sucess([], "Record restored");
    } catch (err) {
      console.error("Error restoring record:", err);
      return H_Error([], "Error restoring record");
    }
  }
  async deleteBatchRecords(recordIds) {
    //delete all records with record_id array
    let delete_status = [];
    for (let i = 0; i < recordIds.length; i++) {
      delete_status.push(await this.deleteRecord(recordIds[i]));
    }
    for (let i = 0; i < delete_status.length; i++) {
      if (delete_status[i].status === false) {
        return H_Error([], "Error deleting some or all records");
      }
    }
    return H_Sucess([], "Records deleted");
  }
  async moveBatchRecords(recordIds, label) {
    //move all records with record_id array
    let move_status = [];
    for (let i = 0; i < recordIds.length; i++) {
      move_status.push(
        await this.moveRecord({ record_id: recordIds[i], label: label })
      );
    }
    for (let i = 0; i < move_status.length; i++) {
      if (move_status[i].status === true) {
        return H_Error([], "Error moving some or all records");
      }
    }
    return H_Sucess([], "Records moved");
  }

  async getRecordInfo(recordID) {
    try {
      const record = await knex("records")
        .where({ record_id: recordID })
        .select("metaData", "title", "isDeleted", "label")
        .first();
      return H_Sucess(record, "Record found");
    } catch (err) {
      console.error("Error getting record info:", err);
      return H_Error([], "Error getting record info");
    }
  }

  async getRecord(recordID) {
    try {
      const record = await knex("records")
        .where({ record_id: recordID })
        .select("*")
        .first();
      return H_Sucess(record, "Record found");
    } catch (err) {
      console.error("Error getting record:", err);
      return H_Error([], "Error getting record");
    }
  }
  async searchRecords(search) {
    //this is going to check for title, label
    //check and retrive eveything
    //first check for title
    try {
      const records = await knex("records")
        .where("title", "like", `%${search}%`)
        .select("record_id", "title", "label", "upload_date")
        .limit(5);
      const labels = await knex("records")
        .where("label", "like", `%${search}%`)
        .select("*")
        .limit(5);
      if (records.length === 0 && labels.length === 0) {
        return H_Error([], "No records found");
      }
      //return arrays of records and labels
      return H_Sucess(
        { records_search_ouput: records, labels_search_output: labels },
        "Records found"
      );
    } catch (err) {
      console.error("Error searching records:", err);
      return H_Error([], "Error searching records");
    }
  }
  async getRecordsFromBatch(batchID) {
    try {
      const records = await knex("records")
        .where({ batchID: batchID })
        .select("*");
      return H_Sucess(records, "Records found");
    } catch (err) {
      console.error("Error getting records from batch:", err);
      return H_Error([], "Error getting records from batch");
    }
  }
  async getDeletedRecords() {
    try {
      const records = await knex("records")
        .where({ isDeleted: 1 })
        .select("*")
        .orderBy("upload_date", "ASC");
      if (records.length === 0) {
        return H_Error([], "No deleted records found");
      }
      return H_Sucess(records, "Deleted records retrieved");
    } catch (err) {
      console.error("Error getting deleted records:", err);
      return H_Error([], "Error getting deleted records");
    }
  }
}

function getControllerInstance() {
  return new controller();
}

module.exports = { getControllerInstance };
