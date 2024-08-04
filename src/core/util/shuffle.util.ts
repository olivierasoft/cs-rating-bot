import { IUser } from "../interfaces/user.interface";

export class ShuffleUtil {
  static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  static balanceTeams(players: IUser[]): [IUser[], IUser[]] {
    // Ordenar os jogadores em ordem decrescente pelo level
    const sortedPlayers = players.slice().sort((a, b) => b.gamersclub.level - a.gamersclub.level);

    // Inicializar os dois arrays resultantes e suas somas de level
    const team1: IUser[] = [];
    const team2: IUser[] = [];
    let sum1 = 0;
    let sum2 = 0;

    // Distribuir os jogadores tentando manter as somas balanceadas
    for (let i = 0; i < sortedPlayers.length; i++) {
      if (team1.length < 5 && (sum1 <= sum2 || team2.length >= 5)) {
        team1.push(sortedPlayers[i]);
        sum1 += sortedPlayers[i].gamersclub.level;
      } else {
        team2.push(sortedPlayers[i]);
        sum2 += sortedPlayers[i].gamersclub.level;
      }
    }

    // Checar e ajustar o balanceamento nos últimos índices se necessário
    const last1 = team1[team1.length - 1];
    const last2 = team2[team2.length - 1];

    if (Math.abs((sum1 - last1.gamersclub.level + last2.gamersclub.level) - (sum2 - last2.gamersclub.level + last1.gamersclub.level)) < Math.abs(sum1 - sum2)) {
      // Realizar a troca
      team1[team1.length - 1] = last2;
      team2[team2.length - 1] = last1;
    }

    return [team1, team2];
  }
}