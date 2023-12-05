import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {RegistrationService} from "./registration/registration.service";
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.css']
})
export class AuthComponent {

    loginForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private registrationService: RegistrationService,
        private http: HttpClient,
    ) {
        this.loginForm = this.fb.group({});
    }

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            accountName: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    onLogin() {
        if (this.loginForm.valid) {
            // 从表单中获取登录数据
            const loginData = {
                username: this.loginForm.get('accountName')?.value.toString(),
                password: this.loginForm.get('password')?.value.toString()
            }
            this.registrationService.loginUser(loginData).subscribe({
                next: (response) => {
                    console.log('Login successful:', response);
                    // 将用户的accountName存储在本地存储中
                    localStorage.setItem('username', response.username.toString());
                    // 可以进行其他操作，例如重定向到主页
                    this.router.navigate(['/main']).then(r => console.log('Navigate to Main Page.'));
                },
                error: (error) => {
                    console.error('Login failed:', error);
                    // 可以在这里处理登录失败的情况，例如显示错误消息
                    alert('Login failed: username or password incorrect');
                }
            });
        }
    }
}
