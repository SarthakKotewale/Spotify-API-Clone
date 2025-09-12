const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "audio/mpeg" || file.mimetype === "audio/wav" || file.mimetype === "audio/mp4" || file.mimetype === "audio/x-m4a") {
    cb(null, true);
  }
  else if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file format. Only audio or image files are allowed!",
        false
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fieldSize: 10 * 1024 * 1024 }, //10mb max
  fileFilter,
});

module.exports = upload;
