import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PostsService} from './posts.service';
import {DomSanitizer} from "@angular/platform-browser";
import {RegistrationService} from "../../auth/registration/registration.service";
import {HttpClient} from "@angular/common/http";
import {catchError, forkJoin, Observable, of, switchMap, tap} from "rxjs";
import {Router} from "@angular/router";
import {map} from "rxjs/operators";

@Component({
    selector: 'app-posts',
    templateUrl: './posts.component.html',
    styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
    @ViewChild('fileInput') fileInputVariable!: ElementRef;

    posts: any[] = []; // 用于存储所有帖子, 后端articleSchema全部数据
    displayedPosts: any[] = []; // 用于存储当前显示的帖子
    currentIndex = 1; // 当前显示的帖子的页码
    allUsersInfo: any[] = []; // 储存所有关注用户的信息

    searchKeyword: string = ''; // 用于绑定到搜索框的输入
    followedUsers: any[] = []; // 用于存储所有关注者

    newPostText: string = ''; // 用于绑定到新文章的输入字段

    newFollowerName: string = ''; // 用于绑定到输入字段的新关注者的名称

    followerError: string = ''; // 用于存储错误信息
    articleImage = ''; // 用于绑定页面中显示的文章图片
    articleImageFile: File | null = null; // 用于绑定用户的图片文件

    // 用于存储正在编辑或评论的文章的状态
    editingCommentId: number | null = null;
    commentingPostId: number | null = null;
    editingArticleId: number | null = null;
    newCommentText: string = '';
    editedCommentText: string = '';
    editedArticleText: string = '';
    commentError: string = '';
    articleError: string = '';

    constructor(
        private postsService: PostsService,
        private sanitizer: DomSanitizer,
        private http: HttpClient,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        if (localStorage.getItem('username') === null) {
            alert('Please login first!');
            this.router.navigate(['']).then(r => console.log('Navigate to Login Page.'));
            return;
        }
        const username = localStorage.getItem('username');

        // 清空关注用户的详细信息
        this.allUsersInfo = [];

        // 更新当前用户的关注用户
        this.postsService.getFollowedUsers(username)
            .pipe(
                tap(followedUsers => {
                    this.followedUsers = followedUsers.following;
                    console.log(this.followedUsers);
                }),
                switchMap(followedUsers => {
                    // 获取所有关注用户的详细信息
                    return this.fetchFollowedUsersInfo(followedUsers.following);
                })
            )
            .subscribe(() => {
                // 所有关注用户信息已获取，现在更新文章列表
                this.updateDisplayedPosts();
            });
    }

    // 获取所有关注用户信息
    fetchFollowedUsersInfo(followedUsers: string[]): Observable<any> {
        if (!followedUsers.length) {
            return of([]); // 如果没有关注的用户，直接返回空的 Observable
        }

        // 为每个关注用户创建一个 Observable 请求
        const userInfosObservables = followedUsers.map(user => {
            return forkJoin({
                avatarObservable: this.postsService.getUserAvatar(user),
                email: this.postsService.getUserEmail(user),
                // dob: this.postsService.getUserDob(user),
                // phone: this.postsService.getUserPhone(user),
                // zipcode: this.postsService.getUserZipcode(user)
            }).pipe(
                map(results => ({
                    username: user,
                    avatar: results.avatarObservable.avatar, // 仅提取 avatar 字段
                    email: results.email,
                    // dob: results.dob.dob,
                    // phone: results.phone.phone,
                    // zipcode: results.zipcode.zipcode
                }))
            );
        });

        return forkJoin(userInfosObservables).pipe(
            tap(userInfos => {
                // 更新所有用户信息
                this.allUsersInfo = userInfos;
                console.log(this.allUsersInfo);
            })
        );
    }

    // 上传文章图片文件
    onFileSelected(event: Event) {
        const username = localStorage.getItem('username');
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (file) {
            // 更新页面中的文章图片
            this.articleImage = URL.createObjectURL(file);

            // 更新文章文件变量
            this.articleImageFile = file;
        }
    }

    // 添加新文章
    onPostNewArticle(): void {
        if (this.newPostText.trim()) {
            if (this.articleImageFile) {
                this.postsService.postNewArticle(this.newPostText, this.articleImageFile).subscribe(posts => {
                    // 如果发布新文章失败，则显示错误消息
                    if (!posts) {
                        alert('Failed to post new article.');
                        return;
                    }

                    // 如果成功发布了新文章，则更新文章列表
                    this.newPostText = ''; // 清空文本
                    this.currentIndex = 1;
                    this.fileInputVariable.nativeElement.value = ''; // 清除选中的图片
                    this.articleImage = ''; // 清空图片URL
                    console.log('Article posted with image');
                    this.updateDisplayedPosts(); // 更新显示的帖子
                });
            } else {
                this.postsService.postNewArticle(this.newPostText).subscribe(posts => {
                    // 如果发布新文章失败，则显示错误消息
                    if (!posts) {
                        alert('Failed to post new article.');
                        return;
                    }

                    // 如果成功发布了新文章，则更新文章列表
                    this.newPostText = ''; // 清空文本
                    this.currentIndex = 1;
                    console.log('Article posted without image');
                    this.updateDisplayedPosts(); // 更新显示的帖子
                });
            }
        }
    }

    // 取消新文章
    onCancelNewArticle() {
        this.newPostText = ''; // 清空文本
        this.articleImage = ''; // 清空图片URL
        this.articleImageFile = null; // 清空图片文件
        this.fileInputVariable.nativeElement.value = '';
    }

    // 添加关注用户
    addFollower(): void {
        const username = localStorage.getItem('username');

        if (!username) {
            console.log("Please login first.");
            this.router.navigate(['']).then(r => console.log('Please login'));
            return;
        }

        if (this.newFollowerName.trim()) {
            // 检查是否已关注该用户或者是否是用户自己
            if (this.followedUsers.includes(this.newFollowerName) || this.newFollowerName === username) {
                this.followerError = this.newFollowerName === username ? "You can't follow yourself." : 'You are already following this user.';
                this.newFollowerName = ''; // 清除输入
                return;
            }

            // 添加新关注者
            this.postsService.followUser(this.newFollowerName).subscribe({
                next: (response) => {
                    if (response && response.following) {
                        // 更新关注者列表
                        this.followedUsers.push(this.newFollowerName);
                        this.newFollowerName = ''; // 清除输入
                        this.followerError = ''; // 清除任何现有的错误信息

                        // 获取新关注者信息并更新 UI
                        this.fetchFollowedUsersInfo(this.followedUsers).subscribe(() => {
                            // 更新 displayedPosts 以反映这些更改
                            this.currentIndex = 1;
                            this.updateDisplayedPosts();
                        });
                    } else {
                        // 用户不存在
                        this.followerError = 'User not found';
                    }
                },
                error: (error) => {
                    console.log("Error:", error);
                    this.followerError = error.status === 404 ? 'User not found' : 'Error occurred while following the user';
                }
            });
        } else {
            // 输入为空
            this.followerError = 'Please enter a user name';
        }
    }

    // 取消关注用户
    unfollowUser(unfollowUser: string): void {
        // 获取用户名
        const unfollowUserName = unfollowUser.toString();

        // 删除数据库中的关注者
        this.postsService.unfollowUser(unfollowUserName).subscribe({
            next: (response) => {
                if (response && response.following) {
                    // 更新followedUsers数组
                    this.followedUsers = this.followedUsers.filter(user => user !== unfollowUserName);

                    // 从用户信息列表中移除取消关注的用户
                    this.allUsersInfo = this.allUsersInfo.filter(userInfo => userInfo.username !== unfollowUserName);

                    // 更新 displayedPosts 以反映这些更改
                    this.currentIndex = 1;
                    this.updateDisplayedPosts();
                } else {
                    // 处理错误或者用户未找到的情况
                    console.error('Error occurred while unfollowing the user:', response);
                }
            },
            error: (error) => {
                console.error("Error occurred while unfollowing the user:", error);
            }
        });
    }

    // 编辑文章
    editComment(text: any, commentId: number, articleId: any) {
        // 如果输入为空
        if (!text.toString().trim()) {
            this.commentError = 'Please enter a comment';
            return;
        }

        // 调用服务以更新文章
        this.postsService.editComment(text.toString(), commentId, articleId.toString()).subscribe({
            next: () => {
                // 清空输入框
                this.editedCommentText = '';

                // 清除错误信息
                this.commentError = '';

                // 更新文章显示
                this.updateDisplayedPosts();
            },
            error: (error) => {
                // 处理错误
                if (error.status === 403) {
                    console.log('You can only edit your own comments.');
                    this.commentError = 'You can only edit your own comments.';
                    this.editedCommentText = ''; // 清空输入框
                    return;
                }
            }
        });
    }

    // 修改文章
    editArticle(text: any, articleId: any) {
        // 如果输入为空
        if (!text.toString().trim()) {
            this.articleError = 'Please enter a comment';
            return;
        }

        // 调用服务以更新文章
        this.postsService.editArticle(text.toString(), articleId.toString()).subscribe({
            next: () => {
                // 清空输入框
                this.editedArticleText = '';

                // 清除错误信息
                this.articleError = '';

                // 更新文章显示
                this.updateDisplayedPosts();
            },
            error: (error) => {
                // 处理错误
                if (error.status === 403) {
                    console.log('You can only edit your own articles.');
                    this.articleError = 'You can only edit your own articles.';
                    this.editedArticleText = ''; // 清空输入框
                    return;
                }
            }
        });
    }

    // 添加评论
    addComment(text: any, commentId: any) {
        // 如果输入为空
        if (!text.toString().trim()) {
            this.commentError = 'Please enter a comment';
            return;
        }

        // 调用服务以添加评论
        this.postsService.addComment(text.toString(), commentId.toString()).subscribe(() => {
            // 清空输入框
            this.newCommentText = '';

            // 更新文章显示
            this.updateDisplayedPosts();
        });
    }

    // 切换编辑状态
    toggleEdit(commentId: number) {
        this.editingCommentId = this.editingCommentId === commentId ? null : commentId;
        this.commentError = '';
    }

    // 切换评论状态
    toggleComment(postId: number) {
        this.commentingPostId = this.commentingPostId === postId ? null : postId;
    }

    // 切换修改文章状态
    toggleEditArticle(articleId: number) {
        this.editingArticleId = this.editingArticleId === articleId ? null : articleId;
        this.editedArticleText = this.editingArticleId ? this.displayedPosts.find(p => p.id === articleId)?.text : '';
        this.articleError = '';
    }

    // 更新展示的文章并应用搜索关键词
    updateDisplayedPosts(): void {
        this.postsService.getUserArticle(this.currentIndex, 10)
            .subscribe(articles => {
                this.displayedPosts = articles;
                if (this.searchKeyword) {
                    // 如果有搜索关键词，则仅显示相关的帖子
                    this.displayedPosts = this.displayedPosts.filter(post => {
                        return post.text.toLowerCase().includes(this.searchKeyword.toLowerCase());
                    });
                }
            });
    }

    // 搜索时进行高亮，但不过滤帖子
    onSearch(): void {
        if (!this.searchKeyword) {
            // 如果清空了搜索框，则重置显示的帖子
            this.currentIndex = 1;
            this.updateDisplayedPosts();
        }
    }

    highlight(text: string): any {
        if (!this.searchKeyword) return text;
        const re = new RegExp(`(${this.searchKeyword})`, 'gi');
        const replacedText = text.replace(re, '<mark>$1</mark>');
        return this.sanitizer.bypassSecurityTrustHtml(replacedText);
    }

    onNext() {
        this.currentIndex++;
        this.updateDisplayedPosts();
        // this.currentIndex += 10;
        // this.displayedPosts = this.posts.slice(this.currentIndex, this.currentIndex + 10);
    }

    onPrevious() {
        this.currentIndex = Math.max(1, this.currentIndex - 1); // 保证页码不小于1
        this.updateDisplayedPosts();
        // this.currentIndex -= 10;
        // this.displayedPosts = this.posts.slice(this.currentIndex, this.currentIndex + 10);
    }
}
