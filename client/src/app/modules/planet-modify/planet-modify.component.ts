import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlanetService } from '../../services/planet.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetConfig, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Planet } from '../../models/planet.model';
import { TypedForm } from '../../models/form.model';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-planet-modify',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatFormFieldModule, A11yModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './planet-modify.component.html',
  styleUrl: './planet-modify.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetModifyComponent implements OnInit {
  fb = inject(FormBuilder);
  selectedFile?: File;
  form: TypedForm<Planet> = this.fb.group({
    planetName: this.fb.control<string>('', [Validators.required]),
    imageUrl: this.fb.control<string>('', [Validators.required]),
    description: this.fb.control<string>('', [Validators.required]),
    planetColor: this.fb.control<string>('', [Validators.required]),
    planetRadiusKM: this.fb.control<number>(0, [Validators.required]),
    distInMillionsKM: this.fb.group({
      fromSun: this.fb.control<number>(0, [Validators.required]),
      fromEarth: this.fb.control<number>(0, [Validators.required]),
    })
  });
  planetService = inject(PlanetService);
  modalService = inject(ModalService);
  dataDialog = inject(MAT_DIALOG_DATA, { optional: true });
  dataBottom = inject(MAT_BOTTOM_SHEET_DATA, { optional: true });
  dialogRef = inject(MatDialogRef<PlanetModifyComponent>, { optional: true });
  bottomSheetRef = inject(MatBottomSheetRef<PlanetModifyComponent>, { optional: true });
  dialog = inject(MatDialog);
  breakpointObserver = inject(BreakpointObserver);
  bottomSheet = inject(MatBottomSheet);
  dialogOpened = false;
  imageAdded = signal('');
  planet = signal<any>(null);
  get imageCtrl(): FormControl<string> {
    return this.form.get('imageUrl') as FormControl<string>;
  }

  get distCtrl(): FormGroup {
    return this.form.get('distInMillionsKM') as FormGroup;
  }

  ngOnInit(): void {
    this.dialogOpened = !!this.dialog.getDialogById('planet-dialog');
    this.planet.set(this.dialogOpened ? this.dataDialog?.planet : this.dataBottom?.planet) ;
    this.form.patchValue(this.planet());
    this.imageAdded.set(this.imageCtrl.value);
  }
  uploadImage(imageInput: HTMLInputElement): void {
    const files = imageInput.files;
    if (files && files.length) {
      this.selectedFile = files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageCtrl.setValue(e.target.result); 
        this.form.markAsDirty();
        this.imageAdded.set(e.target.result); // preview base64 URL of the image
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  submit(): void {
    if (this.planet() && !this.form.dirty) {
      //inputs not changed
      return;
    }
    this.form.markAllAsTouched();
    this.form.markAsDirty();
    const {valid} = this.form;
    if (!valid) {
      //form invalid, show some notification msg
      return;
    }

    if (this.planet()) {
      this.close();
      if (this.dialogOpened) {
        this.dialogRef?.afterClosed().subscribe(() => this.openConfirmation());
      } else {
        this.bottomSheetRef?.afterDismissed().subscribe(() => this.openConfirmation());
      }
    } else {
      this.planetService.addPlanet(this.form.value, this.selectedFile)
        .subscribe(() => {
            if (this.dataDialog?.confirm) {
                this.dataDialog?.confirm();
            }
            if (this.dataBottom?.confirm) {
                this.dataBottom?.confirm();
            }
            this.close();

        });
    }
  
  }

  close(): void {
    this.dialogOpened
        ? this.dialogRef?.close()
        : this.bottomSheetRef?.dismiss();
  }

  editPlanet(): void {
    this.planetService.editPlanet(this.planet().id,this.form.value, this.selectedFile)
      .subscribe(() => {
          if (this.dataDialog?.confirm) {
              this.dataDialog?.confirm();
          }
          if (this.dataBottom?.confirm) {
              this.dataBottom?.confirm();
          }

      });
  }

  openConfirmation(): void {
    const config: MatDialogConfig | MatBottomSheetConfig = {
      panelClass: 'confirmation-modal',
      data: {
        icon: 'icon-exclamation-popup',
        title: 'Confirm editing',
        text: `Are you sure you want to edit ${this.planet()?.planetName}?`,
        confirmBtn: 'Confirm',
        cancelBtn: 'Cancel',
        confirm: () => this.editPlanet(),
      }
    };
    const dialogConfig: MatDialogConfig = {
      maxWidth: '40rem',
      width: '100%',
      id: 'confirmation-dialog'
    };
    this.modalService.openModal(ConfirmationModalComponent, config, dialogConfig)
  }
 
}
