export interface IHandleSvgOptions {
    handleTextShadowColor: string;
    handleTextShadowColorEnabled: boolean;
    handleTextBgColor: string;
    handleTextBgColorEnabled: boolean;
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
    qrColor: string;
    qrColorEnabled: boolean;
    socials: {
        key: string;
        value: any;
    }[];
    socialsEnabled: boolean;
}
