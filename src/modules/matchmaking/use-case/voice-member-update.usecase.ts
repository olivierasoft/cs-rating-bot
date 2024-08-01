import { DiscordConstant } from "@/core/constant/discord.constant";
import { Inject, Injectable } from "@nestjs/common";
import { Client, Events } from "discord.js";

@Injectable()
export class VoiceMemberUpdateUseCase {
  constructor(@Inject(DiscordConstant.providers.DISCORD) private discord: Client) {}

  captureVoiceMemberUpdateEvent(): void {
    this.discord.on(Events.VoiceStateUpdate, async (interaction) => { 
      console.log("Interação em canal de voz: " + interaction.member.displayName);
    });
  }
}