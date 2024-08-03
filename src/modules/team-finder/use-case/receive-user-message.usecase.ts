import { DiscordConstant } from "@/core/constant/discord.constant";
import { InteractionCommandUseCase } from "@/modules/matchmaking/use-case/interaction-command.usecase";
import { VoiceMemberUpdateUseCase } from "@/modules/matchmaking/use-case/voice-member-update.usecase";
import { Inject, Injectable } from "@nestjs/common";
import {
  Client,
  Events
} from "discord.js";
import { RegisterSlashCommandUseCase } from "./register-slash-command.usecase";

@Injectable()
export class ReceiveUserMessageUseCase {
  constructor(@Inject(DiscordConstant.providers.DISCORD) private discord: Client, 
    private registerSlashCommandUseCase: RegisterSlashCommandUseCase,
    private voiceMemberUpdateUseCase: VoiceMemberUpdateUseCase,
    private interactionCommandUseCase: InteractionCommandUseCase
  ) {


    this.discord.on(Events.ClientReady, () => {
      ["unhandledRejection", "uncaughtException"].forEach(error => {
        process.on(error, () => {
          console.error("Unhandled promise rejection:", error);
        });
      });

      this.registerSlashCommandUseCase.addReviewPlayerCommand();
      this.voiceMemberUpdateUseCase.captureVoiceMemberUpdateEvent();
      this.interactionCommandUseCase.captureInteractionCommandEvent();
    });
  }
}
