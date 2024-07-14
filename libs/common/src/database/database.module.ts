import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import * as Joi from 'joi';

@Module({})
export class DatabaseModule {
  static register({
    connectionName,
  }: MongooseModuleAsyncOptions): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        MongooseModule.forRootAsync({
          imports: [
            ConfigModule.forRoot({
              validationSchema: Joi.object({
                [`MONGODB_${connectionName}_URI`]: Joi.string().required(),
              }),
            }),
          ],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>(`MONGODB_${connectionName}_URI`),
          }),
          inject: [ConfigService],
        }),
      ],
    };
  }
}
