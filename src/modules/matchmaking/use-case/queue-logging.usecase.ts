import { Injectable } from "@nestjs/common";
import { MessageComponentInteraction } from "discord.js";
import { Subject } from "rxjs";

@Injectable()
export class QueueLoggingUseCase {
  logs: string[] = [];

  logChange$ = new Subject<MessageComponentInteraction>();

  setLog(log: string): void {
    if (this.logs.length >= 10) {
      this.logs.shift();
      this.logs.push(log);
      return;
    }

    this.logs.push(log);
  }

  showLogChanges(interaction: MessageComponentInteraction): void {
    this.logChange$.next(interaction);
  }
}