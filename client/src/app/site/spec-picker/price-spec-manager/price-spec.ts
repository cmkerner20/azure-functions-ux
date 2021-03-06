import { TranslateService } from '@ngx-translate/core';
import { BillingService } from './../../../shared/services/billing.service';
import { ServerFarm } from './../../../shared/models/server-farm';
import { SpecResourceSet } from './billing-models';
import { Observable } from 'rxjs/Rx';
import { PriceSpecDetail } from './price-spec-detail';
import { ArmObj } from '../../../shared/models/arm/arm-obj';
import { Injector } from '@angular/core';
import { SubscriptionQuotaIds, LogCategories } from '../../../shared/models/constants';
import { LogService } from '../../../shared/services/log.service';
import { PortalResources } from '../../../shared/models/portal-resources';
import { SpecPickerInput, NewPlanSpecPickerData } from './plan-price-spec-manager';

export interface PriceSpecInput {
    specPickerInput: SpecPickerInput<NewPlanSpecPickerData>;
    subscriptionId: string;
    plan?: ArmObj<ServerFarm>;
}

export abstract class PriceSpec {
    abstract skuCode: string;                // SKU code name, like S1 or P1v2

    // Used ONLY for returning legacy PCV3 SKU names to Ibiza create scenario's since it currently
    // relies on this format.  There's no reason why we couldn't remove it going forward but I've
    // decided not to touch it for now to be safe.
    abstract legacySkuName: string;

    abstract topLevelFeatures: string[];     // Features that show up in the card, like "1x cores", "1.75GB RAM", etc...
    abstract featureItems: PriceSpecDetail[];
    abstract hardwareItems: PriceSpecDetail[];
    abstract specResourceSet: SpecResourceSet;
    abstract meterFriendlyName: string;

    cssClass = 'spec';

    allowZeroCost = false;
    state: 'enabled' | 'disabled' | 'hidden' = 'enabled';
    disabledMessage: string;
    disabledInfoLink: string;
    priceString: string;

    protected _billingService: BillingService;
    protected _logService: LogService;
    protected _ts: TranslateService;

    constructor(injector: Injector) {
        this._billingService = injector.get(BillingService);
        this._logService = injector.get(LogService);
        this._ts = injector.get(TranslateService);
    }

    initialize(input: PriceSpecInput): Observable<void> {

        this._logService.debug(LogCategories.specPicker, `Call runInitialize for ${this.skuCode}`);
        return this.runInitialization(input)
            .do(r => {
                this._logService.debug(LogCategories.specPicker, `Completed runInitialize for ${this.skuCode}`);
            });
    }

    abstract runInitialization(input: PriceSpecInput): Observable<void>;

    protected checkIfDreamspark(subscriptionId: string) {
        if (this.state !== 'hidden') {

            return this._billingService.checkIfSubscriptionHasQuotaId(subscriptionId, SubscriptionQuotaIds.dreamSparkQuotaId)
                .do(isDreamspark => {

                    if (isDreamspark) {
                        this.state = 'disabled';
                        this.disabledMessage = this._ts.instant(PortalResources.pricing_subscriptionNotAllowed);
                        this.disabledInfoLink = `https://account.windowsazure.com/Subscriptions/Statement?subscriptionId=${subscriptionId}&isRdfeId=true&launchOption=upgrade`;
                    }
                });
        }

        return Observable.of(null);
    }
}

