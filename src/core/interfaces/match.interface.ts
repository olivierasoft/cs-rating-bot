import { ILobby } from "./lobby.interface";

export class IMatch {
  id: number;
  name: string;
  lobbies: ILobby[];
  matchUrl: string;
}