import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-read-from-zip-dashboard',
  templateUrl: './read-from-zip-dashboard.component.html',
  styleUrls: ['./read-from-zip-dashboard.component.scss']
})
export class ReadFromZipDashboardComponent implements OnInit {

  @Input() resourceId: string;
  public content = `
  function save() {
    console.log('save');
  }
  `;
  public fileName = 'Hello.js';
  constructor() { }

  ngOnInit() {
  }

  disconnect() {

  }

}
