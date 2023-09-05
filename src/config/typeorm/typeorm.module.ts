import { TypeOrmConstant } from "@/core/constant/typeorm.constant";
import { Module, Provider } from "@nestjs/common";
import { resolve } from "path";
import { DataSource } from "typeorm";

const providers: Provider[] = [
  {
    provide: TypeOrmConstant.providers.TYPEORM,
    useFactory: (): DataSource =>
      new DataSource({
        type: "postgres",
        host: process.env.PG_HOST,
        port: +process.env.PG_PORT,
        username: process.env.PG_USERNAME,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
        synchronize: true,
        logging: true,
        entities: [resolve(__dirname, "..", "../core/domain/*.ts")],
        subscribers: [],
        migrations: [],
      }),
  },
];

@Module({
  providers: providers,
  exports: providers,
})
export class TypeOrmModule {}