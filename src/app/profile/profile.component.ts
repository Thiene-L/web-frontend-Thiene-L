import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {Router} from '@angular/router';
import {ProfileService} from "./profile.service";
import {RegistrationService} from "../auth/registration/registration.service";
import {PostsService} from "../main/posts/posts.service";
import {HttpClient} from "@angular/common/http";


@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    imageSrc = "https://www.w3schools.com/howto/img_avatar.png";
    imgWidth = 300;
    imgHeight = 300;

    userImage = ''; // 用来绑定用户头像

    linkError: string = ''; // 用来绑定错误信息
    unlinkError: string = ''; // 用来绑定错误信息
    unlinkErrorRice: string = ''; // 用来绑定错误信息

    public updateForm: FormGroup;
    public info: { [key: string]: string } = {
        accountName: '',
        emailAddress: '',
        phoneNumber: '',
        dateOfBirth: '',
        zipcode: ''
    };

    constructor(
        public uf: FormBuilder,
        private pf: FormBuilder,
        private router: Router,
        private profileService: ProfileService,
        private postsService: PostsService,
        private registrationService: RegistrationService,
        private http: HttpClient
    ) {
        this.updateForm = this.uf.group({});
    }

    ngOnInit(): void {
        // 检测用户是否登录
        const username = localStorage.getItem('username');

        if (!username) {
            console.log('Please login first!');
            this.router.navigate(['']).then(r => console.log('Navigate to Login Page.'));
        }

        // 更新绑定的当前用户头像
        this.profileService.getUserAvatar(username).subscribe(data => {
            this.userImage = data.avatar;
        });


        this.updateForm = this.uf.group({
            emailAddress: ['', [Validators.email]],
            phoneNumber: ['', [Validators.pattern(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/)]],
            dateOfBirth: ['', [this.ageValidator]],
            zipcode: ['', [Validators.pattern(/^\d{5,5}(-\d{4,4})?$/)]],
            password: ['', [Validators.pattern(/^(?=.{8})(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[*?!&￥$%^#,./@";:><\[\]}{\-=+_\\|》《。，、？'‘“”~ `]).*$/)]],
            passwordConfirmation: ['']
        }, {validator: this.passwordMatcher});

        if (username) {
            // 获取用户accountName
            this.info['accountName'] = username;

            // 获取用户emailAddress
            this.profileService.getEmail().subscribe(emailData => {
                this.info['emailAddress'] = emailData.email.toString();
            });

            // 获取用户phoneNumber
            this.profileService.getPhone().subscribe(phoneData => {
                this.info['phoneNumber'] = phoneData.phone.toString();

            });

            // 获取用户dateOfBirth
            this.profileService.getDob().subscribe(dobData => {
                this.info['dateOfBirth'] = dobData.dob.toString();
            });

            // 获取用户zipcode
            this.profileService.getZipcode().subscribe(zipcodeData => {
                this.info['zipcode'] = zipcodeData.zipcode.toString();
            });
        } else {
            console.log('Please Login First');
            this.router.navigate(['']).then(r => console.log('Navigate to Login Page.'));
        }
    }

    onFileSelected(event: Event) {
        const username = localStorage.getItem('username');
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (file) {
            // 更新数据库
            this.profileService.updateUserAvatar(file).subscribe(() => {
                // 更新页面中的用户图片
                this.profileService.getUserAvatar(username).subscribe(data => {
                    this.userImage = data.avatar;
                });
            });
        }
    }

    ageValidator(control: AbstractControl): ValidationErrors | null {
        const dateOfBirth = new Date(control.value);
        const age = Math.floor((new Date().getTime() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

        if (age < 18) {
            return {age: true};
        }
        return null;
    }

    passwordMatcher(group: FormGroup) {
        const password = group.get('password')?.value || '';
        const passwordConfirmation = group.get('passwordConfirmation')?.value || '';

        if (password && !passwordConfirmation) {
            return {passwordConfirmationRequired: true};
        }

        if (password !== passwordConfirmation) {
            return {mismatch: true};
        }

        return null;
    }

    onSubmit() {
        if (this.updateForm.valid) {

            // 更新email
            const email = this.updateForm.get('emailAddress')?.value;
            console.log(email);
            if (email != '' && email != null) {
                this.profileService.updateEmail(email).subscribe({
                    next: (response) => {
                        console.log('Email updated:', response);
                        // 更新前端显示的信息
                        this.info['emailAddress'] = email;
                    },
                    error: (error) => {
                        console.error('Error updating email:', error);
                    }
                });
            }

            // 更新phone
            const phone = this.updateForm.get('phoneNumber')?.value;
            if (phone != '' && phone != null) {
                this.profileService.updatePhone(phone).subscribe({
                    next: (response) => {
                        console.log('Phone number updated:', response);
                        // 更新前端现实的信息
                        this.info['phoneNumber'] = phone;
                    },
                    error: (error) => {
                        console.error('Error updating phone number:', error);
                    }
                });
            }

            // 更新zipcode
            const zipcode = this.updateForm.get('zipcode')?.value;
            if (zipcode != '' && zipcode != null) {
                this.profileService.updateZipcode(zipcode).subscribe({
                    next: (response) => {
                        console.log('zipcode updated:', response);
                        // 更新前端现实的信息
                        this.info['zipcode'] = zipcode;
                    },
                    error: (error) => {
                        console.error('Error updating zipcode:', error);
                    }
                });
            }

            // 更新password
            const password = this.updateForm.get('password')?.value;
            if (password != '' && password != null) {
                this.profileService.updatePassword(password).subscribe({
                    next: (response) => {
                        console.log('Password updated:', response);
                    },
                    error: (error) => {
                        console.error('Error updating password:', error);
                    }
                });
            }

            // 清空表单
            this.updateForm.reset();
        }
    }

    // 链接账户
    linkAccount() {
        const username = localStorage.getItem('username');
        console.log(username);

        let regex = /@google$/

        // 如果是通过第三方登录的用户
        if (username !== null && regex.test(username)) {
            this.linkError = 'You cannot link your account when you login with third party account!';
            return;
        }

        // 如果是通过注册登录的用户
        this.profileService.linkAccount(username).subscribe({
            next: (res) => {
                if (res.redirect) {
                    window.location.href = res.redirect;
                }
            },
            error: (err) => {
                if (err.status === 409) {
                    this.linkError = 'You have already linked your account!';
                } else {
                    // 处理其他错误
                    this.linkError = 'An error occurred';
                }
            }
        });
    }

    // 解绑账户
    unlinkAccount() {
        const username = localStorage.getItem('username');
        this.profileService.unlinkAccount(username, 'google').subscribe({
            next: (response) => {
                console.log('Account unlinked:', response);
                this.unlinkError = 'Unlink success!';
                localStorage.removeItem('userType');
            },
            error: (error) => {
                if (error.status === 404) {
                    console.error('Error unlinking account:', error);
                    this.unlinkError = 'You have already unlink your account!';
                }
                if (error.status === 401) {
                    console.error('Error unlinking account:', error);
                    this.unlinkError = 'Please login in the original account you want to unlink!';
                }
            }
        });
    }
}
