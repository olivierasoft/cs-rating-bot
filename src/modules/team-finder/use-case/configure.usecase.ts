import { Injectable } from "@nestjs/common";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChannelType, CommandInteraction, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";

@Injectable()
export class ConfigureUseCase {
  async setJoinChannelId(interaction: CommandInteraction, response: ModalSubmitInteraction<CacheType>): Promise<void> {
    const channelId = response.fields.getField("lobby-join-channel").value;
    
    if (!channelId) {
      await interaction.reply({
        ephemeral: true,
        embeds: [
          {
            title: "Um erro aconteceu.",
            description: "Você não informou o channelID.",
          }
        ]
      });
    }

    try {
      const channel = await interaction.guild.channels.fetch(channelId) as TextChannel;

      if (channel.type !== ChannelType.GuildText) {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            {
              title: "Um erro aconteceu.",
              description: "O canal selecionado não é de texto.",
            }
          ]
        });
      }

      const embedDescription = "Para entrar na fila de lobbies de Counter-Strike, clique no botão abaixo. Assim, você será colocado na fila e poderá começar a jogar com seus amigos em breve. Boa sorte e divirta-se!";

      const actionRowBuilder = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel("Entrar na fila")
            .setStyle(ButtonStyle.Success)
            .setCustomId("join-queue-modal"),
          new ButtonBuilder()
            .setLabel("Sair da fila")
            .setStyle(ButtonStyle.Danger)
            .setCustomId("leave-queue-modal")
        ) as ActionRowBuilder<ButtonBuilder>;

      await channel.send({
        components: [actionRowBuilder],
        embeds: [new EmbedBuilder()
          .setAuthor({
            name: "Mix do Joseval",
          })
          .setTitle("Entrar na fila")
          .setDescription(embedDescription)
          .setColor("#FFD700")
          .setTimestamp()
        ]
      });

    } catch(e) {
      await response.reply({
        content: `Erro: ${e.message}`,
        ephemeral: true
      });
    }
  }

  configureChannelModalBuilder(): ModalBuilder {
    const joinLobbyChannel = new TextInputBuilder()
      .setCustomId("lobby-join-channel")
      .setLabel("ID do canal de entrar na fila?")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    
    const textInputBuilders = [joinLobbyChannel].map((value) =>
      new ActionRowBuilder<TextInputBuilder>().addComponents(value)
    );
    
    const modalBuilder = new ModalBuilder()
      .setTitle("NÃO MECHER!")
      .setCustomId("MODALID");
    
    textInputBuilders.forEach((textInputBuilder) => modalBuilder.addComponents(textInputBuilder));
    
    return modalBuilder;
  }

  async configureApplicationChannel(interaction: CommandInteraction): Promise<void> {
    await interaction.showModal(this.configureChannelModalBuilder());

    const response = await interaction.awaitModalSubmit({
      time: 60000 * 5,
    });

    await this.setJoinChannelId(interaction, response);

    await response.reply({
      content: "Os canais foram configurados com sucesso",
      ephemeral: true
    });
  }
}