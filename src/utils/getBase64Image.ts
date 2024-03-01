export const getBase64Image = async (imageUrl: string): Promise<{ contentType: string; base64: string }> => {
    try {
        const response = await fetch(imageUrl);
        const contentType = response.headers.get('Content-Type') || '';
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        return { contentType, base64 };
    } catch (error) {
        throw new Error(`There was an error fetching the image: ${error}`);
    }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            const base64String = reader.result as string;
            const base64 = base64String.split(',')[1];
            resolve(base64);
        };
        reader.readAsDataURL(blob);
    });
};

export function loadImage(url: string) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error(`Image failed to load from ${url}`));
        img.src = url;
    });
}
