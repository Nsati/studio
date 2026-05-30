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
import { Upload, Loader2, FileCheck2, AlertTriangle, TableIcon, Info } from 'lucide-react';
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
                    setParsedData(result.data as TourPackageUploadData[]);
                },
                error: (err: any) => {
                    setError(`CSV Parsing Error: ${err.message}`);
                }
            });
        }
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
                setFile(null);
                setParsedData([]);
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

    return (
        <Dialog onOpenChange={() => { setFile(null); setParsedData([]); setError(''); }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-none font-bold">
                    <Upload className="mr-2 h-4 w-4" /> Bulk Itineraries
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl rounded-none border-0">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight">Bulk Tour Upload</DialogTitle>
                    <DialogDescription className="font-medium">
                        Upload a CSV file to inject multiple Himalayan itineraries into the production database.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-6">
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                        <Input id="csv-file-tour" type="file" accept=".csv" onChange={handleFileChange} className="max-w-xs cursor-pointer" />
                        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select system-standard .csv file</p>
                    </div>

                    {parsedData.length > 0 && (
                        <div className="space-y-4">
                            <Alert className="bg-green-50 border-green-200">
                                <FileCheck2 className="h-4 w-4 text-green-700" />
                                <AlertDescription className="font-bold text-green-800">
                                    Parsed {parsedData.length} itineraries from {file?.name}.
                                </AlertDescription>
                            </Alert>
                            
                            <ScrollArea className="h-64 w-full border border-black/5 bg-white">
                                <Table>
                                    <TableHeader className="bg-muted/50 sticky top-0">
                                        <TableRow>
                                            <TableHead className="text-[10px] font-black uppercase">Package Title</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase">Duration</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase text-right">Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedData.map((pkg, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="text-xs font-bold">{pkg.title}</TableCell>
                                                <TableCell className="text-xs font-medium">{pkg.duration}</TableCell>
                                                <TableCell className="text-xs font-black text-right">₹{pkg.price}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive" className="rounded-none">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="font-bold">{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="p-4 bg-[#f0f6ff] border border-black/5 rounded-none flex gap-4">
                        <Info className="h-5 w-5 text-[#003580] shrink-0" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-[#003580] tracking-widest">CSV Data Format Notice</p>
                            <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                Columns required: <b>title, duration, destinations, price, gst, image, description, persons, rooms, cabType, itinerary, inclusions, exclusions, policy_tcs, policy_cancellation, policy_payment, policy_terms</b>. 
                                <br/>Note: <b>itinerary</b> and <b>hotels</b> must be valid JSON strings in the cell.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-muted/30 p-6 -mx-6 -mb-6">
                    <DialogClose asChild><Button type="button" variant="ghost" className="rounded-none font-bold">Abort</Button></DialogClose>
                    <Button onClick={handleUpload} disabled={isUploading || parsedData.length === 0} className="rounded-none font-black px-10 bg-[#003580]">
                        {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Cloud Sync...</> : `Commit ${parsedData.length} Packages`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
