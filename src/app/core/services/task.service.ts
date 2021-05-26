import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import { TaskComponent } from '../components/task.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SortComponent } from '../components/sort.component';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { WebSocketAPI } from './web-socket-api.service';
import { WsFileComponent } from '../components/ws.file.component';
import { WsTaskComponent } from '../components/ws.task.component';

@Injectable({ providedIn: 'root'})
export class TaskService {

  constructor(private http: HttpClient) {}

  public message: Subject<Message>;
  private apiServerUrl = environment.apiBaseUrl;
  private webSocketAPI: WebSocketAPI;

  private static getFormData(task: TaskComponent): FormData {
    const formData: FormData = new FormData();
    const taskJson = new Blob([JSON.stringify(task)], { type: 'application/json' });

    formData.append('task', taskJson);
    if (task.file != null) {
      if (task.file.data != null) {
        formData.append('file', task.file.data, task.file.name);
      } else if (task.file.name != null) {
        formData.append('file', new Blob(), task.file.name);
      }
    }
    return formData;
  }

  public init(webSocketApi: WebSocketAPI): void {
    this.webSocketAPI = webSocketApi;
  }

  public getTasks(sort: SortComponent): void {
      const params = new HttpParams()
      .set('status', sort.statusFilter);

      this.webSocketAPI._send(sort.statusFilter, '/user/tasks', 'get', params);
  }

  public updateTask(task: TaskComponent): void {
    const reader = new FileReader();
    const wsFile = new WsFileComponent();
    const wsTask = new WsTaskComponent();

    if (task.file != null) {
      try {
        reader.readAsDataURL(task.file.data);
        reader.onloadend = () => {
          wsTask.id = task.id;
          wsTask.task = task.task;
          wsTask.status = task.status;
          wsTask.endDate = task.endDate;
          wsFile.id = task.file.id;
          wsFile.name = task.file.name;
          wsFile.data = reader.result;
          wsFile.data = wsFile.data.slice(84);
          wsTask.file = wsFile;
          this.webSocketAPI._send(wsTask, `/user/tasks/${task.id}`, 'put', null);
        };
      } catch (TypeError) {
        wsTask.id = task.id;
        wsTask.task = task.task;
        wsTask.status = task.status;
        wsTask.endDate = task.endDate;
        this.webSocketAPI._send(wsTask, `/user/tasks/${task.id}`, 'put', null);
      }
    } else {
      wsTask.id = task.id;
      wsTask.task = task.task;
      wsTask.status = task.status;
      wsTask.endDate = task.endDate;
      this.webSocketAPI._send(wsTask, `/user/tasks/${task.id}`, 'put', null);
    }
  }

  public addTask(task: TaskComponent): void {
    const reader = new FileReader();
    const wsFile = new WsFileComponent();
    const wsTask = new WsTaskComponent();

    if (task.file != null) {
      try {
        reader.readAsDataURL(task.file.data);
        reader.onloadend = () => {
          wsTask.id = task.id;
          wsTask.task = task.task;
          wsTask.status = task.status;
          wsTask.endDate = task.endDate;
          wsFile.id = task.file.id;
          wsFile.name = task.file.name;
          wsFile.data = reader.result;
          wsFile.data = wsFile.data.slice(84);
          wsTask.file = wsFile;
          this.webSocketAPI._send(wsTask, `/user/tasks/${task.id}`, 'post', null);
        };
      } catch (TypeError) {
        wsTask.id = task.id;
        wsTask.task = task.task;
        wsTask.status = task.status;
        wsTask.endDate = task.endDate;
        this.webSocketAPI._send(wsTask, `/user/tasks/${task.id}`, 'post', null);
      }
    } else {
      wsTask.id = task.id;
      wsTask.task = task.task;
      wsTask.status = task.status;
      wsTask.endDate = task.endDate;
      this.webSocketAPI._send(wsTask, `/user/tasks/${task.id}`, 'post', null);
    }
  }

  public deleteTask(id: number): void {
    this.webSocketAPI._send(id, `/user/tasks/${id}`, 'delete', null);
  }
}
