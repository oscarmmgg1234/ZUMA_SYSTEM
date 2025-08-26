const { Controller } = require("../../../Controllers/controller.js");
const {
  transactionUnit,
} = require("../../DBLayer/Transaction/transactionUnit.js");
const {
  generateRandomID,
} = require("../../../Constants/stringRandoGeneration.js");
const controller = Controller;

const _defaultQuantity = 100;
const _defaultMultiplier = "1";

const getProductTokens = async (db_handle, productID) => {
  try {
    let tokenMap = new Map();
    const product = await db_handle.raw(
      "SELECT * from product WHERE PRODUCT_ID = ?",
      [productID]
    );
    tokenMap.set("act", {
      token: product[0][0].ACTIVATION_TOKEN,
      product_name: product[0][0].NAME,
      productID: product[0][0].PRODUCT_ID,
      info: product[0][0],
    });
    tokenMap.set("red", {
      token: product[0][0].REDUCTION_TOKEN,
      product_name: product[0][0].NAME,
      productID: product[0][0].PRODUCT_ID,
      info: product[0][0],
    });
    tokenMap.set("ship", {
      token: product[0][0].SHIPMENT_TOKEN,
      product_name: product[0][0].NAME,
      productID: product[0][0].PRODUCT_ID,
      info: product[0][0],
    });
    return tokenMap;
  } catch (err) {
    throw new Error("Product not found");
  }
};

const generateDefaultEngineInfo = (product, args) => {
  const {
    _actTransID,
    _barcodeID,
    _shipTransID,
    _redNewTransID,
    _shipBarcodeID,
    _redNewShipID,
  } = args;
  let outputMap = new Map();
  let actRoute = product.get("act");
  let shipRoute = product.get("ship");
  // class product_inventory {
  //   constructor(args) {
  //     this.EMPLOYEE_ID = args.EMPLOYEE_ID;
  //     this.PRODUCT_ID = args.PRODUCT_ID;
  //     this.PRODUCT_NAME = args.PRODUCT_NAME;
  //     this.QUANTITY = parseInt(args.QUANTITY);
  //     this.MULTIPLIER = args.MULTIPLIER;
  //     this.EMPLOYEE_NAME = args.EMPLOYEE_NAME;
  //     this.TRANSACTIONID = constants.generateRandomID(8);
  //     this.process_token = args.PROCESS_TOKEN;
  //   }
  outputMap.set("act", {
    EMPLOYEE_ID: "000002",
    PRODUCT_ID: actRoute.productID,
    PRODUCT_NAME: actRoute.product_name,
    QUANTITY: _defaultQuantity,
    MULTIPLIER: _defaultMultiplier,
    EMPLOYEE_NAME: "Oscar Maldonado",
    TRANSACTIONID: _actTransID,
    process_token: actRoute.token,
    generatedBarcodeID: _barcodeID,
  });
  //   constructor(args) {
  //   this.EMPLOYEE_RESPONSIBLE = args.employee;
  //   const arg_arr = args.barcode.split(">");
  //   this.BARCODE_ID = arg_arr[0] ? arg_arr[0] : 0;
  //   this.TRANSACTIONID = arg_arr[1] ? arg_arr[1] : 0;
  //   this.newTransactionID = constants.generateRandomID(8);
  // }

  outputMap.set("red", {
    EMPLOYEE_RESPONSIBLE: "000002",
    BARCODE_ID: _barcodeID,
    TRANSACTIONID: _actTransID,
    newTransactionID: _redNewTransID,
  });

  //   constructor(args) {
  //   this.QUANTITY = args.QUANTITY;
  //   this.COMPANY_ID = args.COMPANY_ID;
  //   this.TYPE = args.TYPE;
  //   this.EMPLOYEE_ID = args.EMPLOYEE_ID;
  //   this.PRODUCT_ID = args.PRODUCT_ID;
  //   this.PRODUCT_NAME = args.PRODUCT_NAME;
  //   this.TRANSACTIONID = generateRandomID(8);
  //   this.BarcodeGeneration = args.BarcodeGeneration;
  //   this.process_token = args.PROCESS_TOKEN;
  //   this.src = "shipment"
  // }
  outputMap.set("ship", {
    QUANTITY: _defaultQuantity,
    COMPANY_ID: shipRoute.info.COMPANY,
    TYPE: shipRoute.info.TYPE,
    EMPLOYEE_ID: "000002",
    PRODUCT_ID: shipRoute.productID,
    PRODUCT_NAME: shipRoute.product_name,
    TRANSACTIONID: _shipTransID,
    BarcodeGeneration: shipRoute.info.BarcodeGeneration,
    process_token: shipRoute.token,
    src: "shipment",
    generatedBarcodeID: _shipBarcodeID,
  });

  outputMap.set("shipRed", {
    EMPLOYEE_RESPONSIBLE: "000002",
    BARCODE_ID: _shipBarcodeID,
    TRANSACTIONID: _shipTransID,
    newTransactionID: _redNewShipID,
  });
  return outputMap;
};

// Collect all productIDs from validArrs
function collectValidArrIDs(processes) {
  const out = new Set();
  for (const k of ["act", "red", "ship", "ship_red"]) {
    const arr = processes?.[k]?.validArr || [];
    for (const v of arr) {
      if (v && v.productID != null) out.add(String(v.productID));
    }
  }
  return Array.from(out);
}

// Build id -> name map (batched; uses Knex tx `db_handle`)
async function getProductNamesMap(db_handle, ids) {
  if (!ids.length) return {};
  const rows = await db_handle("product")
    .select("PRODUCT_ID", "NAME")
    .whereIn("PRODUCT_ID", ids);
  const map = {};
  for (const r of rows) map[String(r.PRODUCT_ID)] = r.NAME;
  return map;
}

// If you must use your provided single-fetch helper instead:
// async function getProductNamesMap(db_handle, ids) {
//   const map = {};
//   for (const id of ids) {
//     try { map[id] = await getProductName(db_handle, id); }
//     catch { map[id] = undefined; }
//   }
//   return map;
// }

// Replace each validArr item with { productName, valid, productID, ...column }
async function enrichValidArrWithNames(db_handle, processes) {
  const ids = collectValidArrIDs(processes);
  const nameMap = await getProductNamesMap(db_handle, ids);

  const decorate = (stage) => {
    if (!stage) return stage;
    const next = { ...stage };
    next.validArr = (stage.validArr || []).map((v) => ({
      ...v,
      productName: nameMap[String(v.productID)] ?? "Unknown Product",
      // keep original id for debugging/traceability
      productID: v.productID,
    }));
    return next;
  };

  return {
    act: decorate(processes.act),
    red: decorate(processes.red),
    ship: decorate(processes.ship),
    ship_red: decorate(processes.ship_red),
  };
}

const initProcessFlows = async (db_handle, _default) => {
  try {
    let _reductionProcessValidation = null;
    let _activationProcessValidation = null;
    let _shipmentProcessValidation = null;
    let _shipReductionProcessValidation = null;

    if (_default.get("act").process_token) {
      const activationResult =
        await controller.product_activation_controller.activate_product({
          ..._default.get("act"),
          transactionHandle: db_handle,
        });
      _activationProcessValidation = Object.fromEntries(
        Object.entries(activationResult.processValidation).filter(
          ([key, value]) => key !== "transactionHandle"
        )
      );
    }
    //only gets called if activation happened
    if (_default.get("red") && _activationProcessValidation) {
      const reductionResult = await controller.reduction.product_reduction({
        ..._default.get("red"),
        transactionHandle: db_handle,
      });
      _reductionProcessValidation = Object.fromEntries(
        Object.entries(reductionResult.result.processValidation).filter(
          ([key, value]) => key !== "transactionHandle"
        )
      );
    }

    if (_default.get("ship").process_token) {
      const shipmentResult =
        await controller.shipment_controller.insert_shipment([
          {
            ..._default.get("ship"),
            transactionHandle: db_handle,
          },
        ]);
      _shipmentProcessValidation = Object.fromEntries(
        Object.entries(shipmentResult.execResponse[0].processValidation).filter(
          ([key, value]) => key !== "transactionHandle"
        )
      );
    }
    if (_default.get("red") && _shipmentProcessValidation) {
      const reductionResult = await controller.reduction.product_reduction({
        ..._default.get("shipRed"),
        transactionHandle: db_handle,
      });
      _shipReductionProcessValidation = Object.fromEntries(
        Object.entries(reductionResult.result.processValidation).filter(
          ([key, value]) => key !== "transactionHandle"
        )
      );
    }

    return {
      act: _activationProcessValidation,
      red: _reductionProcessValidation,
      ship: _shipmentProcessValidation,
      ship_red: _shipReductionProcessValidation,
    };

    //this will execute the transaction then return the validation output which will give all the deltas for this process now repeat for the next steps
  } catch (err) {
    throw new Error(err);
  }
};

function htmlReport(processes, mainProduct) {
  const na = (v) => (v === null || v === undefined || v === "" ? "N/A" : v);
  const esc = (v) =>
    String(na(v))
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  function renderValidArr(validArr = []) {
    if (!Array.isArray(validArr) || validArr.length === 0) {
      return `<tr><td colspan="2" class="muted">N/A</td></tr>`;
    }
    return validArr
      .map((v) => {
        const isValid = !!v?.valid;
        return `
          <tr>
            <td>${esc(v?.productName)}</td>
            <td style="color:${isValid ? "limegreen" : "crimson"}">${esc(
          isValid
        )}</td>
          </tr>`;
      })
      .join("");
  }

  function renderChain(chain = []) {
    if (!Array.isArray(chain) || chain.length === 0) {
      return {
        rows: `<tr><td colspan="2" class="muted">N/A</td></tr>`,
        total: null,
      };
    }
    let total = 0;
    const rows = chain
      .map((c) => {
        const d = num(c?.stockDiff);
        if (d !== null) total += d;
        return `<tr><td>${esc(c?.product)}</td><td>${esc(
          c?.stockDiff
        )}</td></tr>`;
      })
      .join("");
    return { rows, total };
  }

  function deltaBadge(n) {
    if (n === null) return `<span class="pill muted">Δ N/A</span>`;
    const color = n < 0 ? "#ef4444" : n > 0 ? "#22c55e" : "#98a2b3";
    return `<span class="pill" style="background:${color}22;border:1px solid ${color};color:${color}">Δ ${n}</span>`;
  }

  function renderStage(
    title,
    stageKey,
    block,
    { showActivationDelta = false } = {}
  ) {
    if (!block) {
      return `
        <section class="stage">
          <h2>${esc(title)}</h2>
          <div class="card"><div class="card-body">N/A</div></div>
        </section>`;
    }

    const { args = {}, validArr = [], chain = [] } = block;

    // Compute deltas
    const q = num(args?.QUANTITY);
    const activationDelta = showActivationDelta && q !== null ? -q : null; // your request: use −QUANTITY
    const chainRender = renderChain(chain);

    return `
      <section class="stage">
        <h2>${esc(title)}</h2>

        <div class="card">
          <div class="card-body">
            <div class="main-grid">
              <div>
                <div><strong>Main Product:</strong> ${esc(
                  args?.PRODUCT_NAME
                )} (${esc(args?.PRODUCT_ID)})</div>
                <div><strong>Employee:</strong> ${esc(
                  args?.EMPLOYEE_NAME || args?.EMPLOYEE_RESPONSIBLE
                )}</div>
              </div>
              <div>
                <div><strong>Transaction:</strong> ${esc(
                  args?.TRANSACTIONID
                )}</div>
                <div><strong>Quantity:</strong> ${esc(args?.QUANTITY)}</div>
              </div>
              <div class="delta-box">
                <div><strong>Route:</strong> ${esc(args?.display_type)}</div>
                <div class="delta-row">
                  ${
                    showActivationDelta
                      ? deltaBadge(activationDelta)
                      : `<span class="pill muted">Δ N/A</span>`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="two-col">
          <div class="card">
            <div class="card-head">Validation Results</div>
            <div class="card-body">
              <table class="tbl">
                <thead><tr><th>Product ID</th><th>Valid</th></tr></thead>
                <tbody>
                  ${renderValidArr(validArr)}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card-head">Chain Effects</div>
            <div class="card-body">
              <table class="tbl">
                <thead><tr><th>Product</th><th>Stock Δ</th></tr></thead>
                <tbody>
                  ${chainRender.rows}
                </tbody>
              </table>
              <div class="total-delta">Chain Total ${deltaBadge(
                chainRender.total
              )}</div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Runtime Token Report - ${mainProduct}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg:#0b1020; --panel:#121a33; --card:#1a2347;
      --text:#e9eefc; --muted:#98a2b3; --line:#243057; --accent:#5b8cff;
    }
    *{box-sizing:border-box}
    body { margin:0; background:var(--bg); color:var(--text); font:14px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; padding:24px; }
    h1 { margin:0 0 16px; color:var(--accent); font-size:22px; }
    h2 { color:var(--accent); margin:28px 0 12px; font-size:18px; }
    .muted { color:var(--muted); }
    .card { background:var(--card); border:1px solid var(--line); border-radius:12px; overflow:hidden; margin-bottom:14px; }
    .card-head { padding:10px 14px; font-weight:600; background:rgba(255,255,255,0.03); border-bottom:1px solid var(--line); }
    .card-body { padding:14px; }
    .tbl { width:100%; border-collapse:collapse; }
    .tbl th, .tbl td { border:1px solid var(--line); padding:8px 10px; text-align:left; vertical-align:top; }
    .two-col { display:grid; grid-template-columns:1fr; gap:14px; }
    @media (min-width: 900px) { .two-col { grid-template-columns:1fr 1fr; } }
    .pill { display:inline-block; padding:2px 8px; border-radius:999px; border:1px solid #2b386b; background:#1d274e; color:#c7d2fe; font-size:12px; }
    .pill.muted { border-color:#3a466f; color:var(--muted); background:#192146; }
    .main-grid { display:grid; grid-template-columns:1fr; gap:10px; }
    @media (min-width: 900px) { .main-grid { grid-template-columns:1fr 1fr auto; } }
    .delta-box { display:flex; flex-direction:column; gap:6px; align-items:flex-start; }
    .delta-row { display:flex; gap:8px; align-items:center; }
    .total-delta { margin-top:8px; }
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .btn { appearance:none; border:1px solid var(--line); background:#1d274e; color:var(--text); padding:8px 12px; border-radius:10px; cursor:pointer; }
    .btn:hover { background:#223060; }
    @media print {
      .btn { display:none !important; }
      body { background:#fff; color:#000; }
      .card { border-color:#ddd; }
      .tbl th, .tbl td { border-color:#eee; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Runtime Token Report</h1>
    <button class="btn" onclick="window.print()">Print / Save PDF</button>
  </div>

  ${renderStage("Activation", "act", processes?.act, {
    showActivationDelta: true,
  })}
  ${renderStage("Activation → Reduction", "red", processes?.red)}
  ${renderStage("Shipment Insert", "ship", processes?.ship)}
  ${renderStage("Shipment → Reduction", "ship_red", processes?.ship_red)}
</body>
</html>`;

  return html;
}

const getProductName = async (db_handle, productID) => {
  query = "SELECT * FROM product WHERE PRODUCT_ID = ?";
  const product = await db_handle.raw(query, [productID]);
  return product[0][0].NAME;
};

const main = async (_params) => {
  let db_handle;
  const { productID } = _params;

  let _actTransID = generateRandomID(8);
  let _shipTransID = generateRandomID(8);
  let _barcodeID = generateRandomID(8);
  let _redNewTransID = generateRandomID(8);
  let _shipBarcodeID = generateRandomID(8);
  const _redNewShipID = generateRandomID(8);
  try {
    db_handle = await transactionUnit();
    const main = await getProductName(db_handle, productID);
    const _productMap = await getProductTokens(db_handle, productID);
    const _CompileDefaultInfo = generateDefaultEngineInfo(_productMap, {
      _actTransID,
      _shipTransID,
      _barcodeID,
      _redNewTransID,
      _shipBarcodeID,
      _redNewShipID,
    });
    const _initProcess = await initProcessFlows(db_handle, _CompileDefaultInfo);
    const processesWithNames = await enrichValidArrWithNames(
      db_handle,
      _initProcess
    );
    console.log(c)
    const report = htmlReport(processesWithNames, main);
    await db_handle.rollback();
    return report;
  } catch (err) {
    await db_handle.rollback();
    return { err: err };
  }
};

exports.runtimeTest = main;
