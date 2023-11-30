export const getMaxOffset = (zoom: number, borderExists: boolean = false) => {
    const maxOffset: number = ((zoom || 100) / 100 - 1) * (borderExists ? 576 : 636)

    return (maxOffset / 2)
}

