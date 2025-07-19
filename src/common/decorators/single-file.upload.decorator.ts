import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

import { compressImage } from 'src/common';

export const UserSingleFileValidation = createParamDecorator(
  async (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const file = request.file;

    console.log(file);

    if (!file) {
      throw new BadRequestException(`No file found for field`);
    }

    const allowedTypes = ['image/jpeg', 'image/png'];

    // Validate file type
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
