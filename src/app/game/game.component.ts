import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game';
import { PlayerComponent } from '../player/player.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { GameInfoComponent } from '../game-info/game-info.component';
import { Firestore, collection, collectionData, onSnapshot, doc, addDoc, query, where, updateDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { PlayerMobileComponent } from '../player-mobile/player-mobile.component';
import { EditPlayerComponent } from '../edit-player/edit-player.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, EditPlayerComponent, PlayerMobileComponent, PlayerComponent, GameComponent, MatButtonModule, MatIconModule, GameInfoComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {
  game: Game;
  unsub: any;
  gameID: string;
  gameOver: boolean;

  constructor(private route: ActivatedRoute, private firestore: Firestore, public dialog: MatDialog) {
    this.game = new Game();
    this.gameID = '';
    this.gameOver = false;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.gameID = params['id'];
      this.unsub = this.getGameDataSnapshot();
    })
  }

  getGameDataSnapshot() {
    return onSnapshot(doc(this.getGameRef(), this.gameID), (GameData: any) => {
      this.game.currentPlayer = GameData.data().currentPlayer;
      this.game.playedCards = GameData.data().playedCards;
      this.game.player_images = GameData.data().player_images;
      this.game.players = GameData.data().players;
      this.game.stack = GameData.data().stack;
      this.game.pickCardAnimation = GameData.data().pickCardAnimation;
      this.game.currentCard = GameData.data().currentCard;
    });
  }

  ngonDestroy() {
    this.unsub();
  }

  async newGame() {
    this.game = new Game();
  }

  getGameRef() {
    return collection(this.firestore, 'games');
  }

  takeCard() {
    if (this.game.stack.length == 0) {
      this.gameOver = true;
    } else {
      if (!this.game.pickCardAnimation) {
        this.game.currentCard = this.game.stack.pop();
        this.game.pickCardAnimation = true;
        this.game.currentPlayer++;
        this.game.currentPlayer = this.game.currentPlayer & this.game.players.length;
        this.updateGame();
        setTimeout(() => {
          this.game.playedCards.push(this.game.currentCard);
          this.game.pickCardAnimation = false;
          this.updateGame();
        }, 1000);
      }
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        this.game.player_images.push('1.webp');
        this.updateGame();
      }
    });
  }

  async updateGame() {
    await updateDoc(doc(this.getGameRef(), this.gameID), this.game.toJson()).catch((err) => console.log(err));
  }

  editPlayer(playerId: number) {
    const dialogRef = this.dialog.open(EditPlayerComponent);

    dialogRef.afterClosed().subscribe((change: string) => {
      if (change) {
        if (change == 'DELETE') {
          this.game.player_images.splice(playerId, 1);
          this.game.players.splice(playerId, 1);
        } else {
          this.game.player_images[playerId] = change;
        }
        this.updateGame();
      }
    });
  }
}
