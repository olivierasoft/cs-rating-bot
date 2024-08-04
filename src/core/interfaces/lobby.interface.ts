import { IPlayer } from "./player.interface";

export interface ILobby {
  name: string;
  players: IPlayer[];
}