import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, NavParams } from '@ionic/angular';
import { CalendarMode, Step } from 'ionic2-calendar/calendar';

@Component({
  selector: 'app-calendarmodal',
  templateUrl: './calendarmodal.page.html',
  styleUrls: ['./calendarmodal.page.scss'],
})
export class CalendarmodalPage implements OnInit {

  service: any;
  date: any = new Date();
  eventSource;
  viewTitle;
  day: any;
  time = {lower: 8, upper: 24};
  calendar = {
      mode: 'month' as CalendarMode,
      step: 30 as Step,
      startingDayMonth: 1,
      currentDate: new Date(),
      dateFormatter: {
          formatMonthViewDayHeader: function(date:Date) {
            var week = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
            return week[date.getDay()];
          }
      }
  };
  
  constructor(private navCtrl: NavController, private modalCtrl: ModalController, private navParams: NavParams) { }
 
  ngOnInit() {
    this.date = this.navParams.get('date');
    this.time = this.navParams.get('time');
  }

  previous()
  {
    this.calendar.currentDate = new Date(this.calendar.currentDate.setMonth(this.calendar.currentDate.getMonth() - 1));
  }

  next()
  {
    this.calendar.currentDate = new Date(this.calendar.currentDate.setMonth(this.calendar.currentDate.getMonth() + 1));
  }

  onViewTitleChanged(title)
  {
    this.viewTitle = title;
  }

  onCurrentDateChanged(ev: Date)
  {
    this.date = ev;
  };

  setTime(day){
    this.day = day;
  }

  clear(){
    this.modalCtrl.dismiss({date: this.date, time: this.time});
  }

  apply(){
    this.modalCtrl.dismiss({date: this.date, time: this.time});
  }

  close()
  {
    this.modalCtrl.dismiss({date: this.date, time: this.time});
  }
}
