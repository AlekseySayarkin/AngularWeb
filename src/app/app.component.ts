import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FileComponent } from './core/components/file.component';
import { FileService } from './core/services/file.service';
import { TaskComponent } from './core/components/task.component';
import { TaskService } from './core/services/task.service';
import { saveAs } from 'file-saver';
import { NgForm } from '@angular/forms';
import { JwtClientService } from './core/services/jwt-client.service';
import { JwtComponent } from './core/components/jwt.component';
import { AuthRequestComponent } from './core/components/auth-request.component';
import { SortComponent } from './core/components/sort.component';
import { PaginationComponent } from './core/components/pagination.component';
import {DateConstant} from './core/constants/date-constant';
import {StatusComponent} from './core/components/status.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  public tasks: TaskComponent[];
  public file: FileComponent;
  public task: TaskComponent;
  public pagination: PaginationComponent = new PaginationComponent();
  public sort: SortComponent = new SortComponent();
  private jwt: JwtComponent;
  public hasFile: Boolean;
  private deleteFile: Boolean = false;

  constructor(private taskService: TaskService, private fileService: FileService, private jwtClientService: JwtClientService) {}

  public ngOnInit() {
    this.getJwt();
    if (this.jwt == null)
      this.openModal(null, 'authenticate');
    else
      this.getTasks();
  }

  private getJwt(): void {
    const jwt = new JwtComponent();
    jwt.jwt = sessionStorage.getItem("jwt");
    if (jwt.jwt != null)
      this.jwt = jwt;
  }

  public openModal(task: TaskComponent, modalName: string): void {
    const container = document.getElementById('container');

    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');

    switch(modalName) {
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
    }

    container.appendChild(button);
    button.click();
  }

  public onActive(task: TaskComponent) : void {
    this.changeStatus(task, "ACTIVE")
  }

  public onFinish(task: TaskComponent) : void {
    this.changeStatus(task, "FINISHED")
  }

  public onPostpone(task: TaskComponent): void {
     this.changeStatus(task, "POSTPONED")
  }

  private changeStatus(task: TaskComponent, changedStatus: string): void {
    const status = new StatusComponent();
    status.status = changedStatus;
    task.status = status;
    task.endDate = task.endDate + DateConstant.DATE_CONSTANT_POSTFIX;
    this.taskService.updateTask(task, this.jwt).subscribe(() => {});
    task.endDate = task.endDate.substring(0, 10)
    this.delay(1000).then(() => { this.getTasks() });
  }

  public onDeleteFile(): void {
    this.deleteFile = true;
  }

  public onChangeStatus(event: any) {
    this.sort.statusFilter = event.target.value;
    this.getTasks();
  }

  public authenticate(authForm: NgForm) {
    document.getElementById('close-authentication-modal').click();

    const authRequest = new AuthRequestComponent();
    authRequest.login = authForm.controls['login'].value;
    authRequest.password = authForm.controls['password'].value;

    this.jwtClientService.generateToken(authRequest).subscribe(
      (response: string) => {
        this.jwt = new JwtComponent();
        this.jwt.jwt = response;
        this.saveJwt();
        this.getTasks();
      },
      () => {
        alert("Error while signing up");
        this.openModal(null, 'authenticate');
      }
    );
  }

  private saveJwt(): void {
    sessionStorage.setItem("jwt", this.jwt.jwt);
  }

  public getTasks(): void {
    this.setPagination();
    this.taskService.getTasks(this.sort, this.pagination, this.jwt).subscribe(
      (response: TaskComponent[]) => {
        this.tasks = response;
        this.tasks.forEach(t => { t.endDate = t.endDate.substring(0, 10) })
      },
      () => {
        alert("Unauthorized, please log in")
        this.openModal(null, 'authenticate');
      }
    )
  }

  public setPagination(): void {
    this.taskService.getCount(this.jwt).subscribe(
      (response: number) => {
        this.pagination.count = response;
        this.pagination.totalPages = Math.floor((this.pagination.count + this.pagination.size - 1) / this.pagination.size);
      },
      (error: HttpErrorResponse) => {
        if (error.status == 401 || error.status == 403) {
          alert("Unauthorized, please log in")
          this.openModal(null, 'authenticate');
        }
      }
    );
  }

  public changePage(page: number): void {
    if (page <= this.pagination.totalPages && page > 0) {
      this.pagination.page = page;
      this.getTasks();
    }
  }

  public onDownloadFile(task: TaskComponent): void {
    this.fileService.getFile(task.id, this.jwt).subscribe(
      (response: Blob) => { saveAs(response, task.file?.name); },
      (error: HttpErrorResponse) => {
        if (error.status == 401 || error.status == 403) {
          alert("Unauthorized, please log in")
          this.openModal(null, 'authenticate');
        }
      }
    );
  }

  public loadFile(event: any)  {
    this.file = new FileComponent();
    const uploadedFile: File = <File> event.target.files[0];
    this.file.name = uploadedFile.name;
    this.file.data = uploadedFile;
  }

  public onAddTask(addForm: NgForm): void {
    document.getElementById('close-add-task').click();

    this.taskService.addTask(this.extractFromForm(addForm), this.jwt).subscribe(
      () => {alert("kek")},
      (error: HttpErrorResponse) => {
        if (error.status == 401 || error.status == 403) {
          alert("Unauthorized, please log in")
          this.openModal(null, 'authenticate');
        }
      }
    );
    this.delay(1000).then(() => { this.getTasks() });
  }

  private extractFromForm(form: NgForm): TaskComponent {
    const task = new TaskComponent();
    const taskName = form.controls['task'].value;
    const taskEndDate = form.controls['end_date'].value;

    if (taskName != '')
      task.task = taskName;
    else
      task.task = this.task.task;

    if (taskEndDate != '')
      task.endDate = taskEndDate + DateConstant.DATE_CONSTANT_POSTFIX;
    else
      task.endDate = this.task.endDate + DateConstant.DATE_CONSTANT_POSTFIX;

    task.file = this.file;
    this.file = null;

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
    this.taskService.updateTask(task, this.jwt).subscribe(
      () => {},
      (error: HttpErrorResponse) => {
        if (error.status == 401 || error.status == 403) {
          alert("Unauthorized, please log in")
          this.openModal(null, 'authenticate');
        }
      }
    );
    this.delay(1000).then(() => { this.getTasks() });
  }

  public onDeleteTask(id: number): void {
    this.taskService.deleteTask(id, this.jwt).subscribe(
      () => {},
      (error: HttpErrorResponse) => {
        if (error.status == 401 || error.status == 403) {
          alert("Unauthorized, please log in")
          this.openModal(null, 'authenticate');
        }
      }
    );
    this.delay(1000).then(() => { this.getTasks() });
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms));
  }
}
