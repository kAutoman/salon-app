import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GooglePlus} from '@ionic-native/google-plus/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import {
  SignInWithApple,
  ASAuthorizationAppleIDRequest,
  AppleSignInResponse,
  AppleSignInErrorResponse
} from "@ionic-native/sign-in-with-apple/ngx";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  
  ptype:any= 'password';
  email: string;
  password: string;
  isEmail = false;
  setPassword = false;
  checkPass = true;
  isExist: boolean = false;
  apiUrl = 'https://hairday.app/api/';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(
    private navCtrl: NavController,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private googlePlus: GooglePlus,
    private fb: Facebook,
    private signInWithApple: SignInWithApple
  ) { }

  ngOnInit() {
  }

  emailCheck(){
    var regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    this.isEmail = regexp.test(this.email);
  }

  emailExist(){
    var user = {email: this.email}
    this.http.post(this.apiUrl+"check-email", JSON.stringify(user), this.httpOptions)
      .subscribe(res => {
        if(res["status"] == 200){
          this.isExist = true;
        }else{
          this.isExist = false;
        }
      }, (err) => {
        console.log(err);
      });
  }

  strongPass(){
    var strongRegex = new RegExp("^(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    this.checkPass = strongRegex.test(this.password);
  }

  nextStep(){
    if(this.setPassword == false){
      this.setPassword = true;
    }else{
      if(this.checkPass){
        var user = {email: this.email, password: this.password}
        this.http.post(this.apiUrl+"login", JSON.stringify(user), this.httpOptions)
          .subscribe(res => {
            if(res["status"] == 200){
              this.toastMessage(res["message"]);
              localStorage.setItem('token', res['data']['api_token']);
              this.navCtrl.navigateRoot('home');
            }else{
              for(let key in res["message"]){
                this.toastMessage(res["message"][key]);
              }
            }
          }, (err) => {
            console.log(err);
          });
      }
    }
  }

  forgotPassword(){
    this.navCtrl.navigateRoot('otpphoneinput');
  }

  skip(){
    this.navCtrl.navigateRoot('home');
  }

  switchType()
  {
    if(this.ptype == 'password')
    {
      this.ptype = 'text';
    }

    else
    {
      this.ptype = 'password'
    }
  }

  withGoogle(){
    this.googlePlus.login({
      webClientId: '991305834542-9jdd87auh6dofhdskdr4gbml739v7aqb.apps.googleusercontent.com',
      offline: true
    }).then((res: any) => {
      this.http.post(this.apiUrl+"login-social", JSON.stringify({email: res.email}), this.httpOptions)
        .subscribe(res => {
          if(res["status"] == 200){
            this.toastMessage(res["message"]);
            localStorage.setItem('token', res['data']['api_token']);
            localStorage.setItem('social', 'google');
            this.navCtrl.navigateRoot('home');
          }else{
            for(let key in res["message"]){
              this.toastMessage(res["message"][key]);
            }
          }
        }, (err) => {
          console.log(err);
        });
    }).catch(err => {
      this.toastMessage("error: " + err);
    })
  }

  withFacebook(){
    const permissions = ["public_profile", "email"];

    this.fb.login(permissions)
    .then(res =>{
      let userId = res.authResponse.userID;
      // Getting name and gender properties
      this.fb.api("/me?fields=name,email", permissions)
      .then(user =>{
        this.http.post(this.apiUrl+"login-social", JSON.stringify({email: user.email}), this.httpOptions)
        .subscribe(res => {
          if(res["status"] == 200){
            this.toastMessage(res["message"]);
            localStorage.setItem('token', res['data']['api_token']);
            localStorage.setItem('social', 'facebook');
            this.navCtrl.navigateRoot('home');
          }else{
            for(let key in res["message"]){
              this.toastMessage(res["message"][key]);
            }
          }
        }, (err) => {
          console.log(err);
        });
      })
    }, error =>{
      this.toastMessage("error: " + error);
    });
  }

  withApple(){
    this.signInWithApple
      .signin({
        requestedScopes: [
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
        ]
      })
      .then((res: AppleSignInResponse) => {
        console.log("Apple login success:- " + res);
        this.http.post(this.apiUrl+"login-social", JSON.stringify({email: res.email}), this.httpOptions)
        .subscribe(res => {
          if(res["status"] == 200){
            this.toastMessage(res["message"]);
            localStorage.setItem('token', res['data']['api_token']);
            localStorage.setItem('social', 'facebook');
            this.navCtrl.navigateRoot('home');
          }else{
            for(let key in res["message"]){
              this.toastMessage(res["message"][key]);
            }
          }
        }, (err) => {
          console.log(err);
        });
      })
      .catch((error: AppleSignInErrorResponse) => {
        this.toastMessage("error: " + error);
      });
  }

  async toastMessage(msg){
    const toast = await this.toastCtrl.create({
      message: msg,
      cssClass: 'ion-text-center',
      duration: 2000
    });
    toast.present();
  }

}
