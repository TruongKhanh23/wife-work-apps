import { ref } from 'vue'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const files = ref([])

export function useRecentFiles() {
  function addFile({ name, blob, category = 'Excel' }) {
    const sizeMB = (blob.size / 1024 / 1024).toFixed(2)

    files.value.unshift({
      id: Date.now() + Math.random(),
      name,
      blob,
      size: `${sizeMB} MB`,
      category,
      date: new Date().toLocaleString(),
    })
  }

  function removeFile(id) {
    files.value = files.value.filter((f) => f.id !== id)
  }

  function downloadFile(file) {
    saveAs(file.blob, file.name)
  }

  async function downloadAll() {
    if (!files.value.length) return

    const zip = new JSZip()

    files.value.forEach((f) => {
      zip.file(f.name, f.blob)
    })

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'grab_exports.zip')
  }

  return {
    files,
    addFile,
    removeFile,
    downloadFile,
    downloadAll,
  }
}
