'use client';

import { useState, useCallback } from 'react';
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
import { Upload, Loader2, FileCheck2, AlertTriangle, Info, RefreshCcw } from 'lucide-react';
import { bulkUploadTourPackages, type TourPackageUploadData } from '@/app/admin/tour-packages/actions';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';

export function BulkUploadTourPackagesDialog() {
    const { toast } = useToast();
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<TourPackageUploadData[]>([]);
    const [error, setError] = useState('');

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
                        setParsedData(result.data as TourPackageUploadData[]);
                    }
                },
                error: (err: any) => {
                    setError(`CSV Parsing Error: ${err.message}`);
                }
            });
        }
    }, []);

    const resetSelection = () => {
        setFile(null);
        setParsedData([]);
        setError('');
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) {
            toast({ variant: 'destructive', title: 'Data Missing', description: 'No valid data found in the uploaded file.' });
            return;
        }
        setIsUploading(true);
        setError('');
        
        try {
            const result = await bulkUploadTourPackages(parsedData);
            if (result.success) {
                toast({ title: 'Success', description: result.message });
                router.refresh();
                resetSelection();
            } else {
                 throw new Error(result.message);
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected cloud error occurred.');
            toast({ variant: 'destructive', title: 'Upload Failed', description: e.message });
        } finally {
            setIsUploading(false);
        }
    };

    // To maintain performance, we only preview the first 50 items if the list is huge.
    const previewData = parsedData.slice(0, 50);

    return (
        <Dialog onOpenChange={(open) => { if (!open && !isUploading) resetSelection(); }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-none font-bold">
                    <Upload className="mr-2 h-4 w-4" /> Bulk Itineraries
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl rounded-none border-0 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight">Bulk Tour Upload</DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground">
                        Synchronize multiple Himalayan itineraries to the production database via CSV.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    {!file ? (
                        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-3xl bg-muted/20 border-black/5">
                            <Upload className="h-12 w-12 text-primary/20 mb-4" />
                            <Input id="csv-file-tour" type="file" accept=".csv" onChange={handleFileChange} className="max-w-xs cursor-pointer h-12 bg-white" />
                            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select system-standard .csv file</p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between">
                                <Alert className="bg-green-50 border-green-200 flex-1 py-3">
                                    <FileCheck2 className="h-4 w-4 text-green-700" />
                                    <AlertDescription className="font-bold text-green-800">
                                        Parsed {parsedData.length} itineraries from {file.name}.
                                    </AlertDescription>
                                </Alert>
                                <Button variant="ghost" size="sm" onClick={resetSelection} className="ml-4 h-12 font-bold text-muted-foreground hover:text-primary">
                                    <RefreshCcw className="mr-2 h-4 w-4" /> Change File
                                </Button>
                            </div>
                            
                            <div className="border border-black/5 rounded-2xl overflow-hidden bg-white shadow-sm">
                                <div className="p-3 bg-muted/30 border-b">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                        Data Preview (Showing {previewData.length} of {parsedData.length})
                                    </p>
                                </div>
                                <ScrollArea className="h-72 w-full">
                                    <Table>
                                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                            <TableRow>
                                                <TableHead className="text-[10px] font-black uppercase">Package Title</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase">Duration</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase text-right">Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {previewData.map((pkg, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="text-xs font-bold truncate max-w-[250px]">{pkg.title}</TableCell>
                                                    <TableCell className="text-xs font-medium">{pkg.duration}</TableCell>
                                                    <TableCell className="text-xs font-black text-right">₹{pkg.price}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive" className="rounded-2xl border-0 shadow-lg">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="font-bold">{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="p-5 bg-[#f0f6ff] border border-black/5 rounded-2xl flex gap-4">
                        <Info className="h-5 w-5 text-[#003580] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-[#003580] tracking-widest">CSV Data Mapping Notice</p>
                            <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                Columns required: <b>title, duration, destinations, price, gst, image, description, persons, rooms, cabType, itinerary, inclusions, exclusions, policy_tcs, policy_cancellation, policy_payment, policy_terms</b>. 
                                <br/>Complex fields (<b>itinerary</b>, <b>hotels</b>) must be valid JSON arrays in string format.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-muted/30 p-6 -mx-6 -mb-6 border-t mt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" className="rounded-full font-bold h-12 px-8" disabled={isUploading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button 
                        onClick={handleUpload} 
                        disabled={isUploading || parsedData.length === 0} 
                        className="rounded-full font-black px-12 h-12 bg-primary shadow-xl shadow-primary/20"
                    >
                        {isUploading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synchronizing Cloud...</>
                        ) : (
                            `Commit ${parsedData.length} Itineraries`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
