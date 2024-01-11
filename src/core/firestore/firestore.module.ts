import { Firestore } from "@google-cloud/firestore";
import { Module, Provider } from "@nestjs/common";
import { FirestoreConstant } from "../constant/firestore.constant";

const providers: Provider[] = [
  {
    provide: FirestoreConstant.FIRESTORE_PROVIDER,
    useFactory: () => new Firestore({
      keyFilename: "./Key.json",
      projectId: "mix-joseval"
    })
  }
];

@Module({
  providers: providers,
  exports: [FirestoreConstant.FIRESTORE_PROVIDER]
})
export class FirestoreModule {}