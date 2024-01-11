import { ShuffleUtil } from "@/core/util/shuffle.util";
import { Injectable } from "@nestjs/common";
import { Collection, CommandInteraction, GuildMember } from "discord.js";

@Injectable()
export class CreateLobbyUseCase {

  sortTeams(guildMembers: Collection<string, GuildMember>): void {
    
  }

  async createLobby(interaction: CommandInteraction): Promise<void> {
    const member = await interaction.guild.members.fetch({
      user: interaction.user
    });

    const memberVoiceChannel = member?.voice?.channel;

    if (!memberVoiceChannel) {
      await interaction.reply({
        embeds: [{
          title: "Um erro aconteceu.",
          description: 
            "Vocẽ precisa estar conectado ao canal que deseja criar o lobby",
        }],
        ephemeral: true
      });

      return;
    }


    if (memberVoiceChannel.members.size <= 1) {
      await interaction.reply({
        embeds: [{
          title: "Um erro aconteceu.",
          description: 
            "Não encontrei nenhum jogador no canal de voz que você está conectado",
        }],
        ephemeral: true
      });
      
      return;
    }

    await interaction.reply({
      embeds: [{
        title: "OK",
        description: "OK",
      }],
      ephemeral: true
    });
  }
}