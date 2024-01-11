import { DiscordConstant } from "@/core/constant/discord.constant";
import { Inject, Injectable } from "@nestjs/common";
import {
  Client,
  CommandInteraction,
  Events,
  SlashCommandBuilder,
  TextChannel
} from "discord.js";
import { RegisterSlashCommandUseCase } from "./register-slash-command.usecase";
import { EvaluatePlayerUseCase } from "./evaluate-player.usecase";
import { CreateLobbyUseCase } from "./create-lobby.usecase";

@Injectable()
export class ReceiveUserMessageUseCase {
  constructor(@Inject(DiscordConstant.providers.DISCORD) private discord: Client, 
    private registerSlashCommandUseCase: RegisterSlashCommandUseCase,
    private evaluatePlayerUseCase: EvaluatePlayerUseCase,
    private createLobbyUseCase: CreateLobbyUseCase
  ) {
    this.discord.on(Events.ClientReady, () => {
      

      ["unhandledRejection", "uncaughtException"].forEach(error => {
        process.on(error, () => {
          console.error("Unhandled promise rejection:", error);
        });
      });

      this.registerSlashCommandUseCase.addReviewPlayerCommand();

      new SlashCommandBuilder().setName("avaliar").setDescription("Avalie algum jogador");
    
      this.discord.on(Events.InteractionCreate, async (interaction) => { 
      
        const commandInteraction = interaction as CommandInteraction;

        if (commandInteraction.commandName === "avaliar") {
          this.evaluatePlayerUseCase.registerEvaluationMessage(commandInteraction, this.discord);
        }

        if (commandInteraction.commandName === "lobby") {
          await this.createLobbyUseCase.createLobby(commandInteraction);
        }
      });
    });
  }
}
