import { LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FileItem, FileItemSchema } from '../schema/file-item.schema';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { FileBucket, FileBucketSchema } from '../schema/file-bucket.schema';
import { FileItemRepository } from '../file-item.repository';
import { FileBucketRepository } from '../file-bucket.repository';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      envFilePath: 'apps/upload-service/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
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
  providers: [UploadService, FileItemRepository, FileBucketRepository],
})
export class UploadModule {}
