import { Injectable } from "@nestjs/common";
import { 
  ActionRowBuilder, 
  Client, 
  CommandInteraction, 
  ModalBuilder, 
  TextChannel, 
  TextInputBuilder, 
  TextInputStyle 
} from "discord.js";

@Injectable()
export class EvaluatePlayerUseCase {
  sendEvaluatePlayerMessage(): ModalBuilder {

    const comunication = new TextInputBuilder()
      .setCustomId("comunication")
      .setLabel("Comunicação")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const teamplay = new TextInputBuilder()
      .setCustomId("teamplay")
      .setLabel("Teamplay")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const behavior = new TextInputBuilder()
      .setCustomId("behavior")
      .setLabel("Comportamento")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const grenade = new TextInputBuilder()
      .setCustomId("grenade")
      .setLabel("Uso de granadas")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const someCommentary = new TextInputBuilder()
      .setCustomId("someCommentary")
      .setLabel("Adicione algum comentário sobre o jogador")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const textInputBuilders = [comunication, behavior, grenade, teamplay, someCommentary]
      .map((value) => new ActionRowBuilder<TextInputBuilder>().addComponents(value));

    const modalBuilder = new ModalBuilder()
      .setTitle("Você precisa preencher para continuar")
      .setCustomId("MODAL_ID");

    textInputBuilders.forEach(textInputBuilder => modalBuilder.addComponents(textInputBuilder));

    return modalBuilder;
  }

  async registerEvaluationMessage(commandInteraction: CommandInteraction, discord: Client): Promise<void> {
    await commandInteraction.showModal(this.sendEvaluatePlayerMessage());

    const response = await commandInteraction.awaitModalSubmit({
      time: 60000 * 6,
    });

    const reviewChannel = 
            discord.channels.cache.get(process.env.DISCORD_PRIVATE_REVIEW_CHANNEL_ID) as TextChannel;
            
    const reviewEmbed = {
      title: "Essa foi sua avaliação.",
      description: `Jogador avaliado: ${response.user}`,
      color: 15844367,
      fields: [
        {
          name: "Comunicação",
          value: response.fields.getField("comunication").value,
          inline: false
        },
        {
          name: "Uso de granadas",
          value: response.fields.getField("grenade").value,
          inline: false
        },
        {
          name: "Teamplay",
          value: response.fields.getField("teamplay").value,
          inline: false
        },
        {
          name: "Comportamento In-game",
          value: response.fields.getField("behavior").value,
          inline: false
        },
        {
          name: "Comentário",
          value: response.fields.getField("someCommentary").value,
          inline: false
        }
      ],
      footer: {
        text: "Desenvolvido por zewsz © 2024."
      },
      author: {
        name: "Bot Zewsz",
        //eslint-disable-next-line
        icon_url: "https://static.wikia.nocookie.net/ageofempires/images/e/e7/ZeusPortrait.png/revision/latest?cb=20160602023355"
      }
    };

    await reviewChannel.send({
      embeds: [{
        ...reviewEmbed,
        description: 
              `De: ${response.user}, Para: ${commandInteraction.options.get("jogador").user}`
      }]
    });

    response.reply({
      ephemeral: true,
      embeds: [reviewEmbed]
    });
  }
}