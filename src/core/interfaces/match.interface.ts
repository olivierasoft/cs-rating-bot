import { ILobby } from "./lobby.interface";

export class IMatch {
  name: string;
  lobbies: ILobby[];
  matchUrl: string;
  date: Date;
}