import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RegistrationService} from "../../auth/registration/registration.service";
import {map} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class PostsService {

    constructor(
        private http: HttpClient,
        private registrationService: RegistrationService
    ) {
    }

    // 获取当前用户状态
    getStatus(): Observable<any> {
        const username = localStorage.getItem('username');
        const url = `http://localhost:3000/headline/${username}`;
        if (username === null) {
            return this.http.get('http://localhost:3000/headline', {withCredentials: true});
        }
        return this.http.get(url, {withCredentials: true})
    }

    // 更新用户状态
    updateStatus(newStatus: string): Observable<any> {
        const url = 'http://localhost:3000/headline';
        return this.http.put(url, {headline: newStatus}, {withCredentials: true});
    }

    // 发布新文章或者文章和图片
    postNewArticle(text: any, image?: File): Observable<any> {
        const formData = new FormData();
        formData.append('text', text.toString());

        if (image) {
            formData.append('articleImage', image);
        }

        const url = `http://localhost:3000/article`;
        return this.http.post(url, formData, {withCredentials: true});
    }

    // 获取指定用户文章
    getUserArticle(page: number, limit: number): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        const url = `http://localhost:3000/articles?${params}`

        return this.http.get<any[]>(url, {withCredentials: true});
    }

    // 获取当前用户的关注用户
    getFollowedUsers(username: any): Observable<any> {
        const url = `http://localhost:3000/following/${username}`;

        if (username === null) {
            return this.http.get('http://localhost:3000/following', {withCredentials: true});
        }

        return this.http.get(url, {withCredentials: true});
    }

    // 添加关注用户
    followUser(followUser: any): Observable<any> {
        // 实现关注的逻辑
        const url = `http://localhost:3000/following/${followUser}`;
        return this.http.put(url, {}, {withCredentials: true});
    }

    // 取消关注用户
    unfollowUser(unfollowUser: any): Observable<any> {
        // 实现取消关注的逻辑
        const username = unfollowUser.toString();
        const url = `http://localhost:3000/following/${username}`;
        return this.http.delete(url, {withCredentials: true});
    }

    // 发表文章评论
    addComment(commentText: string, articleId: string): Observable<any> {
        const url = `http://localhost:3000/articles/${articleId}`;
        return this.http.put(url, {text: commentText, commentId: -1}, {withCredentials: true});
    }

    // 编辑文章评论
    editComment(commentText: string, commentId: number, articleId: string): Observable<any> {
        const url = `http://localhost:3000/articles/${articleId}`;
        return this.http.put(url, {text: commentText, commentId: commentId}, {withCredentials: true});
    }

    // 修改文章内容
    editArticle(articleText: string, articleId: string): Observable<any> {
        const url = `http://localhost:3000/articles/${articleId}`;
        return this.http.put(url, {text: articleText}, {withCredentials: true});
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

    // 获取用户电子邮件
    getUserEmail(user: any): Observable<any> {
        const username = user.toString();
        const url = `http://localhost:3000/email/${username}`;
        return this.http.get<any>(url, {withCredentials: true}).pipe(
            map(data => data.email)
        );
    }

    // 获取用户邮政编码
    getUserZipcode(user: string): Observable<any> {
        const url = `http://localhost:3000/zipcode/${user}`;
        return this.http.get(url, {withCredentials: true});
    }

    // 获取用户电话
    getUserPhone(user: string): Observable<any> {
        const url = `http://localhost:3000/phone/${user}`;
        return this.http.get(url, {withCredentials: true});
    }

    // 获取用户出生日期
    getUserDob(user: string): Observable<any> {
        const url = `http://localhost:3000/dob/${user}`;
        return this.http.get(url, {withCredentials: true});
    }
}
