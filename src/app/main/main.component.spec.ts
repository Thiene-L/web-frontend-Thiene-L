import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MainComponent} from './main.component';
import {PostsService} from './posts/posts.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {RegistrationService} from '../auth/registration/registration.service';
import {RouterTestingModule} from '@angular/router/testing';
import {PostsComponent} from './posts/posts.component';
import {FormsModule} from '@angular/forms';


describe('MainComponent', () => {
    let component: MainComponent;
    let fixture: ComponentFixture<MainComponent>;
    let registrationService: RegistrationService;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MainComponent, PostsComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, FormsModule],
            providers: [PostsService, RegistrationService]
        })
            .compileComponents();
        httpMock = TestBed.inject(HttpTestingController);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainComponent);
        component = fixture.componentInstance;
        registrationService = TestBed.inject(RegistrationService);
        fixture.detectChanges();
    });

    it('should log out a user', () => {
        // Mock localStorage methods
        spyOn(localStorage, 'removeItem');
        spyOn(localStorage, 'clear');
        spyOn(registrationService, 'clearCurrentUserId');

        component.onLogout();

        expect(localStorage.removeItem).toHaveBeenCalledWith('currentUserId');
        expect(localStorage.removeItem).toHaveBeenCalledWith('userType');
        expect(localStorage.removeItem).toHaveBeenCalledWith('registeredUser');
        expect(localStorage.removeItem).toHaveBeenCalledWith('status');
        expect(localStorage.clear).toHaveBeenCalled();
        expect(registrationService.clearCurrentUserId).toHaveBeenCalled();
    });

    it('should initialize with user data from API', () => {
        const mockUserData = {
            avatar: 'https://example.com/avatar.jpg',
            status: 'Test status'
        };

        spyOn(registrationService, 'getCurrentUserId').and.returnValue(1);
        spyOn(localStorage, 'getItem').and.callFake((key) => {
            if (key === 'userType') return 'login';
            return null;
        });

        component.ngOnInit();

        const requests = httpMock.match('https://jsonplaceholder.typicode.com/users/1');
        requests.forEach(req => {
            expect(req.request.method).toBe('GET');
            req.flush(mockUserData);
        });

        expect(component.imageSrc).toBe(mockUserData.avatar);
        expect(component.status).toBe(mockUserData.status);
    });

    it('should update image source on file selected', () => {
        const mockFile = new Blob([''], { type: 'image/jpeg' });
        const mockEvent = {
            target: {
                files: [mockFile]
            }
        } as any;
        component.onFileSelected(mockEvent);
        expect(component.imageSrc).toBeTruthy();
    });

    it('should update status', () => {
        const newStatus = 'New test status';
        component.newStatus = newStatus;
        component.updateStatus();
        expect(component.status).toBe(newStatus);
        expect(localStorage.getItem('status')).toBe(newStatus);
    });

    it('should update status', () => {
        const newStatus = 'New test status';
        component.newStatus = newStatus;
        component.updateStatus();
        expect(component.status).toBe(newStatus);
        expect(localStorage.getItem('status')).toBe(newStatus);
    });

    it('should logout user', () => {
        spyOn(localStorage, 'removeItem');
        spyOn(localStorage, 'clear');
        component.onLogout();
        expect(localStorage.removeItem).toHaveBeenCalledTimes(5); // Adjusted to 5 times
        expect(localStorage.clear).toHaveBeenCalled();
    });

    it('should initialize with user data from localStorage for register user type', () => {
        const mockUserData = {
            avatar: 'https://example.com/avatar.jpg',
            status: 'Test status from localStorage'
        };

        spyOn(registrationService, 'getCurrentUserId').and.returnValue(1);
        spyOn(localStorage, 'getItem').and.callFake((key) => {
            if (key === 'userType') return 'register';
            return null;
        });
        spyOn(registrationService, 'getRegisteredUserInfo').and.returnValue(mockUserData);

        component.ngOnInit();

        expect(component.imageSrc).toBe(mockUserData.avatar);
        expect(component.status).toBe(mockUserData.status);
    });

    it('should log error if user is not logged in or registered', () => {
        spyOn(registrationService, 'getCurrentUserId').and.returnValue(null);
        spyOn(console, 'error');

        component.ngOnInit();

        expect(console.error).toHaveBeenCalledWith('User is not logged in or registered.');
    });
});
