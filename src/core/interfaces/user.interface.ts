import { IReview } from "./review.interface";

export interface IUser {
  id: string;
  administrator: boolean;
  reviews: IReview[];
}