import { LoggerModule } from '@app/common';
import { DatabaseModule } from '@app/common/database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FileBucket, FileBucketSchema } from '../schema/file-bucket.schema';
import { FileItem, FileItemSchema } from '../schema/file-item.schema';
import { FileBucketRepository } from './file-bucket.repository';
import { FileItemRepository } from './file-item.repository';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { RmqService } from '@app/common/rmq/rmq.service';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      envFilePath: 'apps/upload-service/.env',
    }),

    DatabaseModule.register({ connectionName: 'UPLOAD' }),
    MongooseModule.forFeature([
      {
        name: FileItem.name,
        schema: FileItemSchema,
      },
      {
        name: FileBucket.name,
        schema: FileBucketSchema,
      },
    ]),
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    FileItemRepository,
    FileBucketRepository,
    RmqService,
  ],
})
export class UploadModule {}
