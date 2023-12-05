import {Component, OnInit} from '@angular/core';
import {PostsService} from './posts/posts.service';
import {HttpClient} from '@angular/common/http';
import {RegistrationService} from '../auth/registration/registration.service';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable, tap} from "rxjs";
import {map} from "rxjs/operators";

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

    imgWidth = 150;
    imgHeight = 150;

    status = ""; // 用于绑定到状态字段
    newStatus = ''; // 用于绑定到输入框的新状态
    userImage = ''; // 用于绑定当前用户头像
    userName = ''; // 用于绑定当前用户姓名

    constructor(
        private postsService: PostsService,
        private http: HttpClient,
        private registrationService: RegistrationService,
        private router: Router,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        // 检查 URL 中是否有 username 参数
        this.route.queryParams.subscribe(params => {
            if (params['username']) {
                // 如果有，意味着用户刚刚通过 Google 登录
                console.log(params['username']);
                localStorage.setItem('username', params['username']); // 保存到 localStorage
                this.userName = params['username'];
            } else {
                // 正常登录流程
                const username = localStorage.getItem('username');
                if (!username) {
                    console.log('Please Login First');
                    this.router.navigate(['']).then(r => console.log('Navigate to Login Page.'));
                } else {
                    this.userName = username.toString();
                }
            }
        });

        const username = localStorage.getItem('username');


        // 更新用户的状态
        this.postsService.getStatus().subscribe(res => {
            this.status = res.headline;
        });

        // 更新绑定的当前用户头像
        this.postsService.getUserAvatar(username).subscribe(data => {
            this.userImage = data.avatar || "https://www.w3schools.com/howto/img_avatar.png";
        });
    }

    onFileSelected(event: Event) {
        const username = localStorage.getItem('username');
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (file) {
            // 更新数据库
            this.postsService.updateUserAvatar(file).subscribe(() => {
                // 更新页面中的用户图片
                this.postsService.getUserAvatar(username).subscribe(data => {
                    this.userImage = data.avatar;
                });
            });
        }
    }

    updateStatus() {
        if (this.newStatus.trim()) {
            this.postsService.updateStatus(this.newStatus)
                .pipe(
                    tap(updated => {
                        if (updated) {
                            this.status = this.newStatus; // 更新状态
                            this.newStatus = ''; // 清空输入
                        }
                    })
                ).subscribe(); // 这里的 subscribe 仅用于启动 Observable 流
        }
    }

    onLogout() {
        // 清除存储的用户ID、用户类型和注册用户的信息
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('userType');
        localStorage.removeItem('registeredUser');
        localStorage.removeItem('status');

        // 清除所有localStorage数据
        localStorage.clear();

        // 清除registrationService的当前用户ID
        this.registrationService.clearCurrentUser();

        // 向后端发送logout请求
        this.registrationService.logout();

        // 重定向用户到登录页面
        this.router.navigate(['']).then(r => console.log(r));
    }
}
