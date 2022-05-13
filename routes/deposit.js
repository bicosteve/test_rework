const express = require("express");
const readFile = require("read-excel-file/node");
const axios = require("axios").default;
const dotenv = require("dotenv");

const upload = require("../middleware/multer");
const router = express();

dotenv.config({ path: "./.env" });

router.post("/api/deposit/upload", upload.single("file"), (req, res) => {
  if (req.file === undefined) {
    return res.status(400).send({ msg: "Please upload a file" });
  }

  let path = "./resources/uploads/" + req.file.filename;
  const betikaURL = process.env.URL;

  //converting xls/csv file to readable array format
  readFile(path, { sheet: "Deposit" }).then((rows) => {
    rows.shift();

    rows.forEach((row) => {
      let time = new Date(row[1]);

      let dayMonth = time.toLocaleString().split(",")[0];
      let hourMin = time.toLocaleString().split(",")[1];

      let formattedTime = dayMonth.split("/").join("-") + " " + hourMin.trim();

      let payload = {
        msisdn: row[0].toString(),
        trx_time: formattedTime.toString(),
        transaction_code: row[2].toString(),
        amount: parseInt(row[3]),
      };

      axios
        .post(betikaURL, JSON.stringify(payload))
        .then((res) => {
          if (res.status === 200) {
            console.log({ status: res.statusText });
          } else if (res.statusText !== "OK") {
            console.log({ status: "failed" });
          } else if (res.status === 421) {
            console.log({ status: res.statusText });
          }
        })
        .catch((error) => {
          console.log({ error: error.message });
        });
    });
  });

  return res.status(200).json({ msg: "Ok" });
});

module.exports = router;
