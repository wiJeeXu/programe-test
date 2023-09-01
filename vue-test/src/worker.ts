import createChunk from './createChunk'
onmessage = async (e) => {
  const promiseList = []
  const { file, chunkSize, startIndex, endIndex } = e.data
  for (let i = startIndex; i < endIndex; i++) {
    promiseList.push(createChunk(file, i, chunkSize))
  }
  const result = await Promise.all(promiseList)
  postMessage(result)
}
