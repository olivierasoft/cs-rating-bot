import { IUser } from "@/core/interfaces/user.interface";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Embed, MessageComponentInteraction } from "discord.js";
import { Subject } from "rxjs";
import { QueueLoggingUseCase } from "./queue-logging.usecase";
import { CreateMatchUseCase } from "./create-match.usecase";

export interface ICreateMatch {
  interaction: MessageComponentInteraction,
  users: IUser[];
}

export interface ISetPlayerInQueue {
  interaction: MessageComponentInteraction,
  user: IUser
  operation: "remove" | "add"
  reason?: string;
}

@Injectable()
export class QueueUseCase implements OnModuleInit {
  private users: IUser[] = [];

  private queueIsReady$ = new Subject<ICreateMatch>();

  private setPlayerInQueue$ = new Subject<ISetPlayerInQueue>;

  queueTextChannelId?: string;

  voiceChannelId?: string;

  constructor(
    private queueLoggingUseCase: QueueLoggingUseCase,
    private createMatchUseCase: CreateMatchUseCase
  ) {}

  onModuleInit(): void {    

    this.queueIsReady$.subscribe(match => {
      this.createMatchUseCase.createMatch(match);
    });

    this.queueLoggingUseCase.logChange$.subscribe(interaction => {
      const newDescription = this
        .getUserInQueueMessageEmbed(interaction.message.embeds[0].description);

      interaction.message.edit({
        embeds: [{
          color: interaction.message.embeds[0].color,
          title: interaction.message.embeds[0].title,
          description: newDescription
        } as Embed]
      });
    });

    this.setPlayerInQueue$.subscribe(async config => {

      const userInQueue = this.users.some(u => config.user.discordId === u.discordId);

      if (config.operation === "add") {
        if (userInQueue) {
          await config.interaction.editReply({
            content: "Você já está na fila, não se preocupe, assim que completar 10 jogadores, a lobby será criada."
          });

          setTimeout(async () => {
            await config.interaction.deleteReply();
          }, 5 * 1000);

          return;
        }

        this._addUserToQueue(config.user, config.interaction);

        await config.interaction.deleteReply();

        const userJoinedMsg = await config.interaction.channel.send({
          content: `O usuário <@${config.interaction.user.id}> entrou na fila, faltam ${this.users.length === 10 ? "nenhum" : 10 - this.users.length} jogadores para iniciar a partida.`
        });

        setTimeout(async () => {
          await userJoinedMsg.delete();
        }, 10 * 1000);

        this.queueLoggingUseCase.showLogChanges(config.interaction);

        return;
      }

      if (!userInQueue) {
        await config.interaction.editReply({
          content: "Você ainda não entrou na fila."
        });

        setTimeout(async () => {
          await config.interaction.deleteReply();
        }, 5 * 1000);

        return;
      }

      this._removeUserFromQueue(config);

      await config.interaction.deleteReply();

      const userLeavedQueueMsg = await config.interaction.channel.send({
        content: `O usuário <@${config.interaction.user.id}> saiu da fila por conta própria`
      });      

      setTimeout(async () => {
        userLeavedQueueMsg.delete();
      }, 10 * 1000);

      this.queueLoggingUseCase.showLogChanges(config.interaction);

      return;
    });
  }

  private async _addUserToQueue(user: IUser, interaction: MessageComponentInteraction): Promise<void> {
    if (this.users.length < 10) {
      this.users.push(user);

      return; 
    }

    this.users.push(user);
    
    this.queueIsReady$.next({
      interaction,
      users: this.users.slice(0, 11)
    });
    this.users = this.users.filter((_, index) => index >= 10);

    this.queueLoggingUseCase.showLogChanges(interaction);
  }

  private _removeUserFromQueue(config: ISetPlayerInQueue): void {
    this.users = this.users.filter(user => user.discordId !== config.user.discordId);
  }

  getUserInQueueMessageEmbed(oldDescription: string): string {
    const userInQueueRegexr = /Quantidade de jogadores na fila: \d{1,10}/g;

    const newPlayersInQueueMsg = 
      `Quantidade de jogadores na fila: ${this.users.length}`;
      

    const newDescription = oldDescription
      .replace(userInQueueRegexr, newPlayersInQueueMsg);

    return newDescription;
  }

  getUsers(): IUser[] {
    return this.users;
  }

  setUserInQueue(config: ISetPlayerInQueue): void {
    this.setPlayerInQueue$.next(config);
  }

  setUsers(users: IUser[]): void {
    this.users = users;
  }
}