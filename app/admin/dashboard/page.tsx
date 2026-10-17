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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import Image from "next/image"
import { CATEGORIES } from "@/lib/constants"
import {
  Trash2,
  Upload,
  Loader2,
  Image as ImageIcon,
  X,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Pencil,
  GripVertical,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  Hash,
  ArrowUpDown
} from "lucide-react"

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
  const [savedOrder, setSavedOrder] = useState<string[]>([])
  const [hasUnsavedOrderChanges, setHasUnsavedOrderChanges] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const [galleryFilter, setGalleryFilter] = useState("All")
  const [reorderFilter, setReorderFilter] = useState("All")
  const [isDragging, setIsDragging] = useState(false)

  // Drag and drop states for reordering
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null)

  // Jump to position dialog
  const [jumpDialogItem, setJumpDialogItem] = useState<CloudinaryItem | null>(null)
  const [jumpTargetPosition, setJumpTargetPosition] = useState<string>("")

  // Edit existing item state
  const [editingItem, setEditingItem] = useState<CloudinaryItem | null>(null)
  const [editCategory, setEditCategory] = useState<string>("Family")
  const [editLocation, setEditLocation] = useState<string>("")
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false)

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
        const orderIds = data.data.map((item: CloudinaryItem) => item._id)
        setSavedOrder(orderIds)
        setHasUnsavedOrderChanges(false)
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
        status: "pending",
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
          context: `category=${category}|location=${sessionLocation}`,
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
        setSavedOrder((prev) => prev.filter((orderId) => orderId !== id))
      } else {
        toast.error(data.error || "Failed to delete from Cloudinary")
      }
    } catch (error) {
      toast.error("Error communicating with Cloudinary")
    }
  }

  const handleOpenEdit = (item: CloudinaryItem) => {
    setEditingItem(item)
    setEditCategory(item.category || "Family")
    setEditLocation(item.location || "")
  }

  const handleSaveEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editingItem) return

    setIsSavingEdit(true)
    const targetLocation = editLocation.trim() || "Studio Session"

    try {
      const res = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem._id,
          category: editCategory,
          location: targetLocation,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Photo details updated successfully")
        setPortfolioItems((prev) =>
          prev.map((item) =>
            item._id === editingItem._id
              ? { ...item, category: editCategory, location: targetLocation }
              : item
          )
        )
        setEditingItem(null)
      } else {
        toast.error(data.error || "Failed to update photo details")
      }
    } catch (error) {
      toast.error("Failed to connect to server")
    } finally {
      setIsSavingEdit(false)
    }
  }

  // ==========================================
  // REORDERING LOGIC
  // ==========================================

  const moveItemInMasterList = (
    items: CloudinaryItem[],
    sourceId: string,
    targetId: string,
    position: "before" | "after" = "before"
  ): CloudinaryItem[] => {
    const sourceIndex = items.findIndex((i) => i._id === sourceId)
    if (sourceIndex === -1) return items

    const next = [...items]
    const [removed] = next.splice(sourceIndex, 1)

    const targetIndex = next.findIndex((i) => i._id === targetId)
    if (targetIndex === -1) {
      next.push(removed)
      return next
    }

    const insertIndex = position === "after" ? targetIndex + 1 : targetIndex
    next.splice(insertIndex, 0, removed)
    return next
  }

  const handleCardDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id)
    e.dataTransfer.effectAllowed = "move"
    setDraggedItemId(id)
  }

  const handleCardDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverItemId !== id) {
      setDragOverItemId(id)
    }
  }

  const handleCardDragLeave = (e: React.DragEvent, id: string) => {
    if (dragOverItemId === id) {
      setDragOverItemId(null)
    }
  }

  const handleCardDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const sourceId = draggedItemId || e.dataTransfer.getData("text/plain")

    setDraggedItemId(null)
    setDragOverItemId(null)

    if (!sourceId || sourceId === targetId) return

    setPortfolioItems((prev) => {
      const sourceIdx = prev.findIndex((i) => i._id === sourceId)
      const targetIdx = prev.findIndex((i) => i._id === targetId)
      if (sourceIdx === -1 || targetIdx === -1 || sourceIdx === targetIdx) return prev

      const next = [...prev]
      const [removed] = next.splice(sourceIdx, 1)
      const newTargetIndex = next.findIndex((i) => i._id === targetId)
      next.splice(newTargetIndex, 0, removed)
      setHasUnsavedOrderChanges(true)
      return next
    })
  }

  const handleCardDragEnd = () => {
    setDraggedItemId(null)
    setDragOverItemId(null)
  }

  const handleMoveItem = (
    id: string,
    direction: "first" | "prev" | "next" | "last"
  ) => {
    const visibleList =
      reorderFilter === "All"
        ? portfolioItems
        : portfolioItems.filter((i) => i.category === reorderFilter)

    const currentIndex = visibleList.findIndex((i) => i._id === id)
    if (currentIndex === -1) return

    if (direction === "first") {
      if (currentIndex === 0) return
      const targetId = visibleList[0]._id
      setPortfolioItems((prev) => {
        const updated = moveItemInMasterList(prev, id, targetId, "before")
        setHasUnsavedOrderChanges(true)
        return updated
      })
    } else if (direction === "prev") {
      if (currentIndex === 0) return
      const targetId = visibleList[currentIndex - 1]._id
      setPortfolioItems((prev) => {
        const updated = moveItemInMasterList(prev, id, targetId, "before")
        setHasUnsavedOrderChanges(true)
        return updated
      })
    } else if (direction === "next") {
      if (currentIndex === visibleList.length - 1) return
      const targetId = visibleList[currentIndex + 1]._id
      setPortfolioItems((prev) => {
        const updated = moveItemInMasterList(prev, id, targetId, "after")
        setHasUnsavedOrderChanges(true)
        return updated
      })
    } else if (direction === "last") {
      if (currentIndex === visibleList.length - 1) return
      const targetId = visibleList[visibleList.length - 1]._id
      setPortfolioItems((prev) => {
        const updated = moveItemInMasterList(prev, id, targetId, "after")
        setHasUnsavedOrderChanges(true)
        return updated
      })
    }
  }

  const handleOpenJumpDialog = (item: CloudinaryItem, currentVisibleIndex: number) => {
    setJumpDialogItem(item)
    setJumpTargetPosition((currentVisibleIndex + 1).toString())
  }

  const handleConfirmJump = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jumpDialogItem) return

    const visibleList =
      reorderFilter === "All"
        ? portfolioItems
        : portfolioItems.filter((i) => i.category === reorderFilter)

    const targetPos = parseInt(jumpTargetPosition, 10)
    if (isNaN(targetPos) || targetPos < 1 || targetPos > visibleList.length) {
      toast.error(`Please enter a valid position between 1 and ${visibleList.length}`)
      return
    }

    const currentIdx = visibleList.findIndex((i) => i._id === jumpDialogItem._id)
    const targetIdx = targetPos - 1
    if (currentIdx === targetIdx) {
      setJumpDialogItem(null)
      return
    }

    const targetItem = visibleList[targetIdx]
    const position = targetIdx < currentIdx ? "before" : "after"

    setPortfolioItems((prev) => {
      const updated = moveItemInMasterList(prev, jumpDialogItem._id, targetItem._id, position)
      setHasUnsavedOrderChanges(true)
      return updated
    })

    toast.success(`Moved photo to position #${targetPos}`)
    setJumpDialogItem(null)
  }

  const handleSaveOrder = async () => {
    setIsSavingOrder(true)
    const orderedIds = portfolioItems.map((i) => i._id)

    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSavedOrder(orderedIds)
        setHasUnsavedOrderChanges(false)
        toast.success("Portfolio order saved successfully! The live site has been updated.")
      } else {
        toast.error(data.error || "Failed to save portfolio order")
      }
    } catch (error) {
      toast.error("Failed to connect to server to save order")
    } finally {
      setIsSavingOrder(false)
    }
  }

  const handleResetOrder = () => {
    if (!hasUnsavedOrderChanges) return
    if (!confirm("Discard unsaved reorder changes and restore the last saved order?")) return

    if (savedOrder.length === 0) {
      fetchItems()
      return
    }

    const orderMap = new Map<string, number>()
    savedOrder.forEach((id, index) => orderMap.set(id, index))

    const reset = [...portfolioItems].sort((a, b) => {
      const idxA = orderMap.has(a._id) ? orderMap.get(a._id)! : 999999
      const idxB = orderMap.has(b._id) ? orderMap.get(b._id)! : 999999
      return idxA - idxB
    })

    setPortfolioItems(reset)
    setHasUnsavedOrderChanges(false)
    toast.info("Reverted back to last saved order.")
  }

  const handleSortPreset = (type: "newest" | "oldest") => {
    const sorted = [...portfolioItems].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return type === "newest" ? timeB - timeA : timeA - timeB
    })

    setPortfolioItems(sorted)
    setHasUnsavedOrderChanges(true)
    toast.info(`Sorted all photos by ${type === "newest" ? "newest first" : "oldest first"}. Click 'Save Order' to apply.`)
  }

  const filteredItems = galleryFilter === "All"
    ? portfolioItems
    : portfolioItems.filter((i) => i.category === galleryFilter)

  const reorderVisibleItems = reorderFilter === "All"
    ? portfolioItems
    : portfolioItems.filter((i) => i.category === reorderFilter)

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage your photography portfolio, reorder pictures, and upload directly to Cloudinary.
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
        <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto">
          <TabsTrigger value="upload" className="text-sm">
            Upload Photos {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </TabsTrigger>
          <TabsTrigger value="manage" className="text-sm">
            Manage Gallery ({portfolioItems.length})
          </TabsTrigger>
          <TabsTrigger value="reorder" className="text-sm flex items-center gap-1.5">
            <ListOrdered className="h-4 w-4" />
            <span>Reorder Grid</span>
            {hasUnsavedOrderChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved changes" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* 1. Upload Tab */}
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
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging
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

        {/* 2. Manage Gallery Tab */}
        <TabsContent value="manage">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl">Cloudinary Gallery</CardTitle>
                <CardDescription>
                  View, edit details, or remove active photos stored in your Cloudinary portfolio.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("reorder")}
                  className="border-stone-300 hover:bg-stone-100"
                >
                  <ListOrdered className="mr-2 h-4 w-4 text-stone-600" />
                  Reorder Grid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchItems}
                  disabled={isLoadingItems}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingItems ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
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
                  {filteredItems.map((item, index) => {
                    const masterIndex = portfolioItems.findIndex((i) => i._id === item._id)
                    return (
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
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                          <span className="bg-stone-900/90 text-white text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-sm shadow-xs font-semibold">
                            #{masterIndex + 1}
                          </span>
                          <Badge className="bg-stone-900/80 backdrop-blur-sm text-[10px] text-white">
                            {item.category}
                          </Badge>
                        </div>

                        {/* Quick Edit Button (Mobile/Direct access) */}
                        <div className="absolute top-2 right-2 z-10 sm:hidden">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-md bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-sm transition shadow-xs"
                            title="Edit Photo"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Hover Overlay Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 z-20">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 rounded-lg bg-stone-900/90 text-white hover:bg-black transition shadow-xs"
                              title="Edit Category & Location"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
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
                              type="button"
                              onClick={() => handleDelete(item._id)}
                              className="p-2 rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition"
                              title="Delete from Cloudinary"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-white text-xs">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-semibold truncate">{item.location}</p>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="text-[11px] underline text-stone-200 hover:text-white shrink-0"
                              >
                                Edit
                              </button>
                            </div>
                            <p className="text-[10px] text-stone-300">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Reorder Portfolio Tab */}
        <TabsContent value="reorder">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Reorder Portfolio Pictures</CardTitle>
                  {hasUnsavedOrderChanges && (
                    <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 text-[11px]">
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-1">
                  Drag and drop pictures or use the arrow buttons to position items in your preferred order.
                  Changes immediately sync to the live portfolio when saved.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {hasUnsavedOrderChanges && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetOrder}
                    disabled={isSavingOrder}
                    className="text-stone-600 text-xs h-9"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Reset
                  </Button>
                )}

                <Button
                  onClick={handleSaveOrder}
                  disabled={isSavingOrder || !hasUnsavedOrderChanges}
                  size="sm"
                  className={`h-9 px-4 text-xs font-medium transition-all ${hasUnsavedOrderChanges
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/20"
                      : "bg-stone-900 hover:bg-stone-800 text-white"
                    }`}
                >
                  {isSavingOrder ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving Order...
                    </>
                  ) : hasUnsavedOrderChanges ? (
                    <>
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save Display Order *
                    </>
                  ) : (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                      Order Saved
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Category Filter and Quick Presets */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      variant={reorderFilter === cat ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => setReorderFilter(cat)}
                    >
                      {cat}
                      {cat === "All" && ` (${portfolioItems.length})`}
                      {cat !== "All" &&
                        ` (${portfolioItems.filter((i) => i.category === cat).length})`}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <span className="text-[11px] text-stone-400 mr-1 hidden sm:inline">Sort Presets:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 text-stone-500 hover:text-stone-900"
                    onClick={() => handleSortPreset("newest")}
                  >
                    Newest First
                  </Button>
                  <span className="text-stone-300">|</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 text-stone-500 hover:text-stone-900"
                    onClick={() => handleSortPreset("oldest")}
                  >
                    Oldest First
                  </Button>
                </div>
              </div>

              {/* Informative Tip */}
              <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-600 flex items-center justify-between border border-stone-200">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-stone-400 shrink-0" />
                  <span>
                    <strong>How to reorder:</strong> Click &amp; drag any photo card to reposition it, or use the navigation arrows (<span className="font-mono">⇤ ← → ⇥</span>).
                    Click on the number badge (<span className="font-mono">#</span>) to jump to a specific position number.
                  </span>
                </div>
                {reorderFilter !== "All" && (
                  <Badge variant="outline" className="text-[10px] bg-white text-stone-700 shrink-0 ml-2">
                    Viewing {reorderFilter} only
                  </Badge>
                )}
              </div>

              {/* Draggable Grid */}
              {isLoadingItems ? (
                <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">Loading photos for reordering...</p>
                </div>
              ) : reorderVisibleItems.length === 0 ? (
                <div className="text-center py-16 border rounded-xl border-dashed">
                  <ImageIcon className="mx-auto h-10 w-10 text-stone-300 mb-3" />
                  <p className="text-stone-600 font-medium">No photos found in this category.</p>
                  <p className="text-stone-400 text-xs mt-1">
                    Upload photos in the "Upload Photos" tab to arrange them here.
                  </p>
                </div>
              ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                  {reorderVisibleItems.map((item, visibleIndex) => {
                    const masterIndex = portfolioItems.findIndex((i) => i._id === item._id)
                    const isDraggingThis = draggedItemId === item._id
                    const isDragOverThis = dragOverItemId === item._id && !isDraggingThis

                    return (
                      <div
                        key={item._id}
                        draggable
                        onDragStart={(e) => handleCardDragStart(e, item._id)}
                        onDragOver={(e) => handleCardDragOver(e, item._id)}
                        onDragLeave={(e) => handleCardDragLeave(e, item._id)}
                        onDrop={(e) => handleCardDrop(e, item._id)}
                        onDragEnd={handleCardDragEnd}
                        className={`break-inside-avoid mb-6 group relative rounded-xl border bg-white overflow-hidden transition-all duration-300 select-none shadow-xs cursor-grab active:cursor-grabbing ${
                          isDraggingThis
                            ? "opacity-30 scale-95 border-2 border-dashed border-stone-500 shadow-none"
                            : isDragOverThis
                            ? "ring-4 ring-stone-900 ring-offset-4 scale-[1.02] shadow-2xl bg-stone-50"
                            : "hover:shadow-md hover:border-stone-400"
                        }`}
                      >
                        {/* Drag Handle Top Bar */}
                        <div className="p-2.5 bg-stone-50/90 border-b flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleOpenJumpDialog(item, visibleIndex)}
                            className="flex items-center gap-1 font-mono text-xs font-bold bg-stone-900 text-white px-2 py-0.5 rounded hover:bg-stone-700 transition shadow-xs"
                            title="Click to jump to a specific position number"
                          >
                            <Hash className="h-3 w-3" />
                            {visibleIndex + 1}
                          </button>

                          <div className="flex items-center text-stone-400 group-hover:text-stone-700 transition">
                            <span className="text-[10px] uppercase font-mono mr-1">Drag</span>
                            <GripVertical className="h-4 w-4" />
                          </div>
                        </div>

                        {/* Image Preview with Natural Proportions */}
                        <div className="relative bg-stone-100 overflow-hidden">
                          <img
                            src={item.src}
                            alt={item.category}
                            className="w-full h-auto object-cover pointer-events-none transition-transform duration-500 group-hover:scale-102"
                          />
                          <div className="absolute bottom-2 left-2 z-10">
                            <Badge className="bg-stone-900/80 backdrop-blur-sm text-[10px] text-white">
                              {item.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Location / Caption */}
                        <div className="p-3 bg-white border-t">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-stone-900 truncate" title={item.location}>
                              {item.location || "Studio Session"}
                            </p>
                            <span className="text-[10px] text-stone-400 shrink-0">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Reorder Action Controls */}
                        <div className="p-2 bg-stone-50/90 border-t flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={visibleIndex === 0}
                              onClick={() => handleMoveItem(item._id, "first")}
                              className="h-7 w-7 text-stone-600 hover:text-stone-900 hover:bg-stone-200"
                              title="Move to first (#1)"
                            >
                              <ChevronsLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={visibleIndex === 0}
                              onClick={() => handleMoveItem(item._id, "prev")}
                              className="h-7 w-7 text-stone-600 hover:text-stone-900 hover:bg-stone-200"
                              title="Move one position left"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <span className="text-[10px] text-stone-500 font-mono">
                            {visibleIndex + 1} of {reorderVisibleItems.length}
                          </span>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={visibleIndex === reorderVisibleItems.length - 1}
                              onClick={() => handleMoveItem(item._id, "next")}
                              className="h-7 w-7 text-stone-600 hover:text-stone-900 hover:bg-stone-200"
                              title="Move one position right"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={visibleIndex === reorderVisibleItems.length - 1}
                              onClick={() => handleMoveItem(item._id, "last")}
                              className="h-7 w-7 text-stone-600 hover:text-stone-900 hover:bg-stone-200"
                              title="Move to last"
                            >
                              <ChevronsRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Save Bar when unsaved changes exist in Reorder tab */}
      {hasUnsavedOrderChanges && activeTab === "reorder" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300 border border-stone-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <p className="text-xs font-medium text-stone-200">
              You have unsaved changes to the photo order
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetOrder}
              disabled={isSavingOrder}
              className="text-stone-300 hover:text-white hover:bg-stone-800 text-xs h-8"
            >
              Discard
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveOrder}
              disabled={isSavingOrder}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-8 px-4 rounded-full shadow-md"
            >
              {isSavingOrder ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save Order Now
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Direct Jump to Position Dialog */}
      <Dialog
        open={!!jumpDialogItem}
        onOpenChange={(open) => !open && setJumpDialogItem(null)}
      >
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Jump to Position</DialogTitle>
            <DialogDescription>
              Enter the target position number (1 to {reorderVisibleItems.length}) for this photo.
            </DialogDescription>
          </DialogHeader>

          {jumpDialogItem && (
            <form onSubmit={handleConfirmJump} className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg border">
                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-stone-200 shrink-0">
                  <Image
                    src={jumpDialogItem.src}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{jumpDialogItem.location}</p>
                  <p className="text-[10px] text-stone-400">{jumpDialogItem.category}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jump-pos">Target Position #</Label>
                <Input
                  id="jump-pos"
                  type="number"
                  min="1"
                  max={reorderVisibleItems.length}
                  value={jumpTargetPosition}
                  onChange={(e) => setJumpTargetPosition(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setJumpDialogItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-800 text-white"
                >
                  Move Photo
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Photo Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && !isSavingEdit && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Photo Details</DialogTitle>
            <DialogDescription>
              Correct or update the category and location/caption for this photo.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              {/* Preview & Info */}
              <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-stone-200 shrink-0 border">
                  <Image
                    src={editingItem.src}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-stone-500 truncate" title={editingItem._id}>
                    {editingItem._id.replace("luisa_portfolio/", "")}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">
                      Current: {editingItem.category}
                    </Badge>
                    <span className="text-[11px] text-stone-400">
                      {new Date(editingItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editCategory}
                  onValueChange={setEditCategory}
                  disabled={isSavingEdit}
                >
                  <SelectTrigger id="edit-category">
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

              {/* Location / Caption */}
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location / Caption</Label>
                <Input
                  id="edit-location"
                  placeholder="e.g. Studio Session, Rishikesh, Sunset Beach"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  disabled={isSavingEdit}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  disabled={isSavingEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEdit}
                  className="bg-stone-900 hover:bg-stone-800 text-white"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
