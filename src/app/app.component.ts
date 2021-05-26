import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FileComponent } from './core/components/file.component';
import { FileService } from './core/services/file.service';
import { TaskComponent } from './core/components/task.component';
import { TaskService } from './core/services/task.service';
import { saveAs } from 'file-saver';
import { NgForm } from '@angular/forms';
import { SortComponent } from './core/components/sort.component';
import {DateConstant} from './core/constants/date-constant';
import {StatusComponent} from './core/components/status.component';
import {WebSocketAPI} from './core/services/web-socket-api.service';
import {Byte} from '@angular/compiler/src/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public tasks: TaskComponent[];
  public file: FileComponent;
  public task: TaskComponent;
  public sort: SortComponent = new SortComponent();
  public hasFile: boolean;
  private deleteFile = false;
  private filename: string;

  webSocketAPI: WebSocketAPI;
  message: any;
  messageBlob: Byte[];
  name: string;

  constructor(private taskService: TaskService, private fileService: FileService) {}

  handleMessage(message): void {
    if (message !== undefined && message.length > 1000) {
      saveAs(new Blob([this.base64ToArrayBuffer(message)]), this.filename);
      return;
    }

    this.message = message;
    this.readTasks();
  }

  base64ToArrayBuffer(base64: any): ArrayBuffer {
    const binaryString =  window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array( len );
    for (let i = 0; i < len; i++)        {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  public ngOnInit(): void {
    this.webSocketAPI = new WebSocketAPI(this);
    this.webSocketAPI._connect();
    this.taskService.init(this.webSocketAPI);
  }

  public openModal(task: TaskComponent, modalName: string): void {
    const container = document.getElementById('container');

    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');

    switch (modalName) {
      case 'add': {
        button.setAttribute('data-target', '#addTaskModal');
        break;
      }
      case 'update': {
        this.task = task;
        this.hasFile = task.file != null;
        button.setAttribute('data-target', '#updateTaskModal');
        break;
      }
      case 'delete': {
        this.task = task;
        button.setAttribute('data-target', '#deleteTaskModal');
        break;
      }
      case 'authenticate': {
        button.setAttribute('data-target', '#authenticateModal');
        break;
      }
      case 'tasks': {
        this.getTasks();
      }
    }

    container.appendChild(button);
    button.click();
  }

  public onActive(task: TaskComponent): void {
    this.changeStatus(task, 'ACTIVE');
  }

  public onFinish(task: TaskComponent): void {
    this.changeStatus(task, 'FINISHED');
  }

  public onPostpone(task: TaskComponent): void {
     this.changeStatus(task, 'POSTPONED');
  }

  private changeStatus(task: TaskComponent, changedStatus: string): void {
    const status = new StatusComponent();
    status.status = changedStatus;
    task.status = status;
    task.endDate = task.endDate + DateConstant.DATE_CONSTANT_POSTFIX;
    this.taskService.updateTask(task);
    task.endDate = task.endDate.substring(0, 10);
    this.delay(1000).then(() => { this.getTasks(); });
  }

  public onDeleteFile(): void {
    this.deleteFile = true;
  }

  public onChangeStatus(event: any): void {
    this.sort.statusFilter = event.target.value;
    this.getTasks();
  }

  public getTasks(): void {
    this.taskService.getTasks(this.sort);
    this.readTasks();
  }

  private readTasks(): void {
    if (Array.isArray(this.message)) {
      this.tasks = this.message;
      this.tasks.forEach(t => {
        t.endDate = t.endDate.substring(0, 10);
      });
    }
  }

  public onDownloadFile(task: TaskComponent): void {
    this.fileService.getFile(task.id, this.webSocketAPI);
    this.filename = task.file.name;
  }

  public loadFile(event: any): void{
    const uploadedFile: File = event.target.files[0] as File;
    if (uploadedFile.size > 10485760) {
      alert('File is too big');
      return;
    }

    this.file = new FileComponent();
    this.file.name = uploadedFile.name;
    this.file.data = uploadedFile;
  }

  public onAddTask(addForm: NgForm): void {
    document.getElementById('close-add-task').click();

    this.taskService.addTask(this.extractFromForm(addForm));
    this.delay(1000).then(() => { this.getTasks(); });
  }

  private extractFromForm(form: NgForm): TaskComponent {
    const task = new TaskComponent();
    const taskName = form.controls.task.value;
    const taskEndDate = form.controls.end_date.value;

    if (taskName !== '') {
      task.task = taskName;
    }
    else {
      task.task = this.task.task;
    }

    if (taskEndDate !== '') {
      task.endDate = taskEndDate + DateConstant.DATE_CONSTANT_POSTFIX;
    }
    else {
      task.endDate = this.task.endDate + DateConstant.DATE_CONSTANT_POSTFIX;
    }

    if (this.file != null) {
      task.file = this.file;
      this.file = null;
    } else if (this.task?.file != null){
      task.file = this.task?.file;
    }

    return task;
  }

  public onUpdateTask(updateForm: NgForm): void {
    document.getElementById('close-update-task').click();

    const task = this.extractFromForm(updateForm);
    task.id = this.task.id;
    task.status = this.task.status;
    if (this.deleteFile) {
      task.file = null;
      this.deleteFile = false;
    }
    this.taskService.updateTask(task);
    this.delay(1000).then(() => { this.getTasks(); });
  }

  public onDeleteTask(id: number): void {
    this.taskService.deleteTask(id);
    this.delay(1000).then(() => { this.getTasks(); });
  }

  async delay(ms: number): Promise<void> {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms));
  }
}
