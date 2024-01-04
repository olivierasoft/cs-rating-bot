import { Injectable } from "@nestjs/common";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

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
}