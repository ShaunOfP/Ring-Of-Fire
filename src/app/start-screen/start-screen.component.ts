import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, collectionData, onSnapshot, doc, addDoc, query, where } from '@angular/fire/firestore';
import { Game } from '../../models/game';

@Component({
  selector: 'app-start-screen',
  standalone: true,
  imports: [],
  templateUrl: './start-screen.component.html',
  styleUrl: './start-screen.component.scss'
})
export class StartScreenComponent {

  constructor(private firestore: Firestore, private router: Router) {

  }

  async newGame() {
    let game = new Game();
    await addDoc(collection(this.firestore, 'games'), game.toJson())
      .then((gameInfo: any) => {
        this.router.navigateByUrl('/game/' + gameInfo.id);
      })
      .catch((err) => {
        console.error(err);
      })
  }
}
