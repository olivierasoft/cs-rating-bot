import { DiscordConstant } from "@/core/constant/discord.constant";
import { Module, Provider, Scope } from "@nestjs/common";
import { Client, GatewayIntentBits } from "discord.js";

const discordProvider: Provider<Client> = {
  provide: DiscordConstant.providers.DISCORD,
  scope: Scope.DEFAULT,
  useFactory: async () => {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    await client.login(process.env.DISCORD_SECRET);

    return client;
  },
};

@Module({
  imports: [],
  providers: [discordProvider],
  exports: [discordProvider],
})
export class DiscordModule {}
