import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { PlanetModifyComponent } from '../planet-modify/planet-modify.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanetService } from '../../services/planet.service';
import { Planet } from '../../models/planet.model';
import { ModalService } from '../../services/modal.service';
import { LoaderService } from '../../services/loader.service';


@Component({
    selector: 'app-planet-details',
    standalone: true,
    imports: [MatBottomSheetModule],
    templateUrl: './planet-details.component.html',
    styleUrl: './planet-details.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetDetailsComponent implements OnInit {
  breakpointObserver = inject(BreakpointObserver);
  dialog = inject(MatDialog);
  bottomSheet = inject(MatBottomSheet);
  router = inject(Router);
  route = inject(ActivatedRoute);
  planetService = inject(PlanetService);
  private planetId!: number;
  modalService = inject(ModalService);
  loaderService = inject(LoaderService);
  planet = signal<Planet | null>(null);
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.planetId = +id;
      this.getPlanet();
    }
  }

  getPlanet(): void {
    this.loaderService.show();
    this.planetService.getPlanetById(this.planetId)
      .subscribe((planet) => {
        this.planet.set(planet);
        this.loaderService.hide();
      })
  }

  editPlanet(): void {
    const config: MatDialogConfig | MatBottomSheetConfig = {
      panelClass: 'planet-modal',
      data: {
        planet: this.planet(),
        confirm: () => this.getPlanet()
      }
    };
    const dialogConfig: MatDialogConfig = {
      maxWidth: '59.2rem',
      width: '100%',
      id: 'planet-dialog'
    };
    this.modalService.openModal(PlanetModifyComponent, config, dialogConfig)
  }

  openConfirmation(): void {
    const config: MatDialogConfig | MatBottomSheetConfig = {
      panelClass: 'confirmation-modal',
      data: {
        icon: 'icon-exclamation-popup',
        title: 'Confirm deleting',
        text: `Are you sure you want to delete ${this.planet()?.planetName}?`,
        confirmBtn: 'Confirm',
        cancelBtn: 'Cancel',
        confirm: () => this.deletePlanet(),
      }
    };
    const dialogConfig: MatDialogConfig = {
      maxWidth: '40rem',
      width: '100%',
      id: 'confirmation-dialog'
    };
    this.modalService.openModal(ConfirmationModalComponent, config, dialogConfig)
  }

  deletePlanet() {
    this.loaderService.show();
    this.planetService.deletePlanet(this.planetId)
      .subscribe(() => {
        this.router.navigate(['']);
        this.loaderService.hide();
      });
    
  }

}
