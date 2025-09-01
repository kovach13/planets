import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { PlanetModifyComponent } from '../planet-modify/planet-modify.component';
import { PlanetService } from '../../services/planet.service';
import { Router } from '@angular/router';
import { IPlanet, ViewMode } from '../../models/planet.model';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../services/modal.service';
import { LoaderService } from '../../services/loader.service';


@Component({
    selector: 'app-planet-list',
    standalone: true,
    imports: [
        MatButtonToggleModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        CommonModule,
        MatTableModule,
        MatSort,
        MatSortModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './planet-list.component.html',
    styleUrl: './planet-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetListComponent implements OnInit {
  isGridView: WritableSignal<boolean | null> = signal(true);
  planets!: IPlanet[];
  filteredPlanets = signal<IPlanet[]>([]);
  breakpointObserver = inject(BreakpointObserver);
  dialog = inject(MatDialog);
  bottomSheet = inject(MatBottomSheet);
  planetService = inject(PlanetService);
  modalService = inject(ModalService);
  loaderService = inject(LoaderService);
  router = inject(Router);
  dataSource = new MatTableDataSource<IPlanet>([]);
  filterControl = new FormControl('');
  private destroyRef = inject(DestroyRef)
  VIEW_MODE = ViewMode;
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (sort) {
      this.dataSource.sort = sort;
      this.setSortParameters();
    }
  }

  ngOnInit(): void {
    this.getPlanets();
  }

  getPlanets(): void {
    this.loaderService.show();
    this.planetService.getPlanets()
      .subscribe(planets => {
        this.planets = planets;
        this.dataSource.data = planets;
        this.setPlanets();
        this.addFiltering();
        this.loaderService.hide();
      });
  }

  setSortParameters(): void {
    this.dataSource.sortingDataAccessor = (planet: IPlanet, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'planetName': return planet.planetName?.toLowerCase() || '';
        case 'planetColor': return planet.planetColor?.toLowerCase() || '';
        case 'planetRadiusKM': return planet.planetRadiusKM || 0;
        case 'distFromSun': return planet.distInMillionsKM?.fromSun || 0;
        case 'distFromEarth': return planet.distInMillionsKM?.fromEarth || 0;
        default: return '';
      }
    };
  }

  addFiltering(): void {
    this.filterControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef) 
      )
      .subscribe(value => {
        this.dataSource.filter = value?.trim().toLowerCase() || '';
        this.setPlanets(value || '');
      });
  }

  //filter planets if string is passed, otherwise set all planets
  setPlanets(filterValue?: string): void {
    const filteredPlanets = filterValue ?
      this.planets.filter(planet => this.matchesSearch(planet, filterValue)) : this.planets;
      this.filteredPlanets.set(filteredPlanets);
  }

  changeView(value: string): void {
    this.isGridView.set(value === this.VIEW_MODE.GRID);
  }

  addPlanet(): void {
    //shared config
    const config: MatDialogConfig | MatBottomSheetConfig = {
      panelClass: 'planet-modal',
      data: {
        confirm: () => this.getPlanets()
      }
    };

    //dialog specific config
    const dialogConfig: MatDialogConfig = {
      maxWidth: '59.2rem',
      width: '100%',
      id: 'planet-dialog',
      backdropClass: 'backdrop-overlay'
    }
    this.modalService.openModal(PlanetModifyComponent, config, dialogConfig);
  }

  openDetails({id}: any): void {
    this.router.navigate(['/planet-details', id]); 
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  } 

  // filtering function for planet or nested objects inside by string value
  matchesSearch(obj: any, term: string): boolean {
    term = term.toLowerCase();

    for (const key in obj) {
      const value = obj[key];

      if (value && typeof value === 'object') {
        if (this.matchesSearch(value, term)) return true;
      } else if (String(value).toLowerCase().includes(term)) {
        return true;
      }
    }

    return false;
  }
}
