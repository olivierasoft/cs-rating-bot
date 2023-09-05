import { DiscordConstant } from "@/core/constant/discord.constant";
import { Inject, Injectable } from "@nestjs/common";
import { ChannelType, Client, Collection, Events, GuildMember } from "discord.js";

@Injectable()
export class ReceiveUserMessageUseCase {
  constructor(@Inject(DiscordConstant.providers.DISCORD) private discord: Client) {
    this.discord.on(Events.ClientReady, () => {
      console.log("Client Ready");

      this.discord.on(Events.MessageCreate, (message) => {
        console.log(message);
      });

      const guilds = this.discord.guilds.cache;

      guilds.forEach(async (guild) => {
        const guildConnection = this.discord.guilds.resolve(guild);

        const voiceChannels = guildConnection.channels.cache.filter((channel) => {
          return channel.type === ChannelType.GuildVoice && channel.members.size;
        });

        const membersCollections = voiceChannels.map(
          (channel) => channel.members as Collection<string, GuildMember>,
        );
      });
    });
  }
}
