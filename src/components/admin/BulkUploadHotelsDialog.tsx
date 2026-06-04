
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
import { Upload, Loader2, FileCheck2, AlertTriangle, Info } from 'lucide-react';
import { bulkUploadHotels } from '@/app/admin/hotels/actions';
import { type HotelUploadData } from '@/app/admin/schemas';
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
                setFile(null);
                setParsedData([]);
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
    
    const baseHeaders = ['name', 'city', 'description', 'address', 'rating', 'discount', 'amenities', 'images'];
    const roomHeaders = ['room_1_type', 'room_1_price', 'room_1_capacity', 'room_1_total'];

    return (
        <Dialog onOpenChange={(open) => {
            if (!open) {
                setFile(null);
                setParsedData([]);
                setError('');
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-none font-bold">
                    <Upload className="mr-2 h-4 w-4" /> Bulk Hotel Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl rounded-none">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Bulk Property Sync</DialogTitle>
                    <DialogDescription className="font-medium">
                        Upload properties and room inventory simultaneously via CSV.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-muted/20 border-black/5">
                        <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="max-w-xs h-12 bg-white cursor-pointer" />
                        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select .csv file with required headers</p>
                    </div>

                    {file && parsedData.length > 0 && (
                         <Alert className="bg-green-50 border-green-200">
                             <FileCheck2 className="h-4 w-4 text-green-700" />
                             <AlertDescription className="font-bold text-green-800">
                                 Parsed {parsedData.length} properties from {file.name}.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    {parsedData.length > 0 && (
                        <div className="border rounded-xl overflow-hidden bg-white">
                            <ScrollArea className="h-48 w-full">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-muted z-10">
                                        <TableRow>
                                            <TableHead className="text-[10px] font-black uppercase">Name</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase">City</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase">Room 1</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedData.slice(0, 10).map((hotel, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="text-xs font-bold">{hotel.name}</TableCell>
                                                <TableCell className="text-xs">{hotel.city}</TableCell>
                                                <TableCell className="text-xs font-black">{hotel.room_1_type || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="font-bold">{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                         <Info className="h-5 w-5 text-blue-600 shrink-0" />
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-blue-800 tracking-widest">Required CSV Headers:</p>
                            <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                                <b>{baseHeaders.join(', ')}</b>
                            </p>
                            <p className="text-[10px] font-black uppercase text-blue-800 tracking-widest mt-3">Room Sync (Optional):</p>
                            <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                                <b>{roomHeaders.join(', ')}</b> (up to room_3_...)
                            </p>
                         </div>
                    </div>
                </div>
                <DialogFooter className="border-t pt-6">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" className="rounded-none font-bold h-12 px-8">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpload} disabled={isUploading || parsedData.length === 0} className="rounded-none font-black px-12 h-12 bg-primary shadow-xl">
                        {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synchronizing...</> : `Commit ${parsedData.length} Properties`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
