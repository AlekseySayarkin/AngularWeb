import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {JwtComponent} from '../components/jwt.component';

@Injectable({providedIn: 'root'})
export class FileService {

    private apiServerUrl = environment.apiBaseUrl;
    private authorizationHeader = environment.authorizationHeader;

    constructor(private http: HttpClient) {}

    public getFile(id: number, jwt:JwtComponent): Observable<Blob> {
      const headers = new HttpHeaders().set(this.authorizationHeader, jwt.jwt);
      return this.http.get(`${this.apiServerUrl}/user/tasks/${id}/file`, { responseType: 'blob', headers });
    }
}
