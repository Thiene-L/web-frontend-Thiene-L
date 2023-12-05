import { TestBed } from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing'; // <-- Import this

import { PostsService } from './posts.service';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // <-- Add this line
    });
    service = TestBed.inject(PostsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch posts for a user', () => {
    const mockPosts = [{id: 1, body: 'test post'}];
    const httpMock = TestBed.inject(HttpTestingController);
    service.getPosts(1).subscribe(posts => {
      expect(posts).toEqual(mockPosts);
    });
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');
    req.flush(mockPosts);
  });

  it('should fetch user by name', () => {
    const mockUser = {id: 1, name: 'testUser'};
    const httpMock = TestBed.inject(HttpTestingController);
    service.getUserByName('testUser').subscribe(user => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush([mockUser]);
  });

  it('should fetch followed users', () => {
    const mockUsers = [{id: 2, name: 'User 2'}, {id: 3, name: 'User 3'}];
    const httpMock = TestBed.inject(HttpTestingController);
    service.getFollowedUsers(1).subscribe(users => {
      expect(users).toEqual(mockUsers);
    });
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush(mockUsers);
  });

  it('should return an empty array if userId is greater than 20', () => {
    service.getPosts(21).subscribe(posts => {
      expect(posts).toEqual([]);
    });
  });

  it('should fetch posts for a user', () => {
    const mockPosts = [{id: 1, body: 'test post', userId: 1}];
    const mockUsers = [{id: 1, name: 'testUser'}];
    const mockFollowedUsers = [{id: 2, name: 'followedUser'}];

    const httpMock = TestBed.inject(HttpTestingController);

    service.getPosts(1).subscribe(posts => {
      expect(posts).toEqual([
        {
          id: 1,
          body: 'test post',
          userId: 1,
          author: 'testUser',
          timestamp: jasmine.any(String) // 使用jasmine.any来匹配任何字符串，因为我们不能预测确切的时间戳
        }
      ]);
    });

    // 模拟第一个HTTP请求的响应
    const postsReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');
    postsReq.flush(mockPosts);

    // 模拟所有匹配的HTTP请求的响应
    const usersRequests = httpMock.match('https://jsonplaceholder.typicode.com/users');
    expect(usersRequests.length).toBe(2);
    usersRequests[0].flush(mockUsers);
    usersRequests[1].flush(mockFollowedUsers);
  });
});
