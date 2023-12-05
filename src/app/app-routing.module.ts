import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProfileComponent} from './profile/profile.component';
import {MainComponent} from './main/main.component';
import {AuthComponent} from "./auth/auth.component";

const routes: Routes = [
    {path: 'profile', component: ProfileComponent}, // add the route
    {path: '', component: AuthComponent}, // add the route
    {path: 'main', component: MainComponent}, // add the route
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
