import {Component, Input} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {FunctionInfo} from '../shared/models/function-info';
import {FunctionConfig} from '../shared/models/function-config';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {SelectOption} from '../shared/models/select-option';
import {PortalService} from '../shared/services/portal.service';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';
import {FunctionApp} from '../shared/function-app';
import {TreeViewInfo} from '../tree-view/models/tree-view-info';
import {FunctionManageNode} from '../tree-view/function-node';

@Component({
    selector: 'function-manage',
    templateUrl: './function-manage.component.html',
    styleUrls: ['./function-manage.component.css'],
    inputs: ['viewInfoInput']
})
export class FunctionManageComponent {
    public functionStatusOptions: SelectOption<boolean>[];
    public disabled: boolean;
    public functionInfo : FunctionInfo;
    public functionApp : FunctionApp;
    private _viewInfoStream : Subject<TreeViewInfo>;
    private _functionNode : FunctionManageNode;

    constructor(private _broadcastService: BroadcastService,
                private _portalService: PortalService,
                private _globalStateService: GlobalStateService,
                private _translateService: TranslateService) {

        this._viewInfoStream = new Subject<TreeViewInfo>();
        this._viewInfoStream
            .distinctUntilChanged()
            .switchMap(viewInfo =>{
                this._functionNode = <FunctionManageNode>viewInfo.node;
                this.functionInfo = this._functionNode.functionInfo;
                this.functionApp = this.functionInfo.functionApp;
                return this.functionApp.checkIfDisabled();
            })
            .subscribe(disabled =>{
                this.disabled = disabled;
            });

        this.functionStatusOptions = [
            {
                displayLabel: this._translateService.instant(PortalResources.enabled),
                value: false
            }, {
                displayLabel: this._translateService.instant(PortalResources.disabled),
                value: true
            }];
    }

    set viewInfoInput(viewInfo : TreeViewInfo){
        this._viewInfoStream.next(viewInfo);
    }

    deleteFunction() {
        var result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: this.functionInfo.name }));
        if (result) {
            this._globalStateService.setBusyState();
            this._portalService.logAction("edit-component", "delete");
            this.functionApp.deleteFunction(this.functionInfo)
                .subscribe(r => {
                    this._functionNode.remove();
                    // this._broadcastService.broadcast(BroadcastEvent.FunctionDeleted, this.functionInfo);
                    this._globalStateService.clearBusyState();
                });
        }
    }
}