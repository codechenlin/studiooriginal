
"use client";

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, FileIcon, Image as ImageIcon, Film, FileText, Music, Archive, Edit, Trash2, Download, Eye, UploadCloud, Loader2, Search, XCircle, AlertTriangle, FolderOpen } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { type StorageFile, listFiles, uploadFile, renameFile, deleteFiles } from '@/app/dashboard/templates/(editor)/create/gallery-actions';
import { Skeleton } from '../ui/skeleton';

const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Film;
    if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return FileText;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.startsWith('application/zip') || mimeType.startsWith('application/x-rar-compressed')) return Archive;
    return FileIcon;
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export function FileManagerModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [isLoading, startLoading] = useTransition();
    const [isUploading, startUploading] = useTransition();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingFile, setEditingFile] = useState<StorageFile | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const [deletingFile, setDeletingFile] = useState<StorageFile | null>(null);
    const [supabaseUrl, setSupabaseUrl] = useState('');

    const fetchFiles = useCallback(async () => {
        startLoading(async () => {
            const result = await listFiles();
            if (result.success && result.data) {
                setFiles(result.data.files);
                setSupabaseUrl(result.data.baseUrl);
            } else {
                toast({ title: 'Error al cargar archivos', description: result.error, variant: 'destructive' });
            }
        });
    }, [toast]);

    useEffect(() => {
        if (open) {
            fetchFiles();
        }
    }, [open, fetchFiles]);
    
    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        startUploading(async () => {
            const formData = new FormData();
            formData.append('file', file);
            const result = await uploadFile(formData);

            if (result.success) {
                toast({ title: '¡Éxito!', description: 'Archivo subido correctamente.', className: 'bg-green-500 text-white' });
                fetchFiles();
            } else {
                toast({ title: 'Error al subir', description: result.error, variant: 'destructive' });
            }
        });
    };
    
    const handleRename = async () => {
        if (!editingFile || !newFileName.trim()) return;

        const oldPath = editingFile.name;
        const fileExtension = oldPath.split('.').pop();
        const finalName = fileExtension ? `${newFileName.trim()}.${fileExtension}` : newFileName.trim();

        const result = await renameFile({ oldPath, newName: finalName });

        if(result.success) {
            toast({ title: '¡Éxito!', description: 'Archivo renombrado.', className: 'bg-green-500 text-white' });
            setEditingFile(null);
            fetchFiles();
        } else {
             toast({ title: 'Error al renombrar', description: result.error, variant: 'destructive' });
        }
    };
    
    const handleDelete = async () => {
        if (!deletingFile) return;
        
        const result = await deleteFiles({ paths: [deletingFile.name] });
        if(result.success) {
            toast({ title: '¡Éxito!', description: 'Archivo eliminado.', className: 'bg-green-500 text-white' });
            setDeletingFile(null);
            fetchFiles();
        } else {
             toast({ title: 'Error al eliminar', description: result.error, variant: 'destructive' });
        }
    };

    const getPublicUrl = (path: string) => {
        return `${supabaseUrl}/storage/v1/object/public/admin_assets/${path}`;
    }

    const filteredFiles = files.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>Gestor de Archivos</DialogTitle>
                        <DialogDescription>Administra los archivos de tu proyecto.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-4 border-b flex items-center justify-between gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input placeholder="Buscar archivos..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Button asChild>
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <UploadCloud className="mr-2" />
                                    {isUploading ? <Loader2 className="animate-spin" /> : 'Subir Archivo'}
                                </label>
                            </Button>
                            <Input id="file-upload" type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
                        </div>
                        <ScrollArea className="flex-1">
                            {isLoading ? (
                                <div className="p-4 space-y-2">
                                    {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12 w-full"/>)}
                                </div>
                            ) : filteredFiles.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60px]"></TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Tamaño</TableHead>
                                            <TableHead>Última Modificación</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFiles.map(file => {
                                            const Icon = getFileIcon(file.metadata.mimetype);
                                            const fileName = file.name.split('/').pop() || '';
                                            return (
                                                <TableRow key={file.id}>
                                                    <TableCell>
                                                        <div className="size-8 rounded-md bg-muted flex items-center justify-center">
                                                            <Icon className="size-5 text-muted-foreground"/>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{fileName}</TableCell>
                                                    <TableCell>{formatBytes(file.metadata.size)}</TableCell>
                                                    <TableCell>{formatDistanceToNow(new Date(file.updated_at), { addSuffix: true, locale: es })}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                 <DropdownMenuItem onSelect={() => window.open(getPublicUrl(file.name), '_blank')}><Eye className="mr-2"/>Ver</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => {setEditingFile(file); setNewFileName(fileName.substring(0, fileName.lastIndexOf('.')))}}><Edit className="mr-2"/>Renombrar</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive" onSelect={() => setDeletingFile(file)}><Trash2 className="mr-2"/>Eliminar</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground p-12 flex flex-col items-center justify-center">
                                    <FolderOpen className="size-16 mb-4 text-primary/50" />
                                    <h3 className="text-xl font-semibold text-foreground">No se encontraron archivos</h3>
                                    <p className="mt-2">Sube tu primer archivo para empezar a gestionar tus recursos.</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                    <DialogFooter className="p-4 border-t">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename Modal */}
            <Dialog open={!!editingFile} onOpenChange={(open) => !open && setEditingFile(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Renombrar Archivo</DialogTitle>
                        <DialogDescription>
                            Ingresa el nuevo nombre para &quot;{editingFile?.name.split('/').pop()}&quot;. La extensión se mantendrá.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingFile(null)}>Cancelar</Button>
                        <Button onClick={handleRename}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deletingFile} onOpenChange={(open) => !open && setDeletingFile(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Confirmar Eliminación</DialogTitle>
                        <DialogDescription>
                           ¿Estás seguro de que quieres eliminar el archivo &quot;{deletingFile?.name.split('/').pop()}&quot;? Esta acción es irreversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingFile(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDelete}>Sí, eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
