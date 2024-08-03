import { DocumentData, Firestore, QueryDocumentSnapshot, QuerySnapshot } from "@google-cloud/firestore";
import { Inject, Injectable } from "@nestjs/common";
import { FirestoreConstant } from "../constant/firestore.constant";
import { IUser } from "../interfaces/user.interface";
import { IConfiguration } from "../interfaces/configuration.interface";


@Injectable()
export class ConfigRepository {

  private configCollection = this.firestore.collection("config");

  constructor(
    @Inject(FirestoreConstant.FIRESTORE_PROVIDER) private firestore: Firestore
  ) {}

  async getConfigurations(): Promise<QueryDocumentSnapshot<IConfiguration, DocumentData> | null> {
    const configuration = await this.configCollection      
      .limit(1)
      .get() as QuerySnapshot<IConfiguration>;

    return configuration.docs?.[0] ?? null; 
  }
}