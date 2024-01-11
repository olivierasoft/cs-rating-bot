import { DiscordConstant } from "@/core/constant/discord.constant";
import { Inject, Injectable } from "@nestjs/common";
import { REST, RESTPutAPIApplicationCommandsJSONBody, Routes } from "discord.js";

@Injectable()
export class RegisterSlashCommandUseCase {
  constructor(@Inject(DiscordConstant.providers.REST)  private rest: REST) {
  }

  async addReviewPlayerCommand(): Promise<void> {

    const commands: RESTPutAPIApplicationCommandsJSONBody = [
      {
        name: "avaliar",
        description: "Avalie um jogador",
        options: [
          {
            name: "jogador",
            type: 6,
            description: "Digite um espaço para listar todos os usuários",
            required: true,
          },
        ]
      },
      {
        name: "lobby",
        description: "Crie uma quantidade específica de lobby's",
        options: [
          {
            name: "quantidade",
            type: 10,
            description: "Coloque a quantidade de lobby's que deseja criar",
            required: true,
          },
        ]
      }
    ];

    await this.rest.put(Routes.applicationGuildCommands(
      process.env.DISCORD_APPLICATION_ID, 
      process.env.DISCORD_GUILD_ID,
    ), {
      body: commands
    });
  }
}