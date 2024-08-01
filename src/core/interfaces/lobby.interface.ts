import { IPlayer } from "./player.interface";

export interface ILobby {
  id: number;
  name: string;
  win: boolean;
  players: IPlayer[];
}