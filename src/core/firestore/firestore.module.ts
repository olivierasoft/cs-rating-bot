import { Firestore } from "@google-cloud/firestore";
import { Module, Provider } from "@nestjs/common";

const providers: Provider[] = [
  {
    provide: "FIRESTORE",
    useFactory: () => new Firestore({
      keyFilename: "./Key.json",
      projectId: "mix-joseval"
    })
  }
];

@Module({

})
export class FirestoreModule {}