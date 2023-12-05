import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AuthComponent} from './auth.component';
import {FormBuilder} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {RegistrationService} from './registration/registration.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {RegistrationComponent} from './registration/registration.component';
import {ReactiveFormsModule} from '@angular/forms';
import {Component} from "@angular/core";

describe('AuthComponent', () => {
    let component: AuthComponent;
    let fixture: ComponentFixture<AuthComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AuthComponent, RegistrationComponent],
            imports: [
                HttpClientTestingModule,
                ReactiveFormsModule,
                RouterTestingModule.withRoutes([ // <-- Add a mock route here
                    { path: 'main', component: DummyComponent } // <-- DummyComponent is a mock component
                ])
            ],
            providers: [FormBuilder, RegistrationService]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should log in a previously registered user', () => {
        component.loginForm.setValue({accountName: 'validUsername', password: 'validStreet'});

        component.onLogin();

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        expect(req.request.method).toBe('GET');
        req.flush([{id: 1, username: 'validUsername', address: {street: 'validStreet'}}]);

        expect(localStorage.getItem('currentUserId')).toBe('1');
        expect(localStorage.getItem('userType')).toBe('login');
    });

    it('should not log in an invalid user', () => {
        spyOn(window, 'alert');
        component.loginForm.setValue({accountName: 'invalidUsername', password: 'invalidStreet'});

        component.onLogin();

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        expect(req.request.method).toBe('GET');
        req.flush([]);

        expect(window.alert).toHaveBeenCalledWith('Invalid username or password');
    });

    afterEach(() => {
        httpMock.verify();
    });
    @Component({template: ''})
    class DummyComponent {}
});