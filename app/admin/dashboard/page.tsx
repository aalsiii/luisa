"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Image from "next/image"
import { CATEGORIES } from "@/lib/constants"
import { Trash2, Upload, Loader2, Image as ImageIcon, X, RefreshCw, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react"

interface SelectedFile {
  id: string
  file: File
  preview: string
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

interface CloudinaryItem {
  _id: string
  src: string
  category: string
  location: string
  createdAt: string
  width?: number
  height?: number
}

export default function AdminDashboard() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [category, setCategory] = useState<string>("Family")
  const [location, setLocation] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("upload")

  const [portfolioItems, setPortfolioItems] = useState<CloudinaryItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const [galleryFilter, setGalleryFilter] = useState("All")
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setIsLoadingItems(true)
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" })
      const data = await res.json()
      if (data.success) {
        setPortfolioItems(data.data)
      } else {
        toast.error(data.error || "Failed to load photos from Cloudinary")
      }
    } catch (error) {
      toast.error("Failed to connect to Cloudinary gallery")
    } finally {
      setIsLoadingItems(false)
    }
  }

  const handleFilesAdded = (files: FileList | File[]) => {
    const newFiles: SelectedFile[] = []
    const fileArray = Array.from(files)

    for (const f of fileArray) {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image file.`)
        continue
      }
      newFiles.push({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        preview: URL.createObjectURL(f),
        status: "pending"
      })
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files)
    }
  }

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target) {
        URL.revokeObjectURL(target.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  const clearAllSelected = () => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview))
    setSelectedFiles([])
  }

  const handleUploadBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    let successCount = 0
    let failedCount = 0

    const total = selectedFiles.length

    for (let i = 0; i < total; i++) {
      setCurrentUploadIndex(i + 1)
      const current = selectedFiles[i]

      // Update file status
      setSelectedFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" } : f))
      )

      try {
        const sessionLocation = location.trim() || "Studio Session"
        const paramsToSign = {
          folder: "luisa_portfolio",
          tags: category,
          context: `category=${category}|location=${sessionLocation}`
        }

        // 1. Get Signature from Server
        const signRes = await fetch("/api/sign-cloudinary-params", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paramsToSign }),
        })

        if (!signRes.ok) {
          throw new Error("Failed to get signature from server")
        }

        const signData = await signRes.json()
        const { signature, apiKey, cloudName, timestamp } = signData

        // 2. Upload directly to Cloudinary
        const formData = new FormData()
        formData.append("file", current.file)
        formData.append("api_key", apiKey)
        formData.append("timestamp", timestamp.toString())
        formData.append("signature", signature)
        formData.append("folder", "luisa_portfolio")
        formData.append("tags", category)
        formData.append("context", `category=${category}|location=${sessionLocation}`)

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        )

        const uploadData = await uploadRes.json()

        if (!uploadRes.ok) {
          throw new Error(uploadData.error?.message || "Cloudinary upload failed")
        }

        successCount++
        setSelectedFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: "success" } : f))
        )
      } catch (err: any) {
        console.error("Upload error on file:", current.file.name, err)
        failedCount++
        setSelectedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", error: err.message } : f
          )
        )
      }

      setUploadProgress(Math.round(((i + 1) / total) * 100))
    }

    setIsUploading(false)

    if (failedCount === 0) {
      toast.success(`Successfully uploaded ${successCount} photos to Cloudinary!`)
      clearAllSelected()
      fetchItems()
      setActiveTab("manage")
    } else {
      toast.warning(`Uploaded ${successCount} photos. ${failedCount} photos failed.`)
      fetchItems()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this photo from Cloudinary?")) return

    try {
      const res = await fetch(`/api/portfolio?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Photo deleted from Cloudinary")
        setPortfolioItems((prev) => prev.filter((item) => item._id !== id))
      } else {
        toast.error(data.error || "Failed to delete from Cloudinary")
      }
    } catch (error) {
      toast.error("Error communicating with Cloudinary")
    }
  }

  const filteredItems = galleryFilter === "All"
    ? portfolioItems
    : portfolioItems.filter((i) => i.category === galleryFilter)

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage and upload your photography portfolio directly to Cloudinary.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Site
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="upload" className="text-sm">
            Upload Photos {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </TabsTrigger>
          <TabsTrigger value="manage" className="text-sm">
            Manage Gallery ({portfolioItems.length})
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Upload Photos to Cloudinary</CardTitle>
              <CardDescription>
                Select single or multiple photos to upload into your portfolio categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadBatch} className="space-y-6">
                {/* Drag and drop dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-200 hover:border-stone-400 bg-stone-50/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">
                        Click to select or drag and drop photos here
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        Upload single or multiple images (JPG, PNG, WEBP). Directly synced to Cloudinary.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Files Preview Grid */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-stone-700">
                        Selected Photos ({selectedFiles.length})
                      </p>
                      {!isUploading && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearAllSelected}
                          className="text-stone-500 text-xs hover:text-red-600"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-72 overflow-y-auto p-2 border rounded-lg bg-stone-50/30">
                      {selectedFiles.map((item) => (
                        <div
                          key={item.id}
                          className="relative aspect-square rounded-lg overflow-hidden border bg-white group"
                        >
                          <Image
                            src={item.preview}
                            alt="preview"
                            fill
                            className="object-cover"
                          />
                          {!isUploading && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFile(item.id)
                              }}
                              className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full opacity-90 group-hover:opacity-100 transition"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                          {item.status === "uploading" && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="h-5 w-5 animate-spin text-white" />
                            </div>
                          )}
                          {item.status === "success" && (
                            <div className="absolute inset-0 bg-emerald-600/70 flex items-center justify-center">
                              <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Batch Category & Location metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory} disabled={isUploading}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location / Caption</Label>
                    <Input
                      id="location"
                      placeholder="e.g. Studio Session, Rishikesh, Sunset"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>
                </div>

                {/* Progress bar during active upload */}
                {isUploading && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs text-stone-600">
                      <span>Uploading to Cloudinary... ({currentUploadIndex} of {selectedFiles.length})</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Upload Action Button */}
                <Button
                  type="submit"
                  disabled={isUploading || selectedFiles.length === 0}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white py-6"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading {currentUploadIndex} of {selectedFiles.length}...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Photos` : "Photos"} to Cloudinary
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Gallery Tab */}
        <TabsContent value="manage">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl">Cloudinary Gallery</CardTitle>
                <CardDescription>
                  View and manage all active photos stored in your Cloudinary portfolio.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchItems}
                disabled={isLoadingItems}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingItems ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Filter pills */}
              <div className="flex flex-wrap gap-2 pb-2 border-b">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant={galleryFilter === cat ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setGalleryFilter(cat)}
                  >
                    {cat}
                    {cat === "All" && ` (${portfolioItems.length})`}
                    {cat !== "All" &&
                      ` (${portfolioItems.filter((i) => i.category === cat).length})`}
                  </Button>
                ))}
              </div>

              {/* Gallery List */}
              {isLoadingItems ? (
                <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">Fetching photos from Cloudinary...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16 border rounded-xl border-dashed">
                  <ImageIcon className="mx-auto h-10 w-10 text-stone-300 mb-3" />
                  <p className="text-stone-600 font-medium">No photos found in this category.</p>
                  <p className="text-stone-400 text-xs mt-1">
                    Upload photos via the "Upload Photos" tab to add them to your portfolio.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item._id}
                      className="group relative aspect-square rounded-xl overflow-hidden border bg-stone-100 shadow-xs"
                    >
                      <Image
                        src={item.src}
                        alt={item.category}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-stone-900/80 backdrop-blur-sm text-[10px] text-white">
                          {item.category}
                        </Badge>
                      </div>

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 z-20">
                        <div className="flex justify-end gap-2">
                          <a
                            href={item.src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/40 transition"
                            title="View Full Image"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition"
                            title="Delete from Cloudinary"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-white text-xs">
                          <p className="font-semibold truncate">{item.location}</p>
                          <p className="text-[10px] text-stone-300">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
