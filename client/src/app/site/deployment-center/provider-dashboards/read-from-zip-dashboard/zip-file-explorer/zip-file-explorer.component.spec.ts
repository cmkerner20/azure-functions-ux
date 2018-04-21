import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZipFileExplorerComponent } from './zip-file-explorer.component';

describe('ZipFileExplorerComponent', () => {
  let component: ZipFileExplorerComponent;
  let fixture: ComponentFixture<ZipFileExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZipFileExplorerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZipFileExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
