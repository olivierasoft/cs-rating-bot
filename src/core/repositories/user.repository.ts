import { DocumentData, Firestore, QueryDocumentSnapshot, QuerySnapshot } from "@google-cloud/firestore";
import { Inject, Injectable } from "@nestjs/common";
import { FirestoreConstant } from "../constant/firestore.constant";
import { IUser } from "../interfaces/user.interface";


@Injectable()
export class UserRepository {

  private userCollection = this.firestore.collection("user");

  constructor(@Inject(FirestoreConstant.FIRESTORE_PROVIDER) private firestore: Firestore) {}

  async create(user: Partial<IUser>): Promise<QueryDocumentSnapshot<IUser, DocumentData>> {
    const documentRef = await this.userCollection.add(user);

    return await documentRef.get() as QueryDocumentSnapshot<IUser, DocumentData>;
  }

  async getById(id: string): Promise<IUser | null> {
    const documentSnapshot = await this.userCollection.doc(id).get();

    if (documentSnapshot.exists) {
      return {
        id,
        ...documentSnapshot.data()
      } as IUser;
    }

    return null;
  }  

  async getByDiscordId(discordId: string): Promise<QueryDocumentSnapshot<IUser, DocumentData> | null> {
    const documentSnapshot = await this.userCollection.where("discordId", "==", discordId).get() as QuerySnapshot<IUser>;

    if (documentSnapshot.docs.length) {
      return documentSnapshot.docs[0];
    }

    return null;
  }  
}