import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, throwError} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    constructor(private http: HttpClient) {
    }

    // 获取email
    getEmail(): Observable<any> {
        const username = localStorage.getItem('username');

        // 如果没有用户名
        if (!username) {
            return this.http.get('http://localhost:3000/email', {withCredentials: true});
        }

        const url = `http://localhost:3000/email/${username}`;
        return this.http.get(url, {withCredentials: true});
    }

    // 更新email
    updateEmail(newEmail: any): Observable<any> {
        const username = localStorage.getItem('username');

        const url = 'http://localhost:3000/email'
        return this.http.put(url, {email: newEmail.toString()}, {withCredentials: true});
    }

    // 获取zipcode
    getZipcode(): Observable<any> {
        const username = localStorage.getItem('username');

        // 如果没有用户名
        if (!username) {
            return this.http.get('http://localhost:3000/zipcode', {withCredentials: true});
        }

        const url = `http://localhost:3000/zipcode/${username}`;
        return this.http.get(url, {withCredentials: true});
    }

    // 更新zipcode
    updateZipcode(newZipcode: any): Observable<any> {
        const username = localStorage.getItem('username');

        const url = 'http://localhost:3000/zipcode';
        return this.http.put(url, {zipcode: newZipcode.toString()}, {withCredentials: true});
    }

    // 获取生日
    getDob(): Observable<any> {
        const username = localStorage.getItem('username');

        // 如果没有用户名
        if (!username) {
            return this.http.get('http://localhost:3000/dob', {withCredentials: true});
        }

        const url = `http://localhost:3000/dob/${username}`
        return this.http.get(url, {withCredentials: true});
    }

    // 获取电话
    getPhone(): Observable<any> {
        const username = localStorage.getItem('username');

        // 如果没有用户名
        if (!username) {
            return this.http.get('http://localhost:3000/phone', {withCredentials: true});
        }

        const url = `http://localhost:3000/phone/${username}`;
        return this.http.get(url, {withCredentials: true});
    }

    // 更新电话
    updatePhone(newPhone: any): Observable<any> {
        const username = localStorage.getItem('username');

        const url = 'http://localhost:3000/phone';
        return this.http.put(url, {phone: newPhone.toString()}, {withCredentials: true});
    }

    // 更新密码
    updatePassword(newPassword: String): Observable<String> {
        const url = 'http://localhost:3000/password';
        return this.http.put<String>(url, {newPassword: newPassword.toString()}, {
            withCredentials: true,
            responseType: 'text' as 'json'
        });
    }

    // 上传用户头像
    updateUserAvatar(userImage: File): Observable<any> {
        const formData = new FormData();
        formData.append('userImage', userImage);
        const url = 'http://localhost:3000/avatar';
        return this.http.put(url, formData, {withCredentials: true});
    }

    // 获取用户头像
    getUserAvatar(user: any): Observable<any> {
        const username = user.toString();
        const url = `http://localhost:3000/avatar/${username}`
        return this.http.get(url, {withCredentials: true});
    }

    // 关联账户
    linkAccount(username: any): Observable<any> {
        const user = username.toString();
        const url = `http://localhost:3000/link/${user}`;
        return this.http.post(url, {}, {withCredentials: true}).pipe(
            catchError(err => {
                // 处理错误响应
                return throwError(err);
            })
        );
    }


    // 取消关联账户
    unlinkAccount(username: any, provider: any): Observable<any> {
        const user = username.toString();
        const url = `http://localhost:3000/unlink/${user}`;
        return this.http.post(url, {provider: provider}, {withCredentials: true});
    }
}
