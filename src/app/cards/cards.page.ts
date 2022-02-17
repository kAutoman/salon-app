import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AddcardmodalPage } from '../addcardmodal/addcardmodal.page';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.page.html',
  styleUrls: ['./cards.page.scss'],
})
export class CardsPage implements OnInit {

  cards: any;
  method: string = 'apple';
  apiUrl = 'https://hairday.app/api/';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  constructor(private navCtrl: NavController, private modalCtrl: ModalController, private http: HttpClient) { }

  ngOnInit() {
    this.http.post(this.apiUrl+"card", JSON.stringify({api_token: localStorage.getItem('token')}), this.httpOptions)
    .subscribe(res => {
      if(res["status"] == 200){
        this.cards = res["data"];
        console.log(this.cards);
      }
    }, (err) => {
      console.log(err);
    });
  }
  
  async addCard(){
    const modal = await this.modalCtrl.create({
      component: AddcardmodalPage,
      cssClass: 'imagemodal',
      mode:'ios',
      swipeToClose:true,
      presentingElement: await this.modalCtrl.getTop()
    });

    modal.onDidDismiss()
    .then((data:any) => {
      this.cards.push(data.data.card);
    });
    
    return await modal.present();
  }

  selectCard(){
    console.log(this.method);
  }

}
