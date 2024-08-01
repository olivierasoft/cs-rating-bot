import { IUser } from "@/core/interfaces/user.interface";
import { UserRepository } from "@/core/repositories/user.repository";
import { Injectable } from "@nestjs/common";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

@Injectable()
export class CreateLobbyUseCase {

  constructor(private userRepository: UserRepository) {}

  configureGamersclubVinculationModalBuilder(): ModalBuilder {
    const gamersclubLinkInput = new TextInputBuilder()
      .setCustomId("gamersclub-link-text-input")
      .setLabel("Insira o link do seu perfil da Gamersclub.")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);
    
    const textInputBuilders = [gamersclubLinkInput].map((value) =>
      new ActionRowBuilder<TextInputBuilder>().addComponents(value)
    );
    
    const modalBuilder = new ModalBuilder()
      .setTitle("Vincule sua conta gamersclub")
      .setCustomId("gamersclub-link-modal");
    
    textInputBuilders.forEach((textInputBuilder) => modalBuilder.addComponents(textInputBuilder));
    
    return modalBuilder;
  }

  async joinLobby(interaction: ButtonInteraction): Promise<void> {
    const userSnapshot = await this.userRepository.getByDiscordId(interaction.user.id);

    if (!userSnapshot) {
      await this.userRepository.create({
        discordId: interaction.user.id,
        reviews: []
      });

      const actionRowBuilder = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("add-gamersclub-link")
          .setLabel("Vincular Gamersclub")
          .setStyle(ButtonStyle.Success) 
      ) as ActionRowBuilder<ButtonBuilder>;

      const response = await interaction.reply({
        content: "Você precisa vincular seu perfil da Gamersclub para continuar",
        components: [actionRowBuilder],
        ephemeral: true
      });

      const collector = response.interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60 * 1000
      });

      collector.on("collect", async i => {
        const isUser = i.user.id === interaction.user.id;

        const isGamersclubVinculateButton = i.customId === "add-gamersclub-link";
        
        if (isUser && isGamersclubVinculateButton) {
          await i.showModal(this.configureGamersclubVinculationModalBuilder());
        }
      });

      collector.on("end", () => {
        response.delete();
      });
    }
  }
}