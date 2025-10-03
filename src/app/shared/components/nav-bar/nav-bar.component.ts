import { Component, isDevMode, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    if (isDevMode()) {
      console.log('NavBarComponent cargado en modo desarrollo');
    } else {
      console.log('NavBarComponent cargado en modo producción');
    }
  }
}
