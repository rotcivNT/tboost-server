import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTaskColumnDto {
  @IsNotEmpty()
  taskColumnId: string;

  @IsOptional()
  title: string;

  @IsOptional()
  @IsArray()
  taskOrderIds: string[];
}
