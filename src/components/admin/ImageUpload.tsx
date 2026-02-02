'use client';

import React, { useState, useCallback } from 'react';
import { useStorage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxImages?: number;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
}

export function ImageUpload({ value = [], onChange, maxImages = 10 }: ImageUploadProps) {
  const storage = useStorage();
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (value.length + files.length > maxImages) {
      toast({
        variant: 'destructive',
        title: 'Limit Exceeded',
        description: `You can only upload up to ${maxImages} images.`
      });
      return;
    }

    Array.from(files).forEach((file) => {
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File', description: `${file.name} is not an image.` });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'File Too Large', description: `${file.name} exceeds 5MB limit.` });
        return;
      }

      const id = Math.random().toString(36).substring(7);
      const storageRef = ref(storage, `hotels/images/${id}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setUploadingFiles((prev) => [...prev, { id, file, progress: 0 }]);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadingFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, progress } : f))
          );
        },
        (error) => {
          console.error('Upload error:', error);
          toast({ variant: 'destructive', title: 'Upload Failed', description: `Could not upload ${file.name}` });
          setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onChange([...value, downloadURL]);
          setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
        }
      );
    });
  };

  const removeImage = async (url: string) => {
    // Only attempt to delete if it's a firebase storage URL
    if (url.includes('firebasestorage.googleapis.com')) {
        try {
            const storageRef = ref(storage, url);
            await deleteObject(storageRef);
        } catch (e) {
            console.warn('Could not delete file from storage:', e);
        }
    }
    onChange(value.filter((v) => v !== url));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-black/10 rounded-[2rem] bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer relative group">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          disabled={value.length >= maxImages}
        />
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="p-4 bg-white rounded-full shadow-apple group-hover:scale-110 transition-transform">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-black tracking-tight">Click or Drag & Drop</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Maximum {maxImages} images (up to 5MB each)
            </p>
          </div>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" /> Uploading in Progress...
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {uploadingFiles.map((f) => (
              <div key={f.id} className="p-4 bg-white rounded-2xl border border-black/5 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="truncate max-w-[150px]">{f.file.name}</span>
                  <span>{Math.round(f.progress)}%</span>
                </div>
                <Progress value={f.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Image Collection ({value.length}/{maxImages})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {value.map((url, index) => (
              <div key={index} className="relative aspect-square group rounded-2xl overflow-hidden border border-black/5 shadow-apple bg-muted">
                <Image src={url} alt={`Hotel Image ${index + 1}`} fill className="object-cover" />
                <button
                  onClick={() => removeImage(url)}
                  className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/80 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-widest py-1.5 text-center">
                        Main Preview
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}