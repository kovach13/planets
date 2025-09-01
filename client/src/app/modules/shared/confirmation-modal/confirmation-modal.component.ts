import { A11yModule } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import {
    MatBottomSheetRef,
    MAT_BOTTOM_SHEET_DATA,
    MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
    MatDialogModule,
} from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [MatBottomSheetModule, MatDialogModule, A11yModule],
    templateUrl: './confirmation-modal.component.html',
    styleUrl: './confirmation-modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModalComponent implements OnInit {
    icon = signal<string>('');
    title = signal<string>('');
    text = signal<string>('');
    confirmBtnText = signal('');
    cancelBtnText = signal('');
    dialogOpened = false;
    dataDialog = inject(MAT_DIALOG_DATA, { optional: true });
    dataBottom = inject(MAT_BOTTOM_SHEET_DATA, { optional: true });
    dialogRef = inject(MatDialogRef<ConfirmationModalComponent>, { optional: true });
    bottomSheetRef = inject(MatBottomSheetRef<ConfirmationModalComponent>, { optional: true });
    dialog = inject(MatDialog);

    ngOnInit(): void {
        this.dialogOpened = !!this.dialog.getDialogById('confirmation-dialog');
        this.text.set(this.dataDialog?.text || this.dataBottom?.text || '');
        this.title.set(this.dataDialog?.title || this.dataBottom?.title || '');
        this.icon.set(this.dataDialog?.icon || this.dataBottom?.icon || '');
        this.confirmBtnText.set(
            this.dataDialog?.confirmBtnText ||
                this.dataBottom?.confirmBtnText ||
                'CONFIRM'
        );
        this.cancelBtnText.set(
            this.dataDialog?.cancelBtnText ||
                this.dataBottom?.cancelBtnText ||
                'CANCEL'
        );
    }

    cancel(): void {
        this.dialogOpened
            ? this.dialogRef?.close()
            : this.bottomSheetRef?.dismiss();
    }

    confirm(): void {
        if (this.dataDialog?.confirm) {
            this.dataDialog?.confirm();
        }
        if (this.dataBottom?.confirm) {
            this.dataBottom?.confirm();
        }
        this.dialogOpened
            ? this.dialogRef?.close(true)
            : this.bottomSheetRef?.dismiss(true);
    }
}
