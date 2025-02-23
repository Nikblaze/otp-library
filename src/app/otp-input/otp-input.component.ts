import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'otp-input',
    templateUrl: './otp-input.component.html',
    styleUrls: ['./otp-input.component.scss'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class OtpInputComponent implements OnInit {
    @Input() length: number = 6;
    @Input() type: 'text' | 'number' = 'number';
    @Input() mask: boolean = false;
    @Input() autoSubmit: boolean = false;
    @Input() allowPaste: boolean = true;
    @Input() errorMessage: string = '';

    @Output() otpComplete = new EventEmitter<string>();
    @Output() otpChange = new EventEmitter<string>();

    @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

    form: FormGroup;
    otpArray: FormArray;

    constructor(private fb: FormBuilder) {
        this.otpArray = this.fb.array([]);
        this.form = this.fb.group({
            otpDigits: this.otpArray
        });
    }

    ngOnInit() {
        // Initialize form controls
        for (let i = 0; i < this.length; i++) {
            this.otpArray.push(this.fb.control(''));
        }

        // Subscribe to value changes
        this.otpArray.valueChanges.subscribe(values => {
            const otp = values.join('');
            this.otpChange.emit(otp);

            if (otp.length === this.length && this.autoSubmit) {
                this.otpComplete.emit(otp);
            }
        });
    }

    handleInput(event: any, index: number) {
        const input = event.target as HTMLInputElement;
        const value = input.value;

        // Only allow numbers
        if (!/^\d*$/.test(value)) {
            input.value = '';
            return;
        }

        // Take only the last character if multiple characters are entered
        const newValue = value.slice(-1);
        this.otpArray.at(index).setValue(newValue, { emitEvent: true });

        // Move to next input if value is entered
        if (newValue && index < this.length - 1) {
            const nextInput = this.otpInputs.get(index + 1);
            if (nextInput) {
                nextInput.nativeElement.focus();
            }
        }
    }

    handleBackspace(event: KeyboardEvent, index: number) {
        if (event.key === 'Backspace') {
            const currentValue = this.otpArray.at(index).value;

            // If current input has value, clear it
            if (currentValue) {
                this.otpArray.at(index).setValue('');
                return;
            }

            // If current input is empty, move to previous input
            if (index > 0) {
                const prevInput = this.otpInputs.get(index - 1);
                if (prevInput) {
                    prevInput.nativeElement.focus();
                    this.otpArray.at(index - 1).setValue('');
                }
            }
        }
    }

    handlePaste(event: ClipboardEvent) {
        event.preventDefault();
        if (!this.allowPaste) return;

        const clipboardData = event.clipboardData?.getData('text') || '';
        const numbers = clipboardData.replace(/\D/g, '').split('').slice(0, this.length);

        numbers.forEach((num, idx) => {
            this.otpArray.at(idx).setValue(num);
        });

        // Focus the next empty input or the last input
        const nextEmptyIndex = numbers.length < this.length ? numbers.length : this.length - 1;
        this.otpInputs.get(nextEmptyIndex)?.nativeElement.focus();
    }
}
