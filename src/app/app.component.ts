import { Component, OnInit } from '@angular/core';
import * as microstates from '../microstates/microstates';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  isOpen = new microstates.default(false);

  ngOnInit() {
    console.log(this.isOpen);
  }
}
