import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TeamFinderModule } from "./modules/team-finder/team-finder.module";

@Module({
  imports: [ConfigModule.forRoot(), TeamFinderModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
