import { WebsiteId } from './models/portal';

export enum ResourceType {
    none,
    site,
    serverFarm,
    hostingEnvironment,
    slot,
    function,
    proxy
}

export abstract class Descriptor {
    public parts: string[];

    constructor(public resourceId: string) {
        this.parts = resourceId.split('/').filter(part => !!part);
    }

    abstract getTrimmedResourceId(): string;
}

export class ArmSubcriptionDescriptor extends Descriptor {
    public subscriptionId: string;

    constructor(resourceId: string) {
        super(resourceId);

        this.subscriptionId = this.parts[1];
    }

    getTrimmedResourceId() {
        return `/subscriptions/${this.subscriptionId}`;
    }
}

export class ArmResourceDescriptor extends Descriptor {
    public subscription: string;
    public resourceGroup: string;
    public resourceName: string;

    constructor(resourceId: string) {
        super(resourceId);

        if (this.parts.length < 4) {
            throw Error(`resourceId length is too short: ${resourceId}`);
        }

        if (this.parts[0].toLowerCase() !== 'subscriptions') {
            throw Error(`Expected subscriptions segment in resourceId: ${resourceId}`);
        }

        if (this.parts[2].toLowerCase() !== 'resourcegroups') {
            throw Error(`Expected resourceGroups segment in resourceId: ${resourceId}`);
        }

        this.subscription = this.parts[1];
        this.resourceGroup = this.parts[3];
        this.resourceName = this.parts[this.parts.length - 1];
    }

    getTrimmedResourceId() {
        return this.resourceId;
    }
}

export class CdsEntityDescriptor extends Descriptor {
    public environment: string;
    public scope: string;

    constructor(resourceId: string) {
        super(resourceId);

        if (this.parts.length < 6) {
            throw Error(`resourceId length is too short for CDS: ${resourceId}`);
        }

        this.environment = this.parts[3];
        this.scope = this.parts[5];
    }

    getTrimmedResourceId() {
        return `/providers/Microsoft.Blueridge/environments/${this.environment}/scopes/${this.scope}`;
    }
}

export class CdsFunctionDescriptor extends CdsEntityDescriptor implements FunctionDescriptor {
    name: string;

    constructor(resourceId) {
        super(resourceId);

        if (this.parts.length < 10) {
            throw Error(`resourceId length is too short for function descriptor: ${resourceId}`);
        }

        this.name = this.parts[9];
    }

    getTrimmedResourceId() {
        return `${super.getTrimmedResourceId()}/functions/${this.name}`;
    }
}

export class ArmSiteDescriptor extends ArmResourceDescriptor {
    public site: string;
    public slot: string;

    private _websiteId: WebsiteId;

    public static getSiteDescriptor(resourceId: string): ArmSiteDescriptor | CdsEntityDescriptor {
        const parts = resourceId.split('/').filter(part => !!part);
        let siteId = '';
        let maxIndex: number;

        if (parts.length >= 10 && parts[8].toLowerCase() === 'slots') {
            maxIndex = 9;
        } else if (parts.length >= 8 && parts[6].toLowerCase() === 'sites') {
            maxIndex = 7;
        } else if (parts.length >= 6 && parts[4].toLowerCase() === 'scopes') {
            return new CdsEntityDescriptor(resourceId);
        } else {
            throw Error(`Not enough segments in site or slot or scope id`);
        }

        for (let i = 0; i <= maxIndex; i++) {
            siteId = siteId + '/' + parts[i];
        }

        return new ArmSiteDescriptor(siteId);
    }

    constructor(resourceId: string) {
        super(resourceId);

        if (this.parts.length < 8) {
            throw Error(`resourceId length is too short for site descriptor: ${resourceId}`);
        }

        if (this.parts[6].toLowerCase() !== 'sites') {
            throw Error(`Expected sites segment in resourceId: ${resourceId}`);
        }

        this.site = this.parts[7];

        if (this.parts.length > 8 && this.parts[8].toLowerCase() === 'slots') {
            this.slot = this.parts[9];
        }
    }

    getSiteOnlyResourceId(): string {
        return `/subscriptions/${this.subscription}/resourceGroups/${this.resourceGroup}/providers/Microsoft.Web/sites/${this.site}`;
    }

    getTrimmedResourceId(): string {
        // resource id without slot information
        let resource = this.getSiteOnlyResourceId();
        // add slots if available
        if (this.slot && this.slot !== 'new') {
            resource = `${resource}/slots/${this.slot}`;
        }
        return resource;
    }

    getWebsiteId(): WebsiteId {
        if (!this._websiteId) {
            const name = !this.slot ? this.site : `${this.site}(${this.slot})`;
            this._websiteId = {
                Name: name,
                SubscriptionId: this.subscription,
                ResourceGroup: this.resourceGroup
            };
        }

        return this._websiteId;
    }
}


export class ArmPlanDescriptor extends ArmResourceDescriptor {
    public name: string;

    public static getSiteDescriptor(resourceId: string): ArmPlanDescriptor | CdsEntityDescriptor {
        const parts = resourceId.split('/').filter(part => !!part);
        let planId = '';
        let maxIndex: number;

        if (parts.length >= 8 && parts[6].toLowerCase() === 'serverfarms') {
            maxIndex = 7;
        } else {
            throw Error(`Not enough segments in server farm`);
        }

        for (let i = 0; i <= maxIndex; i++) {
            planId = planId + '/' + parts[i];
        }

        return new ArmPlanDescriptor(planId);
    }

    constructor(resourceId: string) {
        super(resourceId);

        if (this.parts.length < 8) {
            throw Error(`resourceId length is too short for serverfarm descriptor: ${resourceId}`);
        }

        if (this.parts[6].toLowerCase() !== 'serverfarms') {
            throw Error(`Expected serverfarms segment in resourceId: ${resourceId}`);
        }

        this.name = this.parts[7];
    }

    getTrimmedResourceId(): string {
        return `/subscriptions/${this.subscription}/resourceGroups/${this.resourceGroup}/providers/Microsoft.Web/serverfarms/${this.name}`;
    }
}


export interface FunctionDescriptor extends Descriptor {
    name: string;
}

export class ArmFunctionDescriptor extends ArmSiteDescriptor implements FunctionDescriptor {
    public name: string;
    private _isProxy: boolean;

    static getFunctionDescriptor(resourceId: string): FunctionDescriptor {
        const parts = resourceId.split('/').filter(part => !!part);

        if (parts.length >= 8 && parts[6].toLowerCase() === 'entities') {
            return new CdsFunctionDescriptor(resourceId);
        } else {
            return new ArmFunctionDescriptor(resourceId);
        }
    }

    constructor(resourceId: string) {
        super(resourceId);

        if (!this.slot) {
            if (this.parts.length < 10) {
                throw Error('Not a site function/proxy id');
            }

            if (this.parts[8].toLowerCase() !== 'functions' && this.parts[8].toLowerCase() !== 'proxies') {
                throw Error('Not a site function/proxy id');
            }

            if (this.parts[9].toLowerCase() === 'new' && this.parts.length > 10 && this.parts[10] === 'function') {
                throw Error('Not a site function/proxy id');
            }

            this._isProxy = this.parts[8].toLowerCase() === 'proxies';
            this.name = this.parts[9];
        } else {
            if (this.parts.length < 12) {
                throw Error('Not a slot function/proxy id');
            }

            if (this.parts[10].toLowerCase() !== 'functions' && this.parts[10].toLowerCase() !== 'proxies') {
                throw Error('Not a slot function/proxy id');
            }

            this._isProxy = this.parts[10].toLowerCase() === 'proxies';
            this.name = this.parts[11];
        }
    }

    getTrimmedResourceId() {
        return `${super.getTrimmedResourceId()}/${this._isProxy ? 'proxies' : 'functions'}/${this.name}`;
    }
}

export class ARMApplicationInsightsDescriptior extends ArmResourceDescriptor {
    public instanceName: string;

    constructor(resourceId: string) {
        super(resourceId);

        if (this.parts.length < 8) {
            throw Error(`resourceId length is too short for Application Insights: ${resourceId}`);
        }

        this.instanceName = this.parts[7];
    }

    getTrimmedResourceId() {
        return `/${this.parts.join('/')}`;
    }

    getResourceIdForDirectUrl() {
        // NOTE(michinoy): The aiResourceId is /subscriptions/<sub>/resourceGroups/<rg>/providers/microsoft.insights/components/<name>
        // to call the app insights instance directly we need /subscriptions/<sub>/resourceGroups/<rg>/components/<name>
        return `subscriptions/${this.subscription}/resourceGroups/${this.resourceGroup}/components/${this.instanceName}`;
    }
}