import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ProfileComponent} from './profile.component';
import {RegistrationService} from '../auth/registration/registration.service';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {ReactiveFormsModule, Validators} from "@angular/forms";

describe('ProfileComponent', () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let registrationService: jasmine.SpyObj<RegistrationService>;
    let httpClient: jasmine.SpyObj<HttpClient>;

    beforeEach(() => {
        const regServiceSpy = jasmine.createSpyObj('RegistrationService', ['getCurrentUserId', 'getRegisteredUserInfo']);
        const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);

        TestBed.configureTestingModule({
            declarations: [ProfileComponent],
            imports: [ReactiveFormsModule],
            providers: [
                {provide: RegistrationService, useValue: regServiceSpy},
                {provide: HttpClient, useValue: httpSpy}
            ]
        }).compileComponents();

        registrationService = TestBed.inject(RegistrationService) as jasmine.SpyObj<RegistrationService>;
        httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;

        component.updateForm = component.uf.group({
            accountName: ['testUser', [Validators.pattern(/^\w{6,12}$/)]],
            displayName: ['Test User'],
            emailAddress: ['test@email.com', [Validators.email]],
            phoneNumber: ['123-456-7890', [Validators.pattern(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/)]],
            dateOfBirth: ['2000-01-01', [component.ageValidator]],
            zipcode: ['12345', [Validators.pattern(/^\d{5,5}(-\d{4,4})?$/)]],
            password: ['Test@1234', [Validators.pattern(/^(?=.{8})(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[*?!&￥$%^#,./@";:><\[\]}{\-=+_\\|》《。，、？'‘“”~ `]).*$/)]],
            passwordConfirmation: ['Test@1234']
        }, {validator: component.passwordMatcher});
    });

    it('should fetch the logged in user\'s profile username', fakeAsync(() => {
        const mockUserData = {
            username: 'testUser',
            name: 'Test User',
            email: 'test@email.com',
            phone: '123-456-7890',
            address: {zipcode: '12345'}
        };

        registrationService.getCurrentUserId.and.returnValue(1);
        localStorage.setItem('userType', 'login');
        httpClient.get.and.returnValue(of(mockUserData));

        component.ngOnInit();
        tick();  // 模拟异步任务的完成

        expect(component.info['accountName']).toBe('testUser');
    }));

    it('should update imageSrc when a new image is selected', () => {
        const mockFile = new Blob([''], {type: 'image/jpeg'});
        const mockFileList = {
            0: mockFile,
            length: 1,
            item: (index: number) => mockFile
        };
        const mockEvent = {
            target: {
                files: mockFileList
            }
        } as any;

        component.onFileSelected(mockEvent as Event);
        fixture.detectChanges();

        const reader = new FileReader();
        reader.readAsDataURL(mockFile);
        reader.onloadend = () => {
            expect(component.imageSrc).toBe(reader.result as string);
        };
    });

    it('should initialize with user data from API for login user type', () => {
        const mockUserData = {
            username: 'testUser',
            name: 'Test User',
            email: 'test@email.com',
            phone: '123-456-7890',
            address: {zipcode: '12345'}
        };

        registrationService.getCurrentUserId.and.returnValue(1);
        localStorage.setItem('userType', 'login');
        httpClient.get.and.returnValue(of(mockUserData));

        component.ngOnInit();

        expect(component.info['accountName']).toBe('testUser');
        expect(component.info['displayName']).toBe('Test User');
        expect(httpClient.get).toHaveBeenCalled();
    });

    it('should initialize with user data from localStorage for register user type', () => {
        const mockUserData = {
            accountName: 'testUser',
            displayName: 'Test User',
            emailAddress: 'test@email.com',
            phoneNumber: '123-456-7890',
            zipcode: '12345'
        };

        registrationService.getCurrentUserId.and.returnValue(1);
        localStorage.setItem('userType', 'register');
        registrationService.getRegisteredUserInfo.and.returnValue(mockUserData);

        component.ngOnInit();

        expect(component.info['accountName']).toBe('testUser');
        expect(component.info['displayName']).toBe('Test User');
        expect(registrationService.getRegisteredUserInfo).toHaveBeenCalled();
    });

    it('should not update info if updateForm is invalid', () => {
        component.updateForm.setErrors({invalid: true});
        component.onSubmit();
        expect(component.info['accountName']).toBe('');
    });

    it('should update info if updateForm is valid', () => {
        component.onSubmit();
        expect(component.info['accountName']).toBe('testUser');
        expect(component.info['displayName']).toBe('Test User');
    });

    it('should reset updateForm if it is valid', () => {
        component.onSubmit();
        expect(component.updateForm.get('accountName')?.value).toBe(null);
    });
});
