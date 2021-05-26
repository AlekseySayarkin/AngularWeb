import { Injectable } from '@angular/core';
import {WebSocketAPI} from './web-socket-api.service';

@Injectable({providedIn: 'root'})
export class FileService {

    public getFile(id: number, webSocketAPI: WebSocketAPI): void {
      webSocketAPI._send(id, '/user/tasks/file', 'get', null);
    }
}
