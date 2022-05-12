const express = require("express");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const app = express();
const port = process.env.PORT;

app.use(require("./routes/deposit"));

app.listen(port, () => {
  console.log(`Listening to port ${port}....`);
});
