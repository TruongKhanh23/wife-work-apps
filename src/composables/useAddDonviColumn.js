import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx-js-style'
import JSZip from 'jszip'

// 👉 toàn bộ constants + helper functions + logic handleFileUpload, downloadTemplate, downloadConversionTool
export default function useAddDonviColumn({ fileName, isLoading }) {
  return {
    handleFileUpload,
  }
}
