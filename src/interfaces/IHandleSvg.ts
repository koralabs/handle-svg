import { IHandleSvgOptions } from './IHandleSvgOptions';

export interface IHandleSvg {
    handle: string;
    size: number;
    options: IHandleSvgOptions;
    disableDollarSymbol?: boolean;
}
