import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthComponent} from './auth/auth.component';
import {MainComponent} from './main/main.component';
import {PostsComponent} from './main/posts/posts.component';
import {ProfileComponent} from './profile/profile.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RegistrationComponent} from "./auth/registration/registration.component";
import {NgOptimizedImage} from "@angular/common";
import {HttpClientModule} from '@angular/common/http';


const routes: Routes = [
    {path: 'profile', component: ProfileComponent},
    {path: '', component: AuthComponent},
    {path: 'main', component: MainComponent}
];


@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        MainComponent,
        ProfileComponent,
        RegistrationComponent,
        PostsComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        RouterModule.forRoot(routes),
        FormsModule,
        NgOptimizedImage,
        HttpClientModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}


