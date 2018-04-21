import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-zip-file-explorer',
  templateUrl: './zip-file-explorer.component.html',
  styleUrls: ['./zip-file-explorer.component.scss']
})
export class ZipFileExplorerComponent implements OnInit {
  @Input() resourceId = '';
  public currentTitle = 'Hello';
  public folders = [];
  public files = [];
  public selectedFile = null;
  constructor() { }

  selectVfsObject(folder) {

  }
  headingClick() {

  }
  getFileTitle(file) {
    return 'file';
  }
  ngOnInit() {
  }

}
