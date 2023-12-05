import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ProfileService', () => {
    let service: ProfileService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ProfileService]
        });

        service = TestBed.get(ProfileService);
        httpMock = TestBed.get(HttpTestingController);
    });

    it('should fetch user info', () => {
        const mockData = { username: 'testUser' };

        service.getUserInfo(1).subscribe(data => {
            expect(data.username).toBe('testUser');
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users/1');
        req.flush(mockData);
    });

    it('should handle error response', () => {
        service.getUserInfo(1).subscribe(
            data => fail('Expected to fail due to a 404 response'),
            (error: any) => {
                expect(error.status).toBe(404);
            }
        );

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users/1');
        req.flush({}, { status: 404, statusText: 'Not Found' });
    });
});
