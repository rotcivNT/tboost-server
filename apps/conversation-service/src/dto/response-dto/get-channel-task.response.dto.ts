import { ApiResponse } from 'apps/api-gateway/src/types/api-response';
import { ChannelTask } from '../../schema/channel-task.schema';

export class GetChannelTaskResponse implements ApiResponse<ChannelTask[]> {
  data: ChannelTask[];
  message: string;
  status: string;
  statusCode: number;
}
