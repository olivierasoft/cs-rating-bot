import { Inject, Injectable } from "@nestjs/common";
import { ICreateMatch } from "./queue.usecase";
import { ShuffleUtil } from "@/core/util/shuffle.util";
import { ILobby } from "@/core/interfaces/lobby.interface";
import { IMatch } from "@/core/interfaces/match.interface";
import { IUser } from "@/core/interfaces/user.interface";
import { Firestore } from "@google-cloud/firestore";
import { FirestoreConstant } from "@/core/constant/firestore.constant";

@Injectable()
export class CreateMatchUseCase {  

  constructor(
    @Inject(FirestoreConstant.FIRESTORE_PROVIDER) private firestore: Firestore
  ) {}


  async createMatch(config: ICreateMatch): Promise<void> {

    const creatingMatchMsg = await config.interaction.channel.send({
      content: "A fila alcançou 10 jogadores, criando partida..."
    });

    setTimeout(() => {
      creatingMatchMsg.delete();
    }, 10 * 1000);

    const match = this.getBalancedMatch(config.users);

    await this.firestore.collection("matches").add(match);
  }

  getBalancedMatch(users: IUser[]): IMatch {
    const lobbies = ShuffleUtil.balanceTeams(users)
      .map(team => {
        const captain = team.reduce((prev, curr) => {
          return prev && prev.gamersclub.level > curr.gamersclub.level ? prev : curr;
        });

        return {
          name: `Team ${captain.gamersclub.nick}`,
          players: team.map(player => ({
            discordId: player.discordId,
            gcId: player.gamersclub.accountid,
            level: player.gamersclub.level,
            name: player.gamersclub.name,
            nickname: player.gamersclub.nick,
            premium: player.gamersclub.subscription !== "FREE",
            score: player.gamersclub.rating,
            steamId: player.gamersclub.steamid
          }))
        } as ILobby;
      });

    const matchName = `${lobbies[0].name} vs ${lobbies[1].name}`;

    return {
      date: new Date(),
      lobbies,
      name: matchName
    } as IMatch;
  }
}