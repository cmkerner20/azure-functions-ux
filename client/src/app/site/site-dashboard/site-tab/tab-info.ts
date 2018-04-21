import { Type } from '@angular/core';

export interface TabInfo {
    title: string;
    id: string;
    active: boolean;
    closeable: boolean;
    iconUrl: string | null;
    dirty: boolean;
    lazyloadRoute?: string;
    // If specified, the tab will load this component as its content
    componentFactory?: Type<any>;
    componentInput?: { [key: string]: any };
}
