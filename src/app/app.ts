import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Footer } from './compartidos/footer/footer';
import { Nav } from './compartidos/nav/nav';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Footer, Nav],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  
}
