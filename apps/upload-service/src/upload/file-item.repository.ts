import { AbstractRepository } from '@app/common/database/abstract.repository';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FileItem } from '../schema/file-item.schema';

export class FileItemRepository extends AbstractRepository<FileItem> {
  protected readonly logger = new Logger(FileItemRepository.name);
  constructor(
    @InjectModel(FileItem.name)
    private readonly fileItemModel: Model<FileItem>,
  ) {
    super(fileItemModel);
  }
}
