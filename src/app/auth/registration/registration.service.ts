import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class RegistrationService {
    constructor(
        private http: HttpClient
    ) {
    }

    // 注册用户
    registerUser(userData: any): Observable<any> {
        return this.http.post('http://localhost:3000/register', userData, { withCredentials: true });
    }

    // 登录用户
    loginUser(loginData: any): Observable<any> {
        return this.http.post('http://localhost:3000/login', loginData, { withCredentials: true });
    }

    clearCurrentUser(): void {
        localStorage.removeItem('username');
    }

    // 向后端请求logout
    logout(): Observable<any> {
        const url = 'http://localhost:3000/logout';
        return this.http.put(url, {withCredentials: true});
    }
}
