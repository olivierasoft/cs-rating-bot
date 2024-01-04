import { DiscordConstant } from "@/core/constant/discord.constant";
import { Inject, Injectable } from "@nestjs/common";
import {
  ChatInputCommandInteraction,
  Client,
  CommandInteraction,
  Events,
  ModalSubmitInteraction,
  SlashCommandBuilder
} from "discord.js";
import { RegisterSlashCommandUseCase } from "./register-slash-command.usecase";
import { EvaluatePlayerUseCase } from "./evaluate-player.usecase";

@Injectable()
export class ReceiveUserMessageUseCase {
  constructor(@Inject(DiscordConstant.providers.DISCORD) private discord: Client, 
    private registerSlashCommandUseCase: RegisterSlashCommandUseCase,
    private evaluatePlayerUseCase: EvaluatePlayerUseCase
  ) {
    this.discord.on(Events.ClientReady, () => {

      this.registerSlashCommandUseCase.addReviewPlayerCommand();

      new SlashCommandBuilder().setName("avaliar").setDescription("Avalie algum jogador");
      
      this.discord.on(Events.InteractionCreate, async (interaction) => { 
  

        if (!interaction.isCommand) return;
        
        const commandInteraction = interaction as CommandInteraction;

        if (commandInteraction.commandName === "avaliar") {
          await commandInteraction.showModal(this.evaluatePlayerUseCase.sendEvaluatePlayerMessage());

          const response = await commandInteraction.awaitModalSubmit({
            time: 60000,
          });

          console.log(response);
        }
      });
    });
  }
}
