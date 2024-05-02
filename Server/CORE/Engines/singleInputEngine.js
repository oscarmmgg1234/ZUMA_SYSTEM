const Handlebars = require("handlebars");
const wkhtmltopdf = require("wkhtmltopdf");

module.exports.singleInputEngine = async function (data, template) {
  return new Promise((Resolve, Reject) => {
    var templateSRC = Handlebars.compile(template);
    const output_html = templateSRC(data);
    let buffers = [];
    wkhtmltopdf(
      output_html,
      {
        pageSize: "letter",
        orientation: "portrait",
        marginTop: "5mm",
        marginRight: "5mm",
        marginBottom: "5mm",
        marginLeft: "5mm",
      },
      (err, stream) => {
        if (err) console.log(err);
        stream.on("data", (data) => {
          buffers.push(data);
        });
        stream.on("end", () => {
          let blob = new Blob(buffers, { type: "application/pdf" });
          Resolve(blob.arrayBuffer());
        });
      }
    );
  });
};
