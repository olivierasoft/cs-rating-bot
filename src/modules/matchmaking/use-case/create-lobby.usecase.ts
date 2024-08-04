import { CustomIdConstant } from "@/core/constant/custom-id.constant";
import { IUser } from "@/core/interfaces/user.interface";
import { UserRepository } from "@/core/repositories/user.repository";
import { DocumentData, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { Injectable } from "@nestjs/common";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ComponentType, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { GamersclubInformationUseCase } from "./gamersclub-information.usecase";
import { ConfigRepository } from "@/core/repositories/config.repository";
import { QueueUseCase } from "./queue.usecase";
import { QueueLoggingUseCase } from "./queue-logging.usecase";

@Injectable()
export class CreateLobbyUseCase {

  constructor(
    private userRepository: UserRepository, 
    private configRepository: ConfigRepository,
    private gamersclubInformationUseCase: GamersclubInformationUseCase,
    private queueUseCase: QueueUseCase,
    private queueLoggingUseCase: QueueLoggingUseCase
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
    originalInteraction: ButtonInteraction,
    modalInteraction: ModalSubmitInteraction<CacheType>,
    userSnapshot: QueryDocumentSnapshot<IUser, DocumentData>,    
  ): Promise<void> {
    const urlRegex = /^https:\/\/gamersclub\.com\.br\/player\/\d{1,10}$/g;

    modalInteraction.deferUpdate();

    const inputValue = modalInteraction.fields.getField(CustomIdConstant.VINCULATE_GC_LINK_INPUT).value;

    if (!urlRegex.test(inputValue)) {
      await originalInteraction.editReply({
        content: "O URL que você informou é inválido, tente novamente",
        components: []
      });

      setTimeout(() => {
        originalInteraction.deleteReply();
      }, 5 * 1000);

      return;
    }

    try {
      await this.gamersclubInformationUseCase
        .setGamersclubProfile(inputValue, userSnapshot);
      
      await originalInteraction.editReply({
        content: "O seu perfil da gamersclub foi vinculado, clique novamente para entrar na fila!",
      });

      setTimeout(() => {
        originalInteraction.deleteReply();
      }, 10 * 1000);

    } catch(e) {
      await originalInteraction.editReply({
        content: "Não foi possível salvar as informações do seu perfil gamersclub, contate um adminstrador",
      });     

      setTimeout(() => {
        originalInteraction.deleteReply();
      }, 10 * 1000);
    }

  }

  async leaveQueue(interaction: ButtonInteraction): Promise<void> {

    const user = this.queueUseCase.getUsers()
      .find(user => user.discordId === interaction.user.id);

    await interaction.deferReply({
      ephemeral: true
    });

    if (!user) {      
      await interaction.editReply({
        content: "Você não está na fila.",
      });

      setTimeout(() => {
        interaction.deleteReply();
      }, 10 * 1000);

      return;
    }

    await this.queueUseCase.setUserInQueue({
      operation: "remove",
      interaction,
      user: user,
      reason: "Clicou para sair"
    });
  }

  async joinLobby(interaction: ButtonInteraction): Promise<void> {
    if (!this.queueUseCase.queueTextChannelId) {
      this.queueUseCase.queueTextChannelId = interaction.channel.id;
    }
    

    await interaction.deferReply({ ephemeral: true });

    const user = await interaction.guild.members.fetch({
      user: interaction.user,
    });

    const userVoiceChannel = user?.voice?.channel;

    if (!userVoiceChannel) {
      await interaction.editReply({
        content: "Você precisa estar conectado ao canal de voz do Mix para entrar na fila, entre no canal e tente novamente..."
      });

      setTimeout(async () => {
        await interaction.deleteReply();
      }, 5 * 1000);

      return;
    }

    const configDocument = await this.configRepository.getConfigurations();

    if (!this.queueUseCase.voiceChannelId) {

      this.queueUseCase.voiceChannelId = configDocument.data().mixChannelId; 
    }

    if (!configDocument?.data()?.mixChannelId) {
      await interaction.editReply({
        content: "Houve um erro de configuração, contate um administrador..."
      });

      setTimeout(async () => {
        await interaction.deleteReply();
      }, 5 * 1000);
    }

    if (userVoiceChannel.id !== configDocument.data().mixChannelId) {
      await interaction.editReply({
        content: "Entre no canal de voz do Mix para entrar na fila"
      });

      setTimeout(async () => {
        await interaction.deleteReply();
      }, 5 * 1000);

      return;
    }

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

      const response = await interaction.editReply({
        content: "Você precisa vincular seu perfil da Gamersclub para continuar",
        components: [actionRowBuilder],
      });

      const deleteMessageTimeout = setTimeout(() => {
        interaction.deleteReply();
      }, 10 * 1000);

      const messageComponent = await response.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 2 * 60 * 1000
      });

      interaction.editReply({
        content: "Aguardando interação...",
        components: []
      });

      clearTimeout(deleteMessageTimeout);

      await messageComponent.showModal(this.configureGamersclubVinculationModalBuilder());

      try {  
        const modalSubmitResponse = await messageComponent.awaitModalSubmit({
          time: 5 * 60 * 1000,
          filter: (i) => {
            const isSameUser = i.user.id === interaction.user.id;
  
            const isGamersclubModal = i.customId === CustomIdConstant.VINCULATE_GC_MODAL;
  
            return isSameUser && isGamersclubModal;
          },
        });

        await this.refreshGamersclubInformation(
          interaction,
          modalSubmitResponse, 
          userSnapshot,
        );
      } catch(e) {
        await interaction.editReply({
          content: "Aconteceu algum erro ou você demorou muito para responder"
        });
      }
      return;
    }

    try {
      await this.gamersclubInformationUseCase
        .persistGamersclubData(userSnapshot);
    } catch(e) {
      await interaction.editReply({
        content: "Aconteceu um erro no momento de puxar suas informações da Gamersclub, tente novamente ou entre em contato com um administrador."
      });

      setTimeout(() => {
        interaction.deleteReply();
      }, 10 * 1000);
      
      return;
    }

    const userChannel = await userVoiceChannel.fetch(true);

    const userRemainsInChannel = userChannel?.members.find(user => user.id === interaction.user.id);

    if (!userRemainsInChannel) {
      interaction.editReply({
        content: "Aparentemente você saiu da sala antes de completar o processo de entrar na fila."
      });

      setTimeout(async () => {
        await interaction.deleteReply();
      }, 10 * 1000);
      
      return;
    }

    this.queueUseCase.setUserInQueue({
      interaction,
      user: userSnapshot.data(),
      operation: "add"
    });
  }
}