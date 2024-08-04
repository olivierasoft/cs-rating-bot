import { IGamersclubUser } from "./gamersclub-user.interface";
import { IReview } from "./review.interface";

export interface IUser {
  id: string;
  discordId: string;
  administrator: boolean;
  gcId: string;
  reviews: IReview[];
  gamersclub: IGamersclubUser;
}