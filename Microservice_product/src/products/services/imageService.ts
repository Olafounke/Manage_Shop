import cloudinary from "../../config/cloudinary.config";

export class ImageService {
  static async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      // Vérifier si le fichier est en mémoire (buffer) ou sur disque (path)
      if (file.buffer) {
        // Fichier en mémoire (venant de l'API Gateway)
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "manage-shop-products",
              transformation: [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }],
            },
            (error, result) => {
              if (error) {
                console.error("Erreur lors de l'upload stream vers Cloudinary:", error);
                reject(new Error("Erreur lors de l'upload de l'image"));
              } else {
                resolve(result!.secure_url);
              }
            }
          );
          uploadStream.end(file.buffer);
        });
      } else if (file.path) {
        // Fichier sur disque (upload direct)
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "manage-shop-products",
          transformation: [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }],
        });
        return uploadResult.secure_url;
      } else {
        throw new Error("Format de fichier non supporté");
      }
    } catch (error) {
      console.error("Erreur lors de l'upload vers Cloudinary:", error);
      throw new Error("Erreur lors de l'upload de l'image");
    }
  }

  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extraire l'ID public de l'URL Cloudinary
      const publicId = this.extractPublicIdFromUrl(imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
      // On ne lance pas d'erreur car l'image pourrait ne pas exister
    }
  }

  private static extractPublicIdFromUrl(url: string): string | null {
    try {
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.split(".")[0];
      return `manage-shop-products/${publicId}`;
    } catch (error) {
      console.error("Erreur lors de l'extraction de l'ID public:", error);
      return null;
    }
  }

  static async deleteMultipleImages(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map((url) => this.deleteImage(url));
    await Promise.all(deletePromises);
  }
}
