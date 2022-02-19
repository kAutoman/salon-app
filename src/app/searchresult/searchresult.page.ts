import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, ToastController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { SearchmodalPage } from '../searchmodal/searchmodal.page';
import { CalendarmodalPage } from '../calendarmodal/calendarmodal.page';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
  GoogleMapsAnimation,
  MyLocation
} from '@ionic-native/google-maps/ngx';

@Component({
  selector: 'app-searchresult',
  templateUrl: './searchresult.page.html',
  styleUrls: ['./searchresult.page.scss'],
})
export class SearchresultPage implements OnInit {
  
  service: any = 'haircut';
  city: any = "New York";
  empty = false;
  popular: any;
  salons: any;
  date: any;
  dateString: string;
  time: any;
  expand: boolean = false;
  map: GoogleMap;
  marker: any;
  address: string;
  latLng: any;
  logoUrl = 'https://hairday.app/assets/images/salon-logos/';
  imageUrl = 'https://hairday.app/assets/images/salons/';
  apiUrl = 'https://hairday.app/api/';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private http: HttpClient,
    private router: Router,
    private nativeGeocoder: NativeGeocoder,
    private platform: Platform
  ) { }

  ngOnInit() {
    var params = this.router.getCurrentNavigation().extras.state;
    if(params) {
      if("service_type" in params){
        var service_type = params.service_type;
        this.service = params.service;
        this.http.get(this.apiUrl+"salons-by-service-type/" + service_type, this.httpOptions)
          .subscribe(res => {
            if(res["status"] == 200){
              this.salons = res["data"];
              for(var i in this.salons){
                var salon_image_count = this.salons[i].salon_images.length;
                if(salon_image_count < 4){
                  this.salons[i].salon_slider = {
                    initialSlide: 0,
                    slidesPerView:salon_image_count,
                  }
                }else{
                  this.salons[i].salon_slider = {
                    initialSlide: 0,
                    slidesPerView:4,
                  }
                }
              }
            }
            if(this.salons.length == 0){
              this.empty = true;
            }
          }, (err) => {
            console.log(err);
          });
      };
      if("ss_id" in params){
        var ss_id = params.ss_id;
        this.service = params.keyword;
        var key = params.key;
        this.searchResult(ss_id, this.service, key);
      };
      this.popular = params.popular;
    }
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      if(localStorage.getItem('location') != null){
        var location = localStorage.getItem('location');
        this.latLng = JSON.parse(location);
        this.getAddressFromCoords(this.latLng.lat, this.latLng.lng);
      }
      this.loadMap();
    });    
  }

  searchResult(ss_id, name, key){
    var params = {id: ss_id, name: name, key: key}
    this.http.post(this.apiUrl+"salon/search/result", JSON.stringify(params), this.httpOptions)
    .subscribe(res => {
      console.log(res);
      if(res["status"] == 200){
        this.salons = [res["data"]["salon"]];                     
        let today = new Date();
        let week = today.getDay();
        for(let i in this.salons){
          let opening_hours = this.salons[i]['opening_hours'];
          this.salons[i]['opening_hour'] = opening_hours[week-1];
        }
      }
      if(this.salons.length == 0){
        this.empty = true;
      }
    }, (err) => {
      console.log(err);
    });
  }

  onScroll(event) {
    this.expand = false;
  }

  loadMap() {    
    this.map = GoogleMaps.create("map", {
       camera: {
          target: {
            lat: this.latLng.lat,
            lng: this.latLng.lng
          },
          zoom: 17,
          tilt: 30
      }
    });
    this.map.on(GoogleMapsEvent.MAP_READY).subscribe(
      (data) => {
          console.log("Click MAP",data);
      }
    );
  }

  getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords " + lattitude + " " + longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        console.log(result);
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if (value.length > 0)
            responseAddress.push(value);
        }

        console.log(responseAddress);
        
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value + ", ";
        }
        this.address = this.address.slice(0, -2);
        this.city = this.address;
      })
      .catch((error: any) => {
        this.address = "Address Not Available!";
      });

  }

  async searchbar() {
    this.expand = true
    const modal = await this.modalCtrl.create({
      component: SearchmodalPage,
      componentProps: {service: this.service, popular: this.popular},
      cssClass: 'searchmodal',
      mode:'ios',
      swipeToClose:true,
      presentingElement: await this.modalCtrl.getTop()
    });

    modal.onDidDismiss()
    .then((data:any) => {
      var close = data.data.close;
      if(!close){
        var ss_id = data.data.ss_id;
        this.service = data.data.keyword;
        var key = data.data.key;
        this.searchResult(ss_id, this.service, key);
      }
    });
    
    return await modal.present();
  }

  async calendar(){
    this.expand = true;

    const modal = await this.modalCtrl.create({
      component: CalendarmodalPage,
      componentProps: {date: this.date, time: this.time},
      cssClass: 'calendarmodal',
      mode:'ios',
      swipeToClose:true,
      presentingElement: await this.modalCtrl.getTop()
    });

    modal.onDidDismiss()
    .then((data:any) => {
      this.date = data.data.date;
      this.time = data.data.time;
      var week = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      this.dateString = week[this.date.getDay()] + ", ";
      this.dateString += this.date.toLocaleDateString("en-US", { day: 'numeric' }) + " ";
      this.dateString += this.date.toLocaleDateString("en-US", { month: 'short' });
    });
    
    return await modal.present();
  }

  async toastMessage(msg){
    const toast = await this.toastCtrl.create({
      message: msg,
      cssClass: 'ion-text-center',
      duration: 2000
    });
    toast.present();
  }

  goSalon(id){
    this.navCtrl.navigateForward('salon', {state: {salon_id: id}});
  }

}
