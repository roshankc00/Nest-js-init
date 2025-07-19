import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

import { compressImage } from 'src/common';

export const BulkFilesValidation = createParamDecorator(
  async (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const files = request.files;

    if (!files || files.length === 0) {
      throw new BadRequestException(`No files found for field`);
    }

    const allowedTypes = ['image/jpeg', 'image/png'];

    const compressedFilesPromises = files.map(
      async (file: Express.Multer.File) => {
        const { fileTypeFromBuffer } = await (eval(
          'import("file-type")',
        ) as Promise<typeof import('file-type')>);
        const fileType = await fileTypeFromBuffer(file.buffer);
        if (!fileType || !allowedTypes.includes(fileType.mime)) {
          throw new BadRequestException(
            `Invalid file type. Only JPG, JPEG, and PNG are allowed.`,
          );
        }

        // Compress image
        const maxSizeMB = 5; // Maximum size in MB
        const compressedBuffer = await compressImage(file.buffer, maxSizeMB);

        return { ...file, buffer: compressedBuffer };
      },
    );

    // Wait for all files to be processed
    const processedFiles = await Promise.all(compressedFilesPromises);

    return processedFiles;
  },
);
