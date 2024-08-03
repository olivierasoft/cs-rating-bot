import { IUser } from "@/core/interfaces/user.interface";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { MessageComponentInteraction } from "discord.js";
import { Subject, take } from "rxjs";

export interface IUserRemovedFromQueue {
  reason: string;
  user: IUser
}

export interface ITryAddUserInQueue {
  interaction: MessageComponentInteraction,
  user: IUser
}

@Injectable()
export class QueueUseCase implements OnModuleInit {
  users: IUser[] = [];

  queueIsReady$ = new Subject<IUser[]>();
  playerAddedToQueue$ = new Subject<IUser>();
  userRemovedFromQueue$ = new Subject<IUserRemovedFromQueue>;

  addPlayerInQueue$ = new Subject<ITryAddUserInQueue>;

  onModuleInit(): void {
    this.addPlayerInQueue$.subscribe(async config => {
      const userInQueue = this.users.some(u => config.user.discordId === u.discordId);

      if (userInQueue) {
        await config.interaction.editReply({
          content: "Você já está na fila, não se preocupe, assim que completar 10 jogadores, a lobby será criada."
        });

        setTimeout(async () => {
          await config.interaction.deleteReply();
        }, 5 * 1000);

        return;
      }

      this.addUserToQueue(config.user);

      await config.interaction.editReply({
        content: "Você foi adicionado á fila"
      });

      setTimeout(async () => {
        await config.interaction.deleteReply();
      }, 5 * 1000);
    });
  }

  addUserToQueue(user: IUser): void {
    if (this.users.length < 10) {
      this.users.push(user);
      this.playerAddedToQueue$.next(user);

      return; 
    }

    this.users.push(user);

    this.playerAddedToQueue$.next(user);
    this.queueIsReady$.next(this.users);
    this.users = [];
  }

  removeUserFromQueue(userRemoved: IUserRemovedFromQueue): void {
    this.users = this.users.filter(user => user.discordId === userRemoved.user.discordId);

    this.userRemovedFromQueue$.next(userRemoved);
  }
}