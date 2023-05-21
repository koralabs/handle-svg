import { IHandleSvgOptions } from '@koralabs/handles-public-api-interfaces';

export interface IHandleSvg {
    handle: string;
    size: number;
    options: IHandleSvgOptions;
    disableDollarSymbol?: boolean;
}
