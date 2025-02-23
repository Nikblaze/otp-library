import { Component, Input, Output, EventEmitter, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'otp-input',
    templateUrl: './otp-input.component.html',
    styleUrls: ['./otp-input.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class OtpInputComponent implements AfterViewInit {
    @Input() length: number = 6;
    @Input() type: 'text' | 'number' = 'number';
    @Input() mask: boolean = false;
    @Input() autoSubmit: boolean = false;
    @Input() allowPaste: boolean = true;
    @Input() errorMessage: string = 'Invalid OTP';

    @Output() otpComplete = new EventEmitter<string>();
    @Output() otpChange = new EventEmitter<string>();

    otpValues: string[] = new Array(this.length).fill('');
    @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

    ngAfterViewInit() {
        this.focusFirstInput();
    }

    focusFirstInput() {
        if (this.otpInputs.first) {
            this.otpInputs.first.nativeElement.focus();
        }
    }

    handleInput(event: any, index: number) {
        const value = event.target.value;
        if (value.length === 1 && index < this.length - 1) {
            this.otpInputs.toArray()[index + 1].nativeElement.focus();
        }
        this.otpValues[index] = value;
        const otp = this.otpValues.join('');
        this.otpChange.emit(otp);
        if (otp.length === this.length && this.autoSubmit) {
            this.otpComplete.emit(otp);
        }
    }

    handleBackspace(event: any, index: number) {
        if (event.key === 'Backspace' && index > 0) {
            this.otpInputs.toArray()[index - 1].nativeElement.focus();
        }
    }

    handlePaste(event: ClipboardEvent) {
        if (!this.allowPaste) return;
        const clipboardData = event.clipboardData?.getData('text') || '';
        if (clipboardData.length === this.length) {
            this.otpValues = clipboardData.split('');
            this.otpInputs.forEach((input, idx) => input.nativeElement.value = this.otpValues[idx]);
            this.otpComplete.emit(clipboardData);
        }
    }
}
