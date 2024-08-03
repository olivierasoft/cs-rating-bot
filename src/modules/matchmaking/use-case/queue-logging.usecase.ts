import { Injectable, OnModuleInit } from "@nestjs/common";
import { QueueUseCase } from "./queue.usecase";

@Injectable()
export class QueueLoggingUseCase implements OnModuleInit {
  constructor(private queueUseCase: QueueUseCase) {}
  
  static _ARRAY_MAX_SIZE = 10;

  logs: string[] = [];

  setLog(log: string): void {
    if (this.logs.length >= 10) {
      this.logs.shift();
      this.logs.push(log);
      return;
    }

    this.logs.push(log);
  }

  onModuleInit(): void {
    this.queueUseCase.playerAddedToQueue$.subscribe(player => {
      const enteredInQueueMsg = `O jogador ${player.discordId} entrou na fila.`;

      console.log(enteredInQueueMsg);

      this.setLog(enteredInQueueMsg);
    });

    this.queueUseCase.userRemovedFromQueue$.subscribe(player => {
      const leftQueueMessage = `O jogador ${player.user.discordId} saiu da fila. Motivo: ${player.reason}`;

      console.log(leftQueueMessage);

      this.setLog(leftQueueMessage);
    });
  }
}