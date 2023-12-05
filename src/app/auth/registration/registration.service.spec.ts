import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {RegistrationService} from './registration.service';

describe('RegistrationService', () => {
    let service: RegistrationService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [RegistrationService]
        });
        service = TestBed.inject(RegistrationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should check if account name is unique', () => {
        const mockUsers = [{id: 1, username: 'existingUsername'}];

        service.isAccountNameUnique('newUsername').subscribe(isUnique => {
            expect(isUnique).toBeTrue();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        expect(req.request.method).toBe('GET');
        req.flush(mockUsers);
    });

    it('should set and get current user ID', () => {
        service.setCurrentUserId(123);
        expect(service.getCurrentUserId()).toBe(123);
    });

    it('should store and get registered user info', () => {
        const mockUserInfo = {
            accountName: 'testUser',
            emailAddress: 'test@email.com',
            phoneNumber: '123-456-7890',
            dateOfBirth: '2000-01-01',
            zipcode: '12345',
            password: 'Test@1234'
        };
        service.storeRegisteredUserInfo(mockUserInfo);
        expect(service.getRegisteredUserInfo()).toEqual(mockUserInfo);
    });

    it('should check if account name is not unique', () => {
        const mockUsers = [{id: 1, username: 'existingUsername'}];

        service.isAccountNameUnique('existingUsername').subscribe(isUnique => {
            expect(isUnique).toBeFalse();
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
        expect(req.request.method).toBe('GET');
        req.flush(mockUsers);
    });

    it('should get current user name for registered user', () => {
        const mockUserInfo = {
            accountName: 'testUser',
            emailAddress: 'test@email.com',
            phoneNumber: '123-456-7890',
            dateOfBirth: '2000-01-01',
            zipcode: '12345',
            password: 'Test@1234'
        };
        localStorage.setItem('userType', 'register');
        service.storeRegisteredUserInfo(mockUserInfo);
        service.setCurrentUserId(123);

        expect(service.getCurrentUserName()).toBe('testUser');
    });

    it('should get user type from local storage', () => {
        localStorage.setItem('userType', 'register');
        expect(service.getUserType()).toBe('register');
    });

    it('should clear current user ID', () => {
        service.setCurrentUserId(123);
        service.clearCurrentUserId();
        expect(service.getCurrentUserId()).toBeNull();
    });
});
