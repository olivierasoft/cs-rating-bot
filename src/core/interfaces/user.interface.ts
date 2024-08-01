import { IReview } from "./review.interface";

export interface IUser {
  id: string;
  discordId: string;
  administrator: boolean;
  gcId: string;
  reviews: IReview[];
}