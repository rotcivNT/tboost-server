import { ApiResponse } from 'apps/api-gateway/src/types/api-response';
import { ChannelTaskColumn } from '../../schema/channel-task-column';
import { ChannelTask } from '../../schema/channel-task.schema';
import { Sender } from 'apps/api-gateway/src/dtos/message-dto/create-message.dto';

export type TaskDataResponse = ChannelTaskColumn & {
  taskOrders?: (ChannelTask & {
    membersInfo?: Sender[];
  })[];
};

export class GetChannelTaskColumnResponse
  implements ApiResponse<TaskDataResponse[]>
{
  data: TaskDataResponse[];
  message: string;
  status: string;
  statusCode: number;
}
