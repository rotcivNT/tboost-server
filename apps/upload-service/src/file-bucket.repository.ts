import { AbstractRepository } from '@app/common/database/abstract.repository';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LIMIT_FILE_PER_BUCKET } from './constants';
import { CreateBucketFileDto } from './dtos/create-file-bucket.dto';
import { FileBucket } from './schema/file-bucket.schema';

export class FileBucketRepository extends AbstractRepository<FileBucket> {
  protected readonly logger = new Logger(FileBucketRepository.name);
  constructor(
    @InjectModel(FileBucket.name)
    private readonly fileBucketModel: Model<FileBucket>,
  ) {
    super(fileBucketModel);
  }
  async createBucketFile(createBucketFileDto: CreateBucketFileDto) {
    try {
      const { workspaceId, channelId, fileId } = createBucketFileDto;
      const dateTime = new Date().toISOString().split('T')[0];
      const bucketId = `${channelId}_${dateTime}`;
      const _bucketId = new RegExp(`^${bucketId}_`);
      const updated = await this.fileBucketModel.findOneAndUpdate(
        {
          channelId: channelId,
          workspaceId: workspaceId,
          bucketId: _bucketId,
          count: {
            $lt: LIMIT_FILE_PER_BUCKET,
          },
        },
        {
          $push: { files: fileId },
          $inc: { count: 1 },
          $setOnInsert: {
            bucketId: `${bucketId}_${new Date().getTime()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
        },
      );
      return updated.toJSON() as unknown as FileBucket;
    } catch (e) {
      console.log('e', e);

      return e;
    }
  }
}
