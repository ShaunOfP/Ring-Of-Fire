import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game';
import { PlayerComponent } from '../player/player.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { GameInfoComponent } from '../game-info/game-info.component';
import { Firestore, collection, collectionData, onSnapshot, doc, addDoc, query, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, PlayerComponent, GameComponent, MatButtonModule, MatIconModule, GameInfoComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {
  pickCardAnimation = false;
  game: Game;
  currentCard: string | any = '';
  unsub: any;
  gameData: Game[] = [];
  unsubGameData;

  constructor(private route: ActivatedRoute, private firestore: Firestore, public dialog: MatDialog) {
    this.game = new Game();
    this.unsubGameData = this.subGameData();
  }

  ngOnInit(): void {
    // this.newGame();
    this.route.params.subscribe((params) => {
      this.unsub = this.getGameDataSnapshot(params);
    })
  }

  getGameDataSnapshot(params: any) {
    const q = query(this.getGameRef(), where("id", "==", params['id']));
    // console.log(this.game);
    // console.log(this.gameData);

    return onSnapshot(q, (data) => {
      // this.game.currentPlayer = data?.currentPlayer;
      // this.game.playedCards = data?.playedCards;
      // this.game.players = data?.players;
      // this.game.stack = data?.stack;
      // this.game.id = data?.id;
    });
  }

  subGameData() {
    const q = query(this.getGameRef(), where("id", "==", 'WXwO8aNb7xrO6QBff4wp'));
    return onSnapshot(q, (data) => {
      this.gameData = [];
      data.forEach(element => {
        this.gameData.push(this.setGameObject(element.data(), element.id));
      });
      console.log(this.gameData);
    });
  }

  setGameObject(obj: any, id: string): Game {
    let games = new Game();
    games.id = id;
    games.players = obj.players;
    games.stack = obj.stack;
    games.playedCards = obj.playedCards;
    games.currentPlayer = obj.currentPlayer;
    return games;
  }

  getSingleGameRef(docId: string) {
    return doc(collection(this.firestore, 'games'), docId);
  }

  ngonDestroy() {
    this.unsub();
    this.unsubGameData();
  }

  async newGame() {
    this.game = new Game();
    await addDoc(this.getGameRef(), this.game.toJson()).catch((err) => {
      console.error(err);
    }).then((docRef) => {
      console.log("Document written with ID: ", docRef?.id);
    });
  }

  getGameRef() {
    return collection(this.firestore, 'games');
  }

  takeCard() {
    if (!this.pickCardAnimation) {
      this.currentCard = this.game.stack.pop();
      this.pickCardAnimation = true;
      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer & this.game.players.length;
      setTimeout(() => {
        this.game.playedCards.push(this.currentCard);
        this.pickCardAnimation = false;
      }, 1000);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
      }
    });
  }
}
