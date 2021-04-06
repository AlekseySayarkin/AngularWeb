import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthRequestComponent } from '../components/auth-request.component';

@Injectable({
  providedIn: 'root'
})
export class JwtClientService {

  private apiServerUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  public generateToken(request: AuthRequestComponent): Observable<string> {
      return this.http.post<string>(`${this.apiServerUrl}/auth/login`, request, { responseType: 'text' as 'json' });
  }
}
