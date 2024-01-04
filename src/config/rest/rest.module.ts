import { DiscordConstant } from "@/core/constant/discord.constant";
import { Module, Provider, Scope } from "@nestjs/common";
import { REST } from "discord.js";

const restProvider: Provider<REST> = {
  provide: DiscordConstant.providers.REST,
  scope: Scope.DEFAULT,
  useFactory: async () => {
    return new REST().setToken(process.env.DISCORD_SECRET);
  },
};

@Module({
  imports: [],
  providers: [restProvider],
  exports: [restProvider],
})
export class RestModule {}
