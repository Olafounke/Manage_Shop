import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary.config";

// Storage pour les fichiers directs (frontend -> microservice)
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "manage-shop-products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }],
  } as any,
});

// Storage pour les fichiers transmis par l'API Gateway (buffers)
const memoryStorage = multer.memoryStorage();

// Middleware pour détecter si les fichiers viennent de l'API Gateway
const createUploadMiddleware = (useMemoryStorage = false) => {
  return multer({
    storage: useMemoryStorage ? memoryStorage : cloudinaryStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Seules les images sont autorisées"));
      }
    },
  });
};

// Middleware par défaut (pour les fichiers directs)
const upload = createUploadMiddleware(false);

// Middleware pour les fichiers transmis par l'API Gateway
const uploadFromGateway = createUploadMiddleware(true);

export { upload, uploadFromGateway };
export default upload;
