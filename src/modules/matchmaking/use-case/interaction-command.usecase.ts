import { DiscordConstant } from "@/core/constant/discord.constant";
import { ConfigureUseCase } from "@/modules/team-finder/use-case/configure.usecase";
import { EvaluatePlayerUseCase } from "@/modules/team-finder/use-case/evaluate-player.usecase";
import { Inject, Injectable } from "@nestjs/common";
import { ButtonInteraction, Client, CommandInteraction, Events } from "discord.js";
import { CreateLobbyUseCase } from "./create-lobby.usecase";
import { CustomIdConstant } from "@/core/constant/custom-id.constant";

@Injectable()
export class InteractionCommandUseCase {

  constructor(
    @Inject(DiscordConstant.providers.DISCORD) private discord: Client,     
    private evaluatePlayerUseCase: EvaluatePlayerUseCase,
    private configureUseCase: ConfigureUseCase,
    private createLobbyUseCase: CreateLobbyUseCase
  ) {}
  
  captureInteractionCommandEvent(): void {
    this.discord.on(Events.InteractionCreate, async (interaction) => { 
                
      if (interaction instanceof ButtonInteraction) {
        console.log(interaction.customId);
        if (interaction.customId === CustomIdConstant.JOIN_QUEUE_BTN) {
          
          
          await this.createLobbyUseCase.joinLobby(interaction);
        }

        if (interaction.customId === CustomIdConstant.LEAVE_QUEUE_BTN) {

          console.log("Here");

          await this.createLobbyUseCase.leaveQueue(interaction);
        }
      }
    
      if (interaction instanceof CommandInteraction) {
        try {
    
          if (interaction.commandName === "configurar") {
            await this.configureUseCase.configureApplicationChannel(interaction);
          }
      
          if (interaction.commandName === "avaliar") {
            this.evaluatePlayerUseCase.registerEvaluationMessage(interaction, this.discord);
          }
      
        } catch(e) {
                
          console.error(e);
        }
      }
    });
  }
}