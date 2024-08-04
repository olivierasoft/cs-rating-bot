import { IGamersclubUser } from "@/core/interfaces/gamersclub-user.interface";
import { IUser } from "@/core/interfaces/user.interface";
import { DocumentData, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class GamersclubInformationUseCase {
  async setGamersclubProfile(
    profileLink: string,
    userSnapshot: QueryDocumentSnapshot<IUser, DocumentData>
  ): Promise<void> {

    const profileId = profileLink.replace("https://gamersclub.com.br/player/", "");
    await userSnapshot.ref.set({
      gcId: profileId
    }, { merge: true });
  }

  async persistGamersclubData(
    userSnapshot: QueryDocumentSnapshot<IUser, DocumentData>
  ): Promise<void> {
    const gamersclubUrl = "https://gamersclub.com.br/api/v1/user/id/";

    try {
      const response = await axios.get(gamersclubUrl + userSnapshot.data().gcId);

      const gamersclubUser = response.data as IGamersclubUser;

      await userSnapshot.ref.set({
        gamersclub: gamersclubUser
      }, { merge: true });
      
    } catch(e) {
      throw e;
    }
  }
}