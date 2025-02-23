import { Routes } from '@angular/router';
import { OtpInputComponent } from './otp-input/otp-input.component';
export const routes: Routes = [
    {
        path: '',
        component: OtpInputComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];

