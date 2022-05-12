const multer = require("multer");

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

module.exports = upload;
