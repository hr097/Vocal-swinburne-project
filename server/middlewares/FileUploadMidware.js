const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create a multer instance with the specified storage
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    }else {
      cb(new Error('Only PNG/JPG/JPEG files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// Error handler
const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ app_status:false , message: err.message }); // Multer error
    } else if (err) {
      return res.status(500).json({ app_status:false, message: err.message }); // Other errors
    }
};

module.exports = { upload, errorHandler };
