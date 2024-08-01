import { FirestoreConstant } from "@/core/constant/firestore.constant";
import { IGuildMember } from "@/core/interfaces/guild-member.interface";
import { ShuffleUtil } from "@/core/util/shuffle.util";
import { Firestore, QuerySnapshot } from "@google-cloud/firestore";
import { Inject, Injectable } from "@nestjs/common";
import { Collection, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";

@Injectable()
export class CreateLobbyUseCase {
  constructor(
    @Inject(FirestoreConstant.FIRESTORE_PROVIDER)
    private firestore: Firestore
  ) {}

  async sortTeams(
    interaction: CommandInteraction,
    guildMembers: Collection<string, GuildMember>
  ): Promise<GuildMember[][]> {

    const teamCount = +interaction.options.get("quantidade").value;

    if (guildMembers.size < teamCount * 5) {
      await interaction.reply({
        embeds: [
          {
            title: "Um erro aconteceu.",
            description: `É necessário no mínimo ${teamCount * 5} jogadores para criar um lobby.`,
          },
        ],
        ephemeral: true,
      });
    }
    

    const banlistCollection = (await this.firestore
      .collection("banlist")
      .get()) as QuerySnapshot<IGuildMember>;

    const bannedMembers = banlistCollection.docs.map((doc) => doc.data().id);

    const sortMembers = guildMembers.filter((member) => !bannedMembers.find((id) => id === member.id));

    const players = ShuffleUtil
      .shuffleArray(Array.from(sortMembers.values())).slice(0, teamCount * 5);

    const teams: GuildMember[][] = Array(teamCount)
      .fill(null)
      .map(() => []);

    for (let i = 0; i < players.length; i++) {
      teams[i % teamCount].push(players[i]);
    }

    return teams;
  }

  generateLobbyMessage(guildCollection: GuildMember[][]): string {
    let fullMessage = "";

    guildCollection.forEach((guildMembers, i) => {
      const messageTitle = `**Lobby ${i+1}:**\n\n`;

      const members = guildMembers.map(member => `> <@${member.user.id}>\n`);

      const memberMessage = members.toString().replace(/,/g, "");

      fullMessage = fullMessage + messageTitle + memberMessage;
    });

    return fullMessage;
  }

  async createLobby(interaction: CommandInteraction): Promise<void> {    
    const member = await interaction.guild.members.fetch({
      user: interaction.user,
    });

    const memberVoiceChannel = member?.voice?.channel;

    if (!memberVoiceChannel) {
      await interaction.reply({
        embeds: [
          {
            title: "Um erro aconteceu.",
            description: "Vocẽ precisa estar conectado ao canal que deseja criar o lobby",
          },
        ],
        ephemeral: true,
      });

      return;
    }

    if (memberVoiceChannel.members.size <= 1) {
      await interaction.reply({
        embeds: [
          {
            title: "Um erro aconteceu.",
            description: "Não encontrei nenhum jogador no canal de voz que você está conectado",
          },
        ],
        ephemeral: true,
      });

      return;
    }

    const teams = await this.sortTeams(interaction, memberVoiceChannel.members);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "Mix do Joseval",
      })
      .setTitle("Os times foram gerados de forma aleatória")
      .setDescription(this.generateLobbyMessage(teams))
      .setColor("#FFD700")
      .setFooter({
        text: "Desenvolvido por zewsz © 2024.",
      })
      .setTimestamp();


    await interaction.reply({
      embeds: [embed]
    });
  }
}
