import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import Multer from 'multer';

import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file')) // 'file' is the name of the form field in the request
  async uploadFile(
    @UploadedFile() file: Multer.File,
  ): Promise<{ url: string }> {
    const url = await this.uploadService.uploadFile(file);
    return { url };
  }
}
