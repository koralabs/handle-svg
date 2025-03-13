import { IHandleSvgOptions } from '@koralabs/kora-labs-common';

export interface IHandleSvg {
    handle: string;
    size: number;
    options: IHandleSvgOptions;
    disableDollarSymbol?: boolean;
    isLight?: boolean;
}
