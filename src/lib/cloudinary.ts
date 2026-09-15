import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

const cloudName =
  (typeof process !== 'undefined' && process.env?.CLOUDINARY_NAME) ||
  import.meta.env?.CLOUDINARY_NAME ||
  '';
const apiKey =
  (typeof process !== 'undefined' && process.env?.CLOUDINARY_KEY) ||
  import.meta.env?.CLOUDINARY_KEY ||
  '';
const apiSecret =
  (typeof process !== 'undefined' && process.env?.CLOUDINARY_SECRET) ||
  import.meta.env?.CLOUDINARY_SECRET ||
  '';
const defaultFolder =
  (typeof process !== 'undefined' && process.env?.CLOUDINARY_FOLDER) ||
  import.meta.env?.CLOUDINARY_FOLDER ||
  'danilo-portfolio';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType?: string;
}

/**
 * Upload a file buffer or base64 data to Cloudinary
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  options: {
    folderName?: string;
    publicId?: string;
    resourceType?: 'image' | 'raw' | 'auto';
  } = {}
): Promise<UploadResult> {
  const targetFolder = options.folderName || defaultFolder;
  const resourceType = options.resourceType || 'auto';

  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, any> = {
      folder: targetFolder,
      public_id: options.publicId,
      resource_type: resourceType,
    };

    if (resourceType === 'image' || resourceType === 'auto') {
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' }
      ];
    }

    if (typeof fileBuffer === 'string') {
      cloudinary.uploader.upload(fileBuffer, uploadOptions, (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload to Cloudinary failed'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          resourceType: result.resource_type,
        });
      });
    } else {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Upload to Cloudinary failed'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            resourceType: result.resource_type,
          });
        }
      );
      uploadStream.end(fileBuffer);
    }
  });
}

/**
 * Delete a file by publicId from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

export { cloudinary };
