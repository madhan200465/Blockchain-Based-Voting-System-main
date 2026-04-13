import multer from "multer";
import path from "path";
import fs from "fs";

const uploadRoot = path.resolve(process.cwd(), "uploads", "govt-ids");

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]/g, "");
    const timestamp = Date.now();
    cb(null, `${baseName || "document"}-${timestamp}${extension}`);
  },
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

export const govtIdUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error("Unsupported file format. Use JPG, PNG, or PDF."));
      return;
    }

    cb(null, true);
  },
});
