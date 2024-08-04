import { DiscordConstant } from "@/core/constant/discord.constant";
import { Inject, Injectable } from "@nestjs/common";
import { Client, Embed, Events, TextChannel } from "discord.js";
import { QueueUseCase } from "./queue.usecase";

@Injectable()
export class VoiceMemberUpdateUseCase {
  constructor(
    @Inject(DiscordConstant.providers.DISCORD) private discord: Client,
    private queueUseCase: QueueUseCase
  ) {}

  captureVoiceMemberUpdateEvent(): void {
    this.discord.on(Events.VoiceStateUpdate, async (oldState, newState) => { 
      if (!this.queueUseCase.voiceChannelId) return;

      const leavedChannel = oldState.channel.id === this.queueUseCase.voiceChannelId;

      if (leavedChannel) {
        const queueUsers = this.queueUseCase.getUsers();

        const userWaitingForMatch = queueUsers
          .findIndex(user => user.discordId === oldState.member.user.id);

        if (userWaitingForMatch === -1) return;

        this.queueUseCase
          .setUsers(
            queueUsers
              .filter(user => user.discordId !== queueUsers[userWaitingForMatch].discordId)
          );

        const channel = await this.discord.channels
          .fetch(this.queueUseCase.queueTextChannelId);

        const queueTextChannel = channel as TextChannel;

        const embedMessage = (await queueTextChannel.messages.fetch())
          .find(message => message.embeds.length);

        if (!embedMessage) return;
        
        const newDescription = this.queueUseCase
          .getUserInQueueMessageEmbed(embedMessage.embeds[0].description);

        embedMessage.edit({
          embeds: [{
            color: embedMessage.embeds[0].color,
            title: embedMessage.embeds[0].title,
            description: newDescription
          } as Embed]
        });

        const channelMessage = await queueTextChannel.send({
          content: `O usuário <@${oldState.id}> foi removido da fila por sair do canal do mix`
        });

        setTimeout(() => {
          channelMessage.delete();
        }, 10 * 1000);
      }
    });
  }
}