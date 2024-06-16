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
  gameData: any;
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
    this.gameData.forEach(element => {
      console.log(element);
      if (element.id == params['id']){
        this.game.currentPlayer = element?.currentPlayer;
        this.game.playedCards = element?.playedCards;
        this.game.players = element?.players;
        this.game.stack = element?.stack;
        this.game.id = element?.id;;
      }
    });

    // return onSnapshot(q, (data) => {
    //   // console.log(data);
    //   // this.game.currentPlayer = data?.currentPlayer;
    //   // this.game.playedCards = gameData?.playedCards;
    //   // this.game.players = gameData?.players;
    //   // this.game.stack = gameData?.stack;
    //   // this.game.id = gameData?.id;
    // });
  }

  subGameData() {
    return onSnapshot(this.getGameRef(), (data) => {
      this.gameData = [];
      data.forEach(element => {
        this.gameData.push(this.setGameObject(element.data(), element.id));
      });
      console.log(this.gameData);
    });
  }

  setGameObject(obj: any, id: string) {
    return {
      id: id,
      players: obj.players,
      stack: obj.stack,
      playedCards: obj.playedCards,
      currentPlayer: obj.currentPlayer
    }
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
