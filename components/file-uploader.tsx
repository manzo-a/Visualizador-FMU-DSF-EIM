"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0])
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      "application/octet-stream": [".fmu"],
      "application/zip": [".fmu"],
    },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
      )}
    >
      <input {...getInputProps()} />

      {acceptedFiles.length > 0 ? (
        <div className="space-y-2">
          <FileText className="h-8 w-8 mx-auto text-primary" />
          <p className="text-sm font-medium">{acceptedFiles[0].name}</p>
          <p className="text-xs text-muted-foreground">{(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm">Suelta el archivo aquí...</p>
          ) : (
            <div>
              <p className="text-sm font-medium">Arrastra un archivo FMU aquí</p>
              <p className="text-xs text-muted-foreground">o haz click para seleccionar</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
