import { FirestoreConstant } from "@/core/constant/firestore.constant";
import { IUser } from "@/core/interfaces/user.interface";
import { Firestore, QuerySnapshot } from "@google-cloud/firestore";
import { Inject, Injectable } from "@nestjs/common";
import { CommandInteraction, EmbedBuilder } from "discord.js";

@Injectable()
export class AuthorizationUseCase {

  constructor(
    @Inject(FirestoreConstant.FIRESTORE_PROVIDER)
    private firestore: Firestore
  ) {}

  async allowOnlyAdministrator(interaction: CommandInteraction): Promise<void> {
    const userSnapshot = await this.firestore.collection("user")
      .where("id", "==", interaction.user.id).get() as QuerySnapshot<IUser>;

    const userIsAdministrator = userSnapshot.docs
      .every(snapshot => snapshot.data().administrator === true);

    if (!userIsAdministrator) {

      const userIsNotAdministratorEmbed = new EmbedBuilder()
        .setTitle("Não autorizado")
        .setDescription("Você não tem permissão para executar o comando");

      interaction.reply({
        embeds: [userIsNotAdministratorEmbed],
        ephemeral: true
      });

      throw new Error(`User is not administrator: ${interaction.user.id}`);
    }
    return;
  }
}