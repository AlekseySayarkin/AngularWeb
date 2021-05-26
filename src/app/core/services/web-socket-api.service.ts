import { Injectable } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {TaskComponent} from '../components/task.component';
import {AppComponent} from '../../app.component';
import {HttpParams} from '@angular/common/http';

@Injectable()
export class WebSocketAPI {

  webSocketEndPoint = 'http://localhost:8080/manager/ws';
  topic = '/ws/greetings';
  stompClient: any;
  constructor(private appComponent: AppComponent){}

  _connect(): void {
    const ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);
    const thisClass = this;
    thisClass.stompClient.connect({}, () => {
      thisClass.stompClient.subscribe(thisClass.topic, (sdkEvent) => {
         thisClass.onMessageReceived(sdkEvent);
      });
    }, this.errorCallBack);
  }

  // on error, schedule a reconnection attempt
  errorCallBack(error): void {
    console.log('errorCallBack -> ' + error);
    setTimeout(() => {
      this._connect();
    }, 5000);
  }

  _send(message: any, path: string, method: string, params: HttpParams): void {
    this.stompClient.send('/manager' + '/' + method + path, params, JSON.stringify(message));
  }

  onMessageReceived(message): void {
    const tasks: TaskComponent[] = JSON.parse(message.body).body;
    this.appComponent.handleMessage(tasks);
  }
}
