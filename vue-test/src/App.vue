<template>
  <input type="file" @change="fileChange" />
</template>
<script lang="ts" setup>
import axios from 'axios'
const chunkSize = 2 * 1024 * 1024
const THREAD_SIZE = navigator.hardwareConcurrency || 4
console.log(THREAD_SIZE)
let fext = ''
let fname = ''
let results: any = []
let finishCount = 0
let fileName = ''
async function fileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) {
    const file = files[0]
    fname = file.name.split('.')[0]
    fext = file.name.split('.')[1]
    fileName = file.name
    const size = file.size
    const maxChunkCount = Math.ceil(size / chunkSize)
    const startTime = Date.now()

    console.log(startTime)
    const workChunkCount = Math.ceil(maxChunkCount / THREAD_SIZE)
    for (let i = 0; i < THREAD_SIZE; i++) {
      const startIndex = workChunkCount * i
      const endIndex = Math.min(startIndex + workChunkCount, chunkSize)
      const worker = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module'
      })
      worker.postMessage({
        file,
        startIndex,
        endIndex,
        chunkSize
      })
      worker.onmessage = async (e) => {
        for (let i = startIndex; i < endIndex; i++) {
          results[i] = e.data[i - startIndex]
        }
        worker.terminate()
        finishCount++
        if (finishCount === THREAD_SIZE) {
          await Promise.all(
            results.map(
              (item: {
                start: number
                end: number
                index: number
                hash: string
                blobChunk: Blob
              }) => post(item)
            )
          )
          console.log(Date.now() - startTime)
          console.log('上传完成')
          axios.post('http://localhost:3000/merge', {
            name: fileName,
            chunkNameList: results.map((result: { hash: string }) => result.hash)
          })
        }
      }
    }
  }
}
function post({ hash, blobChunk }: { hash: string; blobChunk: Blob }) {
  const blobFile = new File([blobChunk], `${fname}.${hash}.${fext}`)
  const formData = new FormData()
  formData.append('file', blobFile)
  return axios.post('http://localhost:3000/upload', formData)
}
</script>
<style scoped></style>
