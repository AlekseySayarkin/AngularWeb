import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { TaskComponent } from '../components/task.component';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { environment } from 'src/environments/environment';
import { JwtComponent } from '../components/jwt.component';
import { SortComponent } from '../components/sort.component';
import { PaginationComponent } from '../components/pagination.component';

@Injectable({ providedIn: 'root'})
export class TaskService {

  private apiServerUrl = environment.apiBaseUrl;
  private authorizationHeader = environment.authorizationHeader;

  constructor(private http: HttpClient) {}

  public getTasks(sort: SortComponent, pagination: PaginationComponent, jwt:JwtComponent): Observable<TaskComponent[]> {
      const params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('size', pagination.size.toString())
      .set('sortType', sort.sortType)
      .set('sortBy', sort.sortBy)
      .set('status', sort.statusFilter);
      const headers = new HttpHeaders().set(this.authorizationHeader, jwt.jwt);

      return this.http.get<TaskComponent[]>(`${this.apiServerUrl}/user/tasks`, { params, headers });
  }

  public getCount(jwt:JwtComponent): Observable<number> {
      const headers = new HttpHeaders().set(this.authorizationHeader, jwt.jwt);
      return this.http.get<number>(`${this.apiServerUrl}/user/tasks/count`, { headers });
  }

  public updateTask(task: TaskComponent, jwt:JwtComponent): Observable<TaskComponent> {
    const headers = new HttpHeaders().set(this.authorizationHeader, jwt.jwt);
    return this.http.put<TaskComponent>(
      `${this.apiServerUrl}/user/tasks`, TaskService.getFormData(task), { headers }
    );
  }

  public addTask(task: TaskComponent, jwt:JwtComponent): Observable<TaskComponent> {
    const headers = new HttpHeaders().set(this.authorizationHeader, jwt.jwt);
    return this.http.post<TaskComponent>(
      `${this.apiServerUrl}/user/tasks`, TaskService.getFormData(task), { headers }
    );
  }

  private static getFormData(task: TaskComponent): FormData {
    const formData: FormData = new FormData();
    const taskJson = new Blob([JSON.stringify(task)], { type: 'application/json' });

    formData.append('task', taskJson);
    if(task.file != null)
      formData.append('file', task.file.data, task.file.name);

    return formData;
  }

  public deleteTask(id: number, jwt:JwtComponent): Observable<any> {
    const headers = new HttpHeaders().set(this.authorizationHeader, jwt.jwt);
    return this.http.delete(`${this.apiServerUrl}/user/tasks/${id}`, { headers });
  }
}
