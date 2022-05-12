const express = require("express");
const readFile = require("read-excel-file/node");
const axios = require("axios").default;
const dotenv = require("dotenv");

const upload = require("../middleware/multer");
const router = express();

dotenv.config({ path: "./.env" });

router.post("/api/deposit/upload", upload.single("file"), async (req, res) => {
  if (req.file == undefined) {
    return res.status(400).send({ msg: "Please upload a file" });
  }

  let path = "./resources/uploads/" + req.file.filename;
  const betikaURL = process.env.URL;

  //converting xls/csv file to readable array format
  readFile(path, { sheet: "Deposit" }).then((rows) => {
    rows.shift();

    let depositData = [];

    rows.forEach((row) => {
      let data = {
        msisdn: row[0],
        depositDate: row[1],
        mpesaCode: row[2],
        amount: row[3],
      };

      depositData.push(data);
    });

    let payload = { msisdn: "25412345678", transactionCode: "QWERTTYSDJ13" };

    depositData.filter((data) => {
      //making filtering failed deposit and making request to deposit app
      axios
        .post(betikaURL, payload)
        .then((res) => {
          if (res.status === 200 && data.msisdn === payload.msisdn) {
            console.log({ status: res.statusText });
          } else if (res.status === 200 && data.msisdn !== payload.msisdn) {
            console.log({ status: res.statusText });
          } else if (res.status === 421) {
            console.log({ status: "failed" });
          }
        })
        .catch((error) => {
          console.log({ error: error.message });
        });
    });
  });

  return res.status(200).send({ msg: "Success" });
});

module.exports = router;
