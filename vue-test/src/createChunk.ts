import SparkMD5 from 'spark-md5'
function createChunk(file: File, index: number, chunkSize: number) {
  return new Promise((resolve) => {
    const start = index * chunkSize
    const end = start + chunkSize
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()
    const blobChunk = file.slice(start, end)
    fileReader.onload = function (e) {
      spark.append(e.target!.result)
      resolve({
        start,
        end,
        index,
        hash: spark.end(),
        blobChunk
      })
    }
    fileReader.readAsArrayBuffer(blobChunk)
  })
}

export default createChunk
