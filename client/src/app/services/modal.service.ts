import { BreakpointObserver } from '@angular/cdk/layout';
import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
 private breakpointObserver = inject(BreakpointObserver);
 private dialog = inject(MatDialog);
 private bottomSheet = inject(MatBottomSheet);
 openModal<T>(
    component: ComponentType<T>, 
    config: MatDialogConfig | MatBottomSheetConfig,
    dialogConf?: MatDialogConfig,
    bottomConf?: MatBottomSheetConfig,
 ): void {
      const isMatched = this.breakpointObserver.isMatched('(min-width: 640px)');
      if (isMatched) {
        const dialogConfig: MatDialogConfig = {
          ...config,
          ...dialogConf
        };
        this.dialog.open(component, dialogConfig)
      } else {
        const bottomConfig: MatBottomSheetConfig = {
          ...config as MatBottomSheetConfig,
          ...bottomConf
        };
        this.bottomSheet.open(component, bottomConfig)
      }
  }
}