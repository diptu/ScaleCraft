import { Module } from '@nestjs/common';
import { V1Module } from './modules/v1/v1.module';


@Module({
  imports: [V1Module],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule { }
