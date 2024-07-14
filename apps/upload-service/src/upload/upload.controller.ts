import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPattern } from '@nestjs/microservices';
import { detectTypeOfFile } from 'apps/message-service/src/messages/helper';
import { encodeImageToBlurhash } from 'apps/upload-service/helper';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { FileData } from 'types';
import { CreateBucketFileDto } from '../dtos/create-file-bucket.dto';
import { CreateFileDto } from '../dtos/create-file.dto';
import { UploadFileDto } from '../dtos/upload-file.dto';
import { UploadService } from './upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FormDataToJsonInterceptor } from 'apps/message-service/src/interceptors';

@Controller('/uploads')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'), FormDataToJsonInterceptor)
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() payload: UploadFileDto,
  ) {
    try {
      const filesUrl: FileData[] = [];
      let sizeOfImage: ISizeCalculationResult;
      for (const file of files) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );

        const typeOfFile = detectTypeOfFile(file.mimetype);
        const fileUrl = await this.uploadService.uploadToR2(
          this.configService.get('BUCKET_NAME'),
          file,
        );
        const fileData: FileData = {
          type: typeOfFile,
          url: fileUrl,
          mimeType: file.mimetype,
          name: file.originalname,
          size: file.size,
        };

        if (file.mimetype.includes('image')) {
          const blurHash = await encodeImageToBlurhash(file);
          console.log(blurHash);

          sizeOfImage = imageSize(file.buffer);
          fileData.originalWidth = sizeOfImage.width;
          fileData.originalHeight = sizeOfImage.height;
          fileData.blurHash = blurHash;
        }

        const createFileDto: CreateFileDto = {
          senderId: payload.senderId,
          createdAt: new Date(),
          updatedAt: new Date(),
          fileData,
        };
        const fileDocument = await this.uploadService.createFile(createFileDto);
        const createBucketFileDto: CreateBucketFileDto = {
          workspaceId: payload.workspaceId,
          channelId: payload.channelId,
          fileId: fileDocument._id,
        };
        await this.uploadService.createBucketFile(createBucketFileDto);

        filesUrl.push(fileData);
      }
      return {
        code: 1,
        msg: 'Upload Successfully',
        data: filesUrl,
      };
    } catch (e) {
      console.log(e);

      return {
        code: -1,
        msg: 'ERROR',
        e: e,
      };
    }
  }

  // @Get()
  // async getImages(@Query() payload: any) {
  //   const res = await fetch(payload.url);
  //   const blob = await res.blob();
  //   const buffer = await blob.arrayBuffer();
  //   return Buffer.from(buffer);
  // }

  @EventPattern('delete-file')
  async deleteFileByUrl(fileUrl: string) {
    this.uploadService.deleteFileByName(
      this.configService.get('BUCKET_NAME'),
      fileUrl,
    );
  }
}
