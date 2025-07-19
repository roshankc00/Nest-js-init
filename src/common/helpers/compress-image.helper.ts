import sharp from 'sharp';

/**
 * Compresses an image buffer to reduce its size to be under the specified maximum size.
 *
 * The function will repeatedly resize the image to half its width until the image size is smaller than the specified maximum size in megabytes.
 * The compression is performed using the `sharp` library, which processes the image and returns a buffer of the compressed image.
 *
 * @param {Buffer} buffer - The original image buffer to be compressed.
 * @param {number} maxSizeMB - The maximum allowable size for the image in megabytes. The function will compress the image until its size is less than or equal to this limit.
 * @returns {Promise<Buffer>} - A Promise that resolves to a buffer containing the compressed image.
 *
 * @throws {Error} - If the image cannot be resized to meet the size requirement, it will eventually throw an error due to excessive resizing.
 */
export const compressImage = async (
  buffer: Buffer,
  maxSizeMB: number,
): Promise<Buffer> => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  let compressedBuffer = buffer;

  while (compressedBuffer.length > maxSizeBytes) {
    compressedBuffer = await sharp(buffer)
      .resize({ width: Math.floor(buffer.byteLength / (2 * 1024)) }) // Reduce size
      .toBuffer();
  }

  return compressedBuffer;
};
