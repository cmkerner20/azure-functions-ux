import { BusyStateComponent } from './../../../busy-state/busy-state.component';
import { DynamicLoaderDirective } from './../../../shared/directives/dynamic-loader.directive';
import { Component, OnChanges, Input,  ViewChild,  SimpleChange } from '@angular/core';
import { Url } from '../../../shared/Utilities/url';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-settings-tab',
    template: `
    <div [hidden]="!active"
          [id]="'site-tab-content-' + id"
          [attr.aria-label]="title"
          role="tabpanel">
        <router-outlet></router-outlet>
    </div>`
})
export class AppSettingsTabComponent implements OnChanges {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;

    // initialized is important because it ensures that we don't load any content or child components until the
    // tab gets inputs for the first time.  Once initialized, it ensures that we also don't reinitialize
    // the content if someone navigates away and comes back.
    public initialized = false;

    @Input() title: string;

    @Input() id: string;

    @Input() active: boolean;

    @Input() closeable: boolean;

    @Input() iconUrl: string;

    @Input() lazyLoadRoute: string;

    @ViewChild(DynamicLoaderDirective) dynamicLoader: DynamicLoaderDirective;


    constructor( private _router: Router,
        public route: ActivatedRoute) { }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {

        if (this.lazyLoadRoute) {
                this._router.navigate([this.lazyLoadRoute], { relativeTo: this.route, queryParams: Url.getQueryStringObj() });
        }
    }

}
