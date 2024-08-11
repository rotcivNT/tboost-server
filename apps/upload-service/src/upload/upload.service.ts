import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { CreateBucketFileDto } from '../dtos/create-file-bucket.dto';
import { CreateFileDto } from '../dtos/create-file.dto';
import { FileBucketRepository } from './file-bucket.repository';
import { FileItemRepository } from './file-item.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  S3: S3Client;

  constructor(
    private readonly fileItemRepository: FileItemRepository,
    private readonly fileBucketRepository: FileBucketRepository,
    private configService: ConfigService,
  ) {
    this.S3 = new S3Client({
      region: 'auto',
      endpoint: this.configService.get('S3_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get('R2_ACCESS_ID'),
        secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadToR2(bucketName: string, file: Express.Multer.File) {
    let fileName = `${Date.now()}_${file.originalname}`;
    fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const uploadParams: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentLength: file.size,
      ContentType: file.mimetype,
    };

    const cmd = new PutObjectCommand(uploadParams);
    await this.S3.send(cmd);

    return `${this.configService.get(`${bucketName.toUpperCase()}_HOST`)}${fileName}`;
  }

  createFile(createFileDto: CreateFileDto) {
    return this.fileItemRepository.create(createFileDto);
  }

  createBucketFile(createBucketFileDto: CreateBucketFileDto) {
    return this.fileBucketRepository.createBucketFile(createBucketFileDto);
  }

  async deleteFileByName(bucketName: string, fileUrl: string) {
    const fileName = fileUrl.split(
      `${this.configService.get('IMAGE_HOST')}`,
    )[1];
    const deleteParams: DeleteObjectCommandInput = {
      Bucket: bucketName,
      Key: fileName,
    };
    const cmd = new DeleteObjectCommand(deleteParams);
    const updatedDoc = this.fileItemRepository.findOneAndUpdate(
      {
        'fileData.url': fileUrl,
      },
      { isDelete: true },
    );
    const deletedFileObject = this.S3.send(cmd);
    Promise.all([updatedDoc, deletedFileObject]);
  }
}
