export const getMaxOffset = (zoom: number) => {
    const circleSize = 576
    const maxOffset: number = ((zoom || 100) / 100 - 1) * circleSize

    return (maxOffset / 2)
}

