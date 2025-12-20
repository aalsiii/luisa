"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import Image from "next/image"
import { CATEGORIES } from "@/lib/constants"
import { Trash2, Upload, Loader2, Image as ImageIcon } from "lucide-react"

enum Category {
    Solos = "Solos",
    Couple = "Couple",
    Pet = "Pet",
    Family = "Family",
    Lifestyle = "Lifestyle",
    Yoga = "Yoga",
    Creative = "Creative"
}

export default function AdminDashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [category, setCategory] = useState<string>("Family");
    const [location, setLocation] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/portfolio');
            const data = await res.json();
            if (data.success) {
                setPortfolioItems(data.data);
            }
        } catch (error) {
            toast.error("Failed to load items");
        } finally {
            setIsLoadingItems(false);
        }
    }


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);

        try {
            // 1. Get Signature from Server
            const timestamp = Math.round((new Date()).getTime() / 1000);
            const paramsToSign = {
                timestamp: timestamp,
                folder: 'luisa_portfolio'
            };

            const signRes = await fetch('/api/sign-cloudinary-params', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paramsToSign }),
            });

            if (!signRes.ok) {
                throw new Error('Failed to get upload signature');
            }

            const signData = await signRes.json();
            const { signature, apiKey, cloudName } = signData;

            // 2. Upload directly to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);
            formData.append('folder', 'luisa_portfolio');

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) {
                throw new Error(uploadData.error?.message || 'Upload failed');
            }

            const imageUrl = uploadData.secure_url;

            // 3. Save metadata to MongoDB
            const metadataRes = await fetch('/api/portfolio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    location: location || "Studio Session",
                    src: imageUrl
                })
            });

            if (metadataRes.ok) {
                toast.success("Image uploaded successfully!");
                setFile(null);
                setPreview(null);
                setLocation("");
                fetchItems(); // Refresh list
            } else {
                throw new Error("Failed to save metadata");
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            const res = await fetch(`/api/portfolio?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success("Item deleted");
                fetchItems();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting item");
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Back to Site
                </Button>
            </div>


            <Tabs defaultValue="upload" className="max-w-4xl mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload New</TabsTrigger>
                    <TabsTrigger value="manage">Manage Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Photo</CardTitle>
                            <CardDescription>Add a new photo to your portfolio.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpload} className="grid gap-6">

                                <div className="grid gap-2">
                                    <Label>Image</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32 h-32 border rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden relative">
                                            {preview ? (
                                                <Image src={preview} alt="Preview" fill className="object-cover" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} required />
                                            <p className="text-xs text-gray-500 mt-2">Accepted formats: JPG, PNG, WEBP</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.filter(c => c !== "All").map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Location / Context</Label>
                                        <Input
                                            id="location"
                                            placeholder="e.g. Portrait Session"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={isUploading || !file} className="w-full">
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload to Gallery
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="manage">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Gallery</CardTitle>
                            <CardDescription>View and delete existing photos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingItems ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {portfolioItems.map((item) => (
                                        <div key={item._id} className="relative group border rounded-lg overflow-hidden aspect-square bg-gray-100">
                                            <Image
                                                src={item.src}
                                                alt={item.category}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs">
                                                <p className="font-medium">{item.category}</p>
                                                <p className="opacity-80">{item.location}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {portfolioItems.length === 0 && (
                                        <p className="col-span-full text-center text-gray-500 py-8">No images found.</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
