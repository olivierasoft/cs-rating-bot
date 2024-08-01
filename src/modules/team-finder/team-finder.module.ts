import { DiscordModule } from "@/config/discord/discord.module";
import { Module } from "@nestjs/common";
import { MatchmakingModule } from "../matchmaking/matchmaking.module";

@Module({
  imports: [DiscordModule, MatchmakingModule ],
  providers: [],
})
export class TeamFinderModule {}
