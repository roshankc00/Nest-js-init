import { Injectable } from '@nestjs/common';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import {
  GetObjectCommand,
  PutObjectCommandInput,
  S3,
} from '@aws-sdk/client-s3';

import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  s3: S3;
  awsBucketName: string;
  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      credentials: {
        secretAccessKey: this.configService.get('AWS_SECRET_KEY')!,
        accessKeyId: this.configService.get('AWS_ACCESS_KEY')!,
      },
      region: this.configService.get('AWS_REGION'),
    });
    this.awsBucketName = this.configService.get('AWS_S3_BUCKET')!;
  }

  /**
   * The function `s3_upload` asynchronously uploads a file to an AWS S3 bucket with specified
   * parameters.
   * @param {Buffer} file - The `file` parameter is a Buffer containing the data of the file that you
   * want to upload to an S3 bucket.
   * @param {string} name - The `name` parameter in the `s3_upload` function represents the name or key
   * under which the file will be stored in the S3 bucket. It is a string value that typically
   * identifies the file uniquely within the bucket.
   * @param {string} mimetype - MIME type (Multipurpose Internet Mail Extensions) specifies the type of
   * data that is being sent. It is a standard way to indicate the nature and format of a document,
   * file, or data. Examples of MIME types include "image/jpeg" for JPEG images, "application/pdf" for
   * PDF files
   * @param {string} bucket - The `bucket` parameter in the `s3_upload` function represents the name of
   * the Amazon S3 bucket where the file will be uploaded. If no bucket name is provided when calling
   * the function, it will default to the value of `this.awsBucketName`.
   * @returns The function `s3_upload` returns the response from uploading the file to an AWS S3 bucket
   * using the provided parameters.
   */
  async s3Upload(
    file: Buffer,
    name: string,
    mimetype: string,
    bucket: string = this.awsBucketName,
  ) {
    const key = `${uuidv4()}-${name}`;
    const params: PutObjectCommandInput = {
      Bucket: bucket,
      Key: String(key),
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
    };

    try {
      const s3Response = await new Upload({
        client: this.s3,
        params,
      }).done();
      return s3Response;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  /**
   * The function generates a presigned URL for accessing an object in an AWS S3 bucket with optional
   * parameters for bucket name and expiration time.
   * @param {string} name - The `name` parameter represents the object key or filename for which you
   * want to generate a presigned URL in the specified S3 bucket.
   * @param {string} bucket - The `bucket` parameter represents the name of the S3 bucket where the
   * object is stored. In the `generatePresignedUrl` function, if the `bucket` parameter is not
   * provided when calling the function, it defaults to `this.awsBucketName`.
   * @param [expiresInSeconds=3600] - The `expiresInSeconds` parameter specifies the duration in
   * seconds for which the generated presigned URL will be valid before it expires. In the provided
   * function, the default value for `expiresInSeconds` is set to 3600 seconds, which is equivalent to
   * 1 hour. This means that the presigned
   * @returns The function `generatePresignedUrl` returns a presigned URL for accessing an object in an
   * AWS S3 bucket.
   */
  async generatePresignedUrl(
    name: string,
    bucket: string = this.awsBucketName,
    expiresInSeconds = 3600,
  ) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Expires: expiresInSeconds, // URL expiry time in seconds
    };

    try {
      const presignedUrl = await getSignedUrl(
        this.s3,
        new GetObjectCommand(params),
        {
          expiresIn: 3600,
        },
      );
      return presignedUrl;
    } catch (e) {
      console.log(e);
      throw new Error(`Failed to generate presigned URL`);
    }
  }
}
