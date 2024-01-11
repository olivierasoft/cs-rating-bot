import { DiscordModule } from "@/config/discord/discord.module";
import { Module } from "@nestjs/common";
import { ReceiveUserMessageUseCase } from "./use-case/receive-user-message.usecase";
import { RegisterSlashCommandUseCase } from "./use-case/register-slash-command.usecase";
import { RestModule } from "@/config/rest/rest.module";
import { EvaluatePlayerUseCase } from "./use-case/evaluate-player.usecase";
import { CreateLobbyUseCase } from "./use-case/create-lobby.usecase";

@Module({
  imports: [DiscordModule, RestModule],
  providers: [
    ReceiveUserMessageUseCase, 
    RegisterSlashCommandUseCase, 
    EvaluatePlayerUseCase,
    CreateLobbyUseCase
  ],
})
export class TeamFinderModule {}
