const findUpTileIndex = (tileIndex: number, gridSize: number) => {
  return tileIndex < gridSize ? null : tileIndex - gridSize
}

const findLeftTileIndex = (tileIndex: number, gridSize: number) => {
  return tileIndex % gridSize ? tileIndex - 1 : null
}

const findRightTileIndex = (tileIndex: number, gridSize: number) => {
  return tileIndex % gridSize === gridSize - 1 ? null : tileIndex + 1
}

const findBottomTileIndex = (tileIndex: number, gridSize: number) => {
  return tileIndex / gridSize >= gridSize - 1 ? null : tileIndex + gridSize
}

export const isSameRow = (
  tileIndex: number,
  emptyIndex: number,
  gridSize: number,
) => {
  return Math.floor(tileIndex / gridSize) === Math.floor(emptyIndex / gridSize)
}

const isSameColumn = (
  tileIndex: number,
  emptyIndex: number,
  gridSize: number,
) => {
  return tileIndex % gridSize === emptyIndex % gridSize
}

export const isSameRowOrColumn = (
  tileIndex: number,
  emptyIndex: number,
  gridSize: number,
) => {
  return (
    isSameRow(tileIndex, emptyIndex, gridSize) ||
    isSameColumn(tileIndex, emptyIndex, gridSize)
  )
}

const getAvailableTiles = (tile: number, gridSize: number) => {
  return [
    findLeftTileIndex,
    findRightTileIndex,
    findUpTileIndex,
    findBottomTileIndex,
  ].flatMap((func) => {
    return func(tile, gridSize) || []
  })
}

const pickRandomItem = (options: number[]) => {
  const randomIndex = Math.floor(Math.random() * options.length)
  return options[randomIndex]
}

export const shuffleOrder = (
  initialOrder: number[],
  emptyIndex: number,
  gridSize: number,
  count: number = 40,
) => {
  const newOrder = initialOrder.slice()
  let currentEmptyTileNumber = emptyIndex
  let movedTileNumber: number

  for (let i = 0; i < count; i++) {
    const availableTiles = getAvailableTiles(currentEmptyTileNumber, gridSize)
    const filteredAvailableTiles = availableTiles.filter(
      (tile) => tile !== movedTileNumber,
    )
    movedTileNumber = pickRandomItem(filteredAvailableTiles)

    newOrder[currentEmptyTileNumber] = newOrder[movedTileNumber]
    newOrder[movedTileNumber] = 0

    currentEmptyTileNumber = movedTileNumber
  }

  return newOrder
}
