
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
import { Upload, Loader2, FileCheck2, AlertTriangle, Info, FileSpreadsheet } from 'lucide-react';
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
                    if (result.errors.length > 0) {
                        setError(`CSV Formatting Error: ${result.errors[0].message}`);
                    } else {
                        setParsedData(result.data as HotelUploadData[]);
                    }
                },
                error: (err: any) => {
                    setError(`CSV Parsing Error: ${err.message}`);
                }
            });
        }
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) {
            toast({ variant: 'destructive', title: 'Data Missing', description: 'Upload a valid CSV file first.' });
            return;
        }
        setIsUploading(true);
        setError('');
        
        try {
            const result = await bulkUploadHotels(parsedData);
            if (result.success) {
                toast({ title: 'Success', description: result.message });
                setFile(null);
                setParsedData([]);
                router.refresh();
            } else {
                 throw new Error(result.message);
            }
        } catch (e: any) {
            setError(e.message || 'Cloud synchronization failed.');
            toast({ variant: 'destructive', title: 'Upload Failed', description: e.message });
        } finally {
            setIsUploading(false);
        }
    };
    
    const requiredHeaders = ['name', 'city', 'description', 'address', 'rating', 'discount', 'amenities', 'images'];
    const roomHeaders = ['room_1_type', 'room_1_price', 'room_1_capacity', 'room_1_total'];

    return (
        <Dialog onOpenChange={(open) => {
            if (!open && !isUploading) {
                setFile(null);
                setParsedData([]);
                setError('');
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-none font-bold h-12 px-6 border-black/10">
                    <Upload className="mr-2 h-4 w-4 text-primary" /> Bulk Hotel Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl rounded-none border-0 shadow-2xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight">Bulk Property Cloud Sync</DialogTitle>
                    <DialogDescription className="font-medium">
                        Synchronize multiple properties and their room inventory using a flat CSV structure.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    {!file ? (
                        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-3xl bg-muted/20 border-black/5">
                            <FileSpreadsheet className="h-12 w-12 text-primary/20 mb-4" />
                            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="max-w-xs h-12 bg-white cursor-pointer" />
                            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select .csv file (Required: name, city, description...)</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Alert className="bg-green-50 border-green-200 py-3">
                                 <FileCheck2 className="h-4 w-4 text-green-700" />
                                 <AlertDescription className="font-bold text-green-800">
                                     Parsed {parsedData.length} property nodes from {file.name}.
                                </AlertDescription>
                            </Alert>
                            
                            <div className="border border-black/5 rounded-2xl overflow-hidden bg-white shadow-sm">
                                <ScrollArea className="h-64 w-full">
                                    <Table>
                                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                            <TableRow>
                                                <TableHead className="text-[10px] font-black uppercase">Property Name</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase">City</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase">Standard Room</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {parsedData.slice(0, 10).map((hotel, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="text-xs font-bold truncate max-w-[200px]">{hotel.name}</TableCell>
                                                    <TableCell className="text-xs font-medium uppercase tracking-tighter">{hotel.city}</TableCell>
                                                    <TableCell className="text-[10px] font-black text-blue-600">{hotel.room_1_type || 'NONE'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive" className="rounded-2xl">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="font-bold">{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="p-5 bg-[#f0f6ff] border border-blue-100 rounded-2xl flex gap-4">
                         <Info className="h-5 w-5 text-[#003580] shrink-0 mt-0.5" />
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-[#003580] tracking-widest">Master Header Sequence (Required):</p>
                            <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                <b>{requiredHeaders.join(', ')}</b>
                            </p>
                            <p className="text-[10px] font-black uppercase text-[#003580] tracking-widest mt-3">Optional Inventory Headers (Auto-Sync):</p>
                            <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                <b>{roomHeaders.join(', ')}</b> (up to room_3_...)
                            </p>
                         </div>
                    </div>
                </div>
                
                <DialogFooter className="bg-muted/30 p-6 -mx-6 -mb-6 border-t">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" className="rounded-full font-bold h-12 px-8" disabled={isUploading}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpload} disabled={isUploading || parsedData.length === 0} className="rounded-full font-black px-12 h-12 bg-primary shadow-xl">
                        {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synchronizing...</> : `Commit ${parsedData.length} Properties`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
