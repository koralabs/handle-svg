export interface IHandleSvgOptions {
    fontShadowColor: string;
    fontShadowColorEnabled: boolean;
    textRibbonColors: string[];
    textRibbonColorsEnabled: boolean;
    textRibbonGradient: string;
    textRibbonGradientEnabled: boolean;
    fontColor: string;
    fontColorEnabled: boolean;
    fontUrl: string;
    pfpImageUrl: string;
    pfpImageUrlEnabled: boolean;
    pfpBorderColor: string;
    pfpBorderColorEnabled: boolean;
    backgroundImageUrl: string;
    backgroundImageUrlEnabled: boolean;
    backgroundBorderColor: string;
    backgroundBorderColorEnabled: boolean;
    backgroundColor: string;
    backgroundColorEnabled: boolean;
    qrEnabled: boolean;
    qrBgColor: string;
    qrBgColorEnabled: boolean;
    qrEyeColor: string;
    qrEyeColorEnabled: boolean;
    qrDotColor: string;
    qrDotColorEnabled: boolean;
    socials: {
        key: string;
        value: any;
    }[];
    socialsEnabled: boolean;
}
