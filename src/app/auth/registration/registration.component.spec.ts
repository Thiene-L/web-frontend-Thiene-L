import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RegistrationComponent} from './registration.component';
import {ReactiveFormsModule} from '@angular/forms';
import {RegistrationService} from "./registration.service";
import {of} from "rxjs";
import {Router} from "@angular/router";

describe('RegistrationComponent', () => {
    let component: RegistrationComponent;
    let fixture: ComponentFixture<RegistrationComponent>;
    const mockRouter = {
        navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RegistrationComponent],
            imports: [HttpClientTestingModule, ReactiveFormsModule],
            providers: [
                {provide: Router, useValue: mockRouter},
                // ... other providers
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegistrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should invalidate the form', () => {
        component.registrationForm.controls['accountName'].setValue('');
        component.registrationForm.controls['emailAddress'].setValue('');
        component.registrationForm.controls['phoneNumber'].setValue('');
        component.registrationForm.controls['dateOfBirth'].setValue('');
        component.registrationForm.controls['zipcode'].setValue('');
        component.registrationForm.controls['password'].setValue('');
        component.registrationForm.controls['passwordConfirmation'].setValue('');
        expect(component.registrationForm.valid).toBeFalsy();
    });

    it('should validate the form', () => {
        component.registrationForm.controls['accountName'].setValue('testUser');
        component.registrationForm.controls['emailAddress'].setValue('test@email.com');
        component.registrationForm.controls['phoneNumber'].setValue('123-456-7890');
        component.registrationForm.controls['dateOfBirth'].setValue('2000-01-01');
        component.registrationForm.controls['zipcode'].setValue('12345');
        component.registrationForm.controls['password'].setValue('Test@1234');
        component.registrationForm.controls['passwordConfirmation'].setValue('Test@1234');
        expect(component.registrationForm.valid).toBeTruthy();
    });

    it('should register a new user with a unique username', () => {
        // Mock the isAccountNameUnique method to return true
        const registrationService = TestBed.inject(RegistrationService);
        spyOn(registrationService, 'isAccountNameUnique').and.returnValue(of(true));

        // Fill out the form with valid data
        component.registrationForm.controls['accountName'].setValue('testUser');
        component.registrationForm.controls['displayName'].setValue('Test User');
        component.registrationForm.controls['emailAddress'].setValue('test@email.com');
        component.registrationForm.controls['phoneNumber'].setValue('123-456-7890');
        component.registrationForm.controls['dateOfBirth'].setValue('2000-01-01');
        component.registrationForm.controls['zipcode'].setValue('12345');
        component.registrationForm.controls['password'].setValue('Test@1234');
        component.registrationForm.controls['passwordConfirmation'].setValue('Test@1234');

        // Call the onSubmit method
        component.onSubmit();

        // Verify that the user ID is set in local storage
        const userId = localStorage.getItem('currentUserId');
        expect(userId).toBeTruthy();

        // Verify that the user type is set to 'register' in local storage
        const userType = localStorage.getItem('userType');
        expect(userType).toBe('register');

        // Verify that the user info is stored in local storage
        const userInfo = JSON.parse(localStorage.getItem('registeredUser') || '{}');
        expect(userInfo.accountName).toBe('testUser');
        expect(userInfo.displayName).toBe('Test User');
        // ... you can add more assertions for other fields ...

        // Verify navigation to the main page
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/main']);
    });

    it('should not register a user with an existing username', () => {
        const registrationService = TestBed.inject(RegistrationService);
        spyOn(registrationService, 'isAccountNameUnique').and.returnValue(of(false));
        spyOn(window, 'alert');

        component.registrationForm.setValue({
            accountName: 'existingUser',
            displayName: 'Existing User',  // <-- Added this line
            emailAddress: 'test@email.com',
            phoneNumber: '123-456-7890',
            dateOfBirth: '2000-01-01',
            zipcode: '12345',
            password: 'Test@1234',
            passwordConfirmation: 'Test@1234'
        });

        component.onSubmit();

        expect(window.alert).toHaveBeenCalledWith('This username already exists, please choose a different username!');
    });
});
