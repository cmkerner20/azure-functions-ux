import {Component, Input, Inject, ElementRef} from 'angular2/core';
import {UtilitiesService} from '../services/utilities.service';

@Component({
    selector: 'copy-pre',
    templateUrl: 'templates/copy-pre.component.html',
    styleUrls: ['styles/copy-pre.style.css']
})
export class CopyPreComponent {
    @Input() selectOnClick: boolean = true;
    @Input() content: string;

    constructor(
        @Inject(ElementRef) private elementRef: ElementRef,
        private _utilities: UtilitiesService) { }

    highlightText(event: Event) {
        if (this.selectOnClick) {
            this._utilities.highlightText(<Element>event.target);
        }
    }

    copyToClipboard() {
        this._utilities.copyContentToClipboard(this.elementRef.nativeElement.querySelector('pre'));
    }
}