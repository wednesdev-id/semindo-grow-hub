/**
 * IncomingLetterList Component
 * Displays list of incoming letters with filters and actions
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { IncomingLetter, IncomingLetterFilters, IncomingLetterStatus, LetterPriority } from '@/types/arsipari';
import { suratMasukService } from '@/services/arsipariService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Pencil, Trash2, FileText, Clock, CheckCircle, Archive, MoreHorizontal } from 'lucide-react';

interface IncomingLetterListProps {
  onDetail?: (letter: IncomingLetter) => void;
  onEdit?: (letter: IncomingLetter) => void;
  onDelete?: (letter: IncomingLetter) => void;
}

const priorityColors: Record<LetterPriority, string> = {
  RENDAH: 'bg-slate-100 text-slate-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  TINGGI: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const statusColors: Record<IncomingLetterStatus, string> = {
  BARU: 'bg-green-100 text-green-800',
  DIPROSES: 'bg-blue-100 text-blue-800',
  DISPOSISI: 'bg-purple-100 text-purple-800',
  SELESAI: 'bg-gray-100 text-gray-800',
  ARSIP: 'bg-amber-100 text-amber-800',
};

const statusIcons: Record<IncomingLetterStatus, any> = {
  BARU: FileText,
  DIPROSES: Clock,
  DISPOSISI: Archive,
  SELESAI: CheckCircle,
  ARSIP: Archive,
};

export function IncomingLetterList({ onDetail, onEdit, onDelete }: IncomingLetterListProps) {
  const [letters, setLetters] = useState<IncomingLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<IncomingLetterFilters>({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadLetters();
  }, [filters]);

  const loadLetters = async () => {
    try {
      setLoading(true);
      const response = await suratMasukService.list(filters);
      setLetters(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value, page: 1 });
  };

  const handleFilterChange = (key: keyof IncomingLetterFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleDelete = async (letter: IncomingLetter) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus surat "${letter.letterNumber}"?`)) {
      try {
        await suratMasukService.delete(letter.id);
        loadLetters();
        onDelete?.(letter);
      } catch (error) {
        console.error('Error deleting letter:', error);
        alert('Gagal menghapus surat');
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Memuat surat masuk...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Surat Masuk</CardTitle>
        <CardDescription>Daftar surat masuk dengan filter dan pencarian</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Cari nomor, pengirim, atau perihal..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="BARU">Baru</SelectItem>
              <SelectItem value="DIPROSES">Diproses</SelectItem>
              <SelectItem value="DISPOSISI">Disposisi</SelectItem>
              <SelectItem value="SELESAI">Selesai</SelectItem>
              <SelectItem value="ARSIP">Arsip</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.priority || 'all'} onValueChange={(value) => handleFilterChange('priority', value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Prioritas</SelectItem>
              <SelectItem value="RENDAH">Rendah</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="TINGGI">Tinggi</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Surat</TableHead>
                <TableHead>Tanggal Surat</TableHead>
                <TableHead>Pengirim</TableHead>
                <TableHead>Perihal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {letters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Tidak ada surat masuk
                  </TableCell>
                </TableRow>
              ) : (
                letters.map((letter) => {
                  const StatusIcon = statusIcons[letter.status as IncomingLetterStatus];
                  return (
                    <TableRow key={letter.id}>
                      <TableCell className="font-medium">{letter.letterNumber}</TableCell>
                      <TableCell>{format(new Date(letter.letterDate), 'dd MMM yyyy', { locale: id })}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{letter.sender}</div>
                          {letter.senderAddress && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {letter.senderAddress}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{letter.subject}</TableCell>
                      <TableCell>
                        {letter.category && <Badge variant="outline">{letter.category.name}</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[letter.priority as LetterPriority]}>
                          {letter.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[letter.status as IncomingLetterStatus]}>
                          <div className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {letter.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onDetail?.(letter)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detail
                            </DropdownMenuItem>
                            {letter.status !== 'SELESAI' && letter.status !== 'ARSIP' && (
                              <DropdownMenuItem onClick={() => onEdit?.(letter)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {letter.status === 'BARU' && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(letter)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} hingga{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} surat
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
