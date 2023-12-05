import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Router} from "@angular/router";
import {RegistrationService} from "./registration.service";
import {catchError, tap, throwError} from "rxjs";

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
    registrationForm: FormGroup;
    loginForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        public router: Router,
        private registrationService: RegistrationService
    ) {
        this.registrationForm = this.fb.group({});
        this.loginForm = this.fb.group({});
    }

    ngOnInit(): void {
        this.registrationForm = this.fb.group({
                accountName: ['', [Validators.required, Validators.pattern(/^\w{6,12}$/)]],
                displayName: [''],
                emailAddress: ['', [Validators.required, Validators.email]],
                phoneNumber: ['', [Validators.required, Validators.pattern(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/)]],
                dateOfBirth: ['', [Validators.required, this.ageValidator]],
                zipcode: ['', [Validators.required, Validators.pattern(/^\d{5,5}(-\d{4,4})?$/)]],
                password: ['', [Validators.required, Validators.pattern(/^(?=.{8})(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[*?!&￥$%^#,./@";:><\[\]}{\-=+_\\|》《。，、？'‘“”~ `]).*$/)]],
                passwordConfirmation: ['', [Validators.required]]
            },
            {validator: this.passwordMatcher});
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
        if (!password && !passwordConfirmation) return null; // If both are empty, return null
        return password === passwordConfirmation ? null : {mismatch: true};
    }

    onSubmit() {
        if (this.registrationForm.valid) {
            const userData = {
                username: this.registrationForm.value.accountName,
                displayName: this.registrationForm.value.displayName,
                email: this.registrationForm.value.emailAddress,
                phone: this.registrationForm.value.phoneNumber,
                dob: this.registrationForm.value.dateOfBirth,
                zipcode: this.registrationForm.value.zipcode,
                password: this.registrationForm.value.password
            }

            this.registrationService.registerUser(userData).pipe(
                tap((res) => {
                    console.log('Registration Successful:', res);
                    alert('Registration Successful: you can now login.');
                }),
                catchError((error) => {
                    console.error('Registration Failed:', error);
                    alert('Registration Failed: Username already exists');
                    return throwError(() => new Error('Registration failed'));
                })
            ).subscribe();
        } else {
            console.log('Form is invalid.');
        }
    }
}
