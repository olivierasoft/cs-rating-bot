import { DiscordModule } from "@/config/discord/discord.module";
import { Module } from "@nestjs/common";
import { ReceiveUserMessageUseCase } from "./use-case/receive-user-message.usecase";

@Module({
  imports: [DiscordModule],
  providers: [ReceiveUserMessageUseCase]
})
export class TeamFinderModule {}
