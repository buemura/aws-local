import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { s3 } from '../config/aws-s3.config';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { randomUUID } from 'crypto';
import Multer from 'multer';

@Injectable()
export class UploadService {
  async uploadFile(file: Multer.File): Promise<string> {
    const key = `${randomUUID()}-${file.originalname}`;

    const params: PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET_NAME, // S3 bucket name
      Key: key, // File name
      Body: file.buffer, // File buffer
      ContentType: file.mimetype, // MIME type of the file,
    };

    console.log(params);

    try {
      const data = await s3.upload(params).promise();
      return data.Location; // URL of the uploaded file
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }
}
