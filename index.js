const path = require("path");

const express = require("express");
const readFile = require("read-excel-file/node");
const multer = require("multer");
const axios = require("axios").default;
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const app = express();
const port = process.env.PORT;

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml") ||
    file.mimetype.includes("csv")
  ) {
    cb(null, true);
  } else {
    cb("Please upload only excel or csv files", false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./resources/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-deposits-${file.originalname}`);
  },
});

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.post("/api/deposit/upload", upload.single("file"), (req, res) => {
  if (req.file == undefined) {
    return res.status(400).send({ msg: "Please upload a file" });
  }

  let path = "./resources/uploads/" + req.file.filename;
  const betikaURL = process.env.URL;

  let depositData = [];

  //converting xls file to readable format
  readFile(path, { sheet: "Deposit" }).then((rows) => {
    rows.shift();

    rows.forEach((row) => {
      let data = {
        msisdn: row[0],
        depositDate: row[1],
        mpesaCode: row[2],
        amount: row[3],
      };

      depositData.push(data);
    });

    //making API call to the betika transaction tracker app

    depositData.forEach((data) => {
      axios
        .post(betikaURL, {
          msisdn: data.msisdn,
          transactionCode: data.mpesaCode,
        })
        .then((response) => {
          if (response.status === 200) {
            console.log({ status: "OK" });
          } else if (response.status === 404) {
            console.log({
              status: "Failed",
            });
          } else if (response.status === 421) {
            console.log({ status: "Failed" });
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    });

    // data.success = true; // or false
    // depositData.push(data);
  });

  return res.status(200).send({ msg: "Success", data: depositData });
});

app.listen(port, () => {
  console.log(`Listening to port ${port}....`);
});
