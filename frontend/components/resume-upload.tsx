"use client"

import { useState, useCallback } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ResumeUploadProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClear: () => void
  disabled?: boolean
}

export function ResumeUpload({ onFileSelect, selectedFile, onClear, disabled }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf') {
        onFileSelect(file)
      } else {
        alert('Please upload a PDF file')
      }
    }
  }, [onFileSelect])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf') {
        onFileSelect(file)
      } else {
        alert('Please upload a PDF file')
      }
    }
  }, [onFileSelect])

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-6">
        {!selectedFile ? (
          <div
            className={`
              flex flex-col items-center justify-center p-8 rounded-lg
              transition-colors cursor-pointer
              ${dragActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && document.getElementById('resume-upload')?.click()}
          >
            <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">Upload Resume</p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Drag and drop your PDF resume here, or click to browse
            </p>
            <Button variant="secondary" disabled={disabled}>
              Select PDF File
            </Button>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf"
              onChange={handleChange}
              className="hidden"
              disabled={disabled}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
