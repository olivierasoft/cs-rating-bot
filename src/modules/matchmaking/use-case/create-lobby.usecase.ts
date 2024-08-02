import { CustomIdConstant } from "@/core/constant/custom-id.constant";
import { IUser } from "@/core/interfaces/user.interface";
import { UserRepository } from "@/core/repositories/user.repository";
import { DocumentData, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { Injectable } from "@nestjs/common";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ComponentType, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { GamersclubInformationUseCase } from "./gamersclub-information.usecase";

@Injectable()
export class CreateLobbyUseCase {

  constructor(
    private userRepository: UserRepository, 
    private gamersclubInformationUseCase: GamersclubInformationUseCase
  ) {}

  configureGamersclubVinculationModalBuilder(): ModalBuilder {
    const gamersclubLinkInput = new TextInputBuilder()
      .setCustomId(CustomIdConstant.VINCULATE_GC_LINK_INPUT)
      .setLabel("Insira o link do seu perfil da Gamersclub.")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);
    
    const textInputBuilders = [gamersclubLinkInput].map((value) =>
      new ActionRowBuilder<TextInputBuilder>().addComponents(value)
    );
    
    const modalBuilder = new ModalBuilder()
      .setTitle("Vincule sua conta gamersclub")
      .setCustomId(CustomIdConstant.VINCULATE_GC_MODAL);
    
    textInputBuilders.forEach((textInputBuilder) => modalBuilder.addComponents(textInputBuilder));
    
    return modalBuilder;
  }

  async refreshGamersclubInformation(
    interaction: ModalSubmitInteraction<CacheType>,
    userSnapshot: QueryDocumentSnapshot<IUser, DocumentData>,    
  ): Promise<void> {
    const urlRegex = /^https:\/\/gamersclub\.com\.br\/player\/\d{1,10}$/g;

    const inputValue = interaction.fields.getField(CustomIdConstant.VINCULATE_GC_LINK_INPUT).value;

    await interaction.deferReply({
      ephemeral: true
    });

    if (!urlRegex.test(inputValue)) {
      

      await interaction.editReply({
        content: "O URL que você informou é inválido",
      });

      return;
    }

    try {
      await this.gamersclubInformationUseCase
        .setGamersclubProfile(inputValue, userSnapshot);
      
      await interaction.editReply({
        content: "O seu perfil da gamersclub foi vinculado, clique novamente para entrar na fila!",
      });

    } catch(e) {
      await interaction.editReply({
        content: "Não foi possível salvar as informações do seu perfil gamersclub, contate um adminstrador",
      });      

    }
  }

  async joinLobby(interaction: ButtonInteraction): Promise<void> {
    
    let userSnapshot = await this.userRepository.getByDiscordId(interaction.user.id);

    if (!userSnapshot) {
      userSnapshot = await this.userRepository.create({
        discordId: interaction.user.id,
        reviews: []
      });
    }

    const gamersclubId = userSnapshot.data().gcId;

    if (!gamersclubId) {
      const actionRowBuilder = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(CustomIdConstant.VINCULATE_GC_BTN)
          .setLabel("Vincular Gamersclub")
          .setStyle(ButtonStyle.Success) 
      ) as ActionRowBuilder<ButtonBuilder>;

      await interaction.deferReply({ ephemeral: true });

      const response = await interaction.followUp({
        content: "Você precisa vincular seu perfil da Gamersclub para continuar",
        components: [actionRowBuilder],
      });

      const messageComponent = await response.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 2 * 60 * 1000
      });

      await messageComponent.showModal(this.configureGamersclubVinculationModalBuilder());

      const modalSubmitResponse = await messageComponent.awaitModalSubmit({
        time: 2 * 60 * 1000,
        filter: (i) => {
          const isSameUser = i.user.id === interaction.user.id;

          const isGamersclubModal = i.customId === CustomIdConstant.VINCULATE_GC_MODAL;

          return isSameUser && isGamersclubModal;
        },
      });

      try {  
        
        await this.refreshGamersclubInformation(
          modalSubmitResponse, 
          userSnapshot,
        );
      } catch(e) {
        console.log(e);
      }

      return;
    }

    await this.gamersclubInformationUseCase
      .persistGamersclubData(userSnapshot);

    await interaction.deferReply({
      ephemeral: true
    });

    const response = await interaction.editReply({
      content: "Tudo certo patrao",
    });


    setTimeout(() => { response.delete(); }, 5000);
  }
}