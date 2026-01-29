
'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, FileCheck2, AlertTriangle, TableIcon } from 'lucide-react';
import { bulkUploadHotels, type HotelUploadData } from '@/app/admin/hotels/actions';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';

export function BulkUploadHotelsDialog() {
    const { toast } = useToast();
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<HotelUploadData[]>([]);
    const [error, setError] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
            setParsedData([]);
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    setParsedData(result.data as HotelUploadData[]);
                },
                error: (err: any) => {
                    setError(`CSV Parsing Error: ${err.message}`);
                }
            });
        }
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) {
            toast({ variant: 'destructive', title: 'No data to upload' });
            return;
        }
        setIsUploading(true);
        setError('');
        
        try {
            const result = await bulkUploadHotels(parsedData);
            if (result.success) {
                toast({
                    title: 'Upload Successful!',
                    description: result.message,
                });
                router.refresh();
            } else {
                 throw new Error(result.message);
            }
        } catch (e: any) {
            console.error("Bulk upload failed:", e);
            setError(e.message || 'An unknown error occurred.');
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: e.message,
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    const expectedHeaders = [
        'name', 'city', 'description', 'address', 'rating', 'discount', 'amenities', 'images',
        'room_1_type', 'room_1_price', 'room_1_capacity', 'room_1_total',
        'room_2_type', 'room_2_price', 'room_2_capacity', 'room_2_total',
        'room_3_type', 'room_3_price', 'room_3_capacity', 'room_3_total',
    ];

    return (
        <Dialog onOpenChange={() => {
            setFile(null);
            setParsedData([]);
            setError('');
        }}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Hotels via CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to add multiple hotels at once. The file must contain the correct headers.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                    </div>

                    {file && parsedData.length > 0 && (
                         <Alert>
                             <FileCheck2 className="h-4 w-4" />
                             <AlertDescription className="font-semibold">
                                 Successfully parsed {parsedData.length} hotels from <span className="font-mono">{file.name}</span>. Review the data below before uploading.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    {parsedData.length > 0 && (
                        <ScrollArea className="h-72 w-full rounded-md border">
                            <Table>
                                <TableHeader className="sticky top-0 bg-muted">
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>City</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Rooms</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.map((hotel, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{hotel.name}</TableCell>
                                            <TableCell>{hotel.city}</TableCell>
                                            <TableCell>{hotel.rating}</TableCell>
                                            <TableCell>
                                                {[1,2,3].map(i => hotel[`room_${i}_type` as keyof typeof hotel] ? <span key={i} className="text-xs font-mono bg-muted-foreground/10 p-1 rounded-sm mr-1">{hotel[`room_${i}_type` as keyof typeof hotel]}</span> : null).filter(Boolean).length}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {!file && (
                        <Alert variant="default" className="bg-blue-50 border-blue-200">
                             <TableIcon className="h-4 w-4 !text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                <b>Required CSV Headers:</b> {expectedHeaders.slice(0,8).join(', ')}, etc. Room columns (e.g. `room_1_type`) are optional, but at least one full room definition is required per hotel.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpload} disabled={isUploading || parsedData.length === 0}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {isUploading ? 'Uploading...' : `Upload ${parsedData.length} Hotels`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
