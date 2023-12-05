import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {PostsComponent} from './posts.component';
import {PostsService} from './posts.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {RegistrationService} from '../../auth/registration/registration.service';
import {of} from 'rxjs';

describe('PostsComponent', () => {
    let component: PostsComponent;
    let fixture: ComponentFixture<PostsComponent>;
    let postsService: PostsService;

    const mockPosts = [
        {id: 1, body: 'test post', title: 'test title', userId: 1},
        {id: 2, body: 'another post', title: 'another title', userId: 2},
        {id: 3, body: 'third post', title: 'third title', userId: 3},
        {id: 4, body: 'fourth post', title: 'fourth title', userId: 4}
    ];


    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PostsComponent],
            imports: [HttpClientTestingModule, FormsModule],
            providers: [PostsService, RegistrationService]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PostsComponent);
        component = fixture.componentInstance;
        postsService = TestBed.inject(PostsService);
        component.posts = [];  // 重置posts数组
        fixture.detectChanges();
    });

    it('should toggle comments for a post', () => {
        component.posts = [{id: 1, showComments: false}];
        component.toggleComments(1);
        expect(component.posts[0].showComments).toBe(true);
    });

    it('should highlight the search keyword in the text', () => {
        component.searchKeyword = 'test';
        const highlightedText = component.highlight('This is a test post');
        expect(highlightedText.toString()).toContain('<mark>test</mark>');
    });

    it('should return original text when no search keyword', () => {
        component.searchKeyword = '';
        const text = 'This is a test post';
        expect(component.highlight(text)).toBe(text);
    });

    it('should navigate to next set of posts', () => {
        component.currentIndex = 0;
        component.onNext();
        expect(component.currentIndex).toBe(4);
    });

    it('should navigate to previous set of posts', () => {
        component.currentIndex = 4;
        component.onPrevious();
        expect(component.currentIndex).toBe(0);
    });
});
