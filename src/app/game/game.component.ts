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

  constructor(private route: ActivatedRoute, private firestore: Firestore, public dialog: MatDialog) {
    this.game = new Game();
  }

  ngOnInit(): void {
    // this.newGame();
    this.route.params.subscribe((params) => {
      const q = query(this.getGameRef(), where("id", "==", params['id']));
      onSnapshot(q, (gameData) => {
        this.game.currentPlayer = gameData.currentPlayer;
        this.game.playedCards = gameData.playedCards;
        this.game.players = gameData.players;
        this.game.stack = gameData.stack;
      });
    //   onSnapshot(q, (list) => {
    //     list.docChanges().forEach((game: any) => {
    //       console.log('Game update', game);
    //       this.game.currentPlayer = game.currentPlayer;
    //       this.game.playedCards = game.playedCards;
    //       this.game.players = game.players;
    //       this.game.stack = game.stack;
    //     });
    //   });
    });
  }

  async newGame() {
    this.game = new Game();
    // await addDoc(this.getGameRef(), this.game.toJson()).catch((err) => {
    //   console.error(err);
    // }).then((docRef) => {
    //   console.log("Document written with ID: ", docRef?.id);
    // });
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
