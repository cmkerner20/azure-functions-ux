import { PortalResources } from 'app/shared/models/portal-resources';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { Kinds } from '../../../shared/models/constants';

export class SharedPlanPriceSpec extends PriceSpec {
    skuCode = 'D1';
    legacySkuName = 'shared';
    topLevelFeatures = [
        this._ts.instant(PortalResources.pricing_sharedInfrastructure),
        this._ts.instant(PortalResources.pricing_memory).format(1),
        this._ts.instant(PortalResources.pricing_computeLimit).format(240)
    ];

    featureItems = [{
        iconUrl: 'image/custom-domains.svg',
        title: this._ts.instant(PortalResources.feature_customDomainsName),
        description: this._ts.instant(PortalResources.feature_customDomainsInfo)
    }];

    hardwareItems = [{
        iconUrl: 'image/app-service-plan.svg',
        title: this._ts.instant(PortalResources.cpu),
        description: this._ts.instant(PortalResources.pricing_sharedCpu)
    },
    {
        iconUrl: 'image/website-power.svg',
        title: this._ts.instant(PortalResources.memory),
        description: this._ts.instant(PortalResources.pricing_sharedMemory)
    },
    {
        iconUrl: 'image/storage.svg',
        title: this._ts.instant(PortalResources.storage),
        description: this._ts.instant(PortalResources.pricing_sharedDisk).format('1 GB')
    }];

    meterFriendlyName = 'Shared App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };

    cssClass = 'spec premium-spec';

    runInitialization(input: PriceSpecInput) {
        // data should only be populated for new plans
        if (input.specPickerInput.data) {
            if (input.specPickerInput.data.hostingEnvironmentName
                || input.specPickerInput.data.isLinux
                || input.specPickerInput.data.isXenon) {
                this.state = 'hidden';
            }
        } else if (input.plan) {
            if (input.plan.kind && input.plan.kind.toLowerCase().indexOf(Kinds.linux) > -1) {
                this.state = 'hidden';
            } else if (input.plan.properties.hostingEnvironmentProfile || input.plan.properties.isXenon) {
                this.state = 'hidden';
            }
        }

        return this.checkIfDreamspark(input.subscriptionId);
    }
}
