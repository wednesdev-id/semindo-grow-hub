/**
 * DispositionList Component
 * Displays list of dispositions for an incoming letter
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Disposition, DispositionStatus, CreateDispositionDto } from '@/types/arsipari';
import { disposisiService } from '@/services/arsipariService';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Clock, CheckCircle2, Plus } from 'lucide-react';

interface DispositionListProps {
  incomingLetterId: string;
  canCreate?: boolean;
}

const statusColors: Record<DispositionStatus, string> = {
  AWAITING: 'bg-yellow-100 text-yellow-800',
  READ: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const statusIcons: Record<DispositionStatus, any> = {
  AWAITING: Clock,
  READ: Clock,
  COMPLETED: CheckCircle2,
};

export function DispositionList({ incomingLetterId, canCreate = true }: DispositionListProps) {
  const [dispositions, setDispositions] = useState<Disposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<CreateDispositionDto>({
    incomingLetterId,
    toUserId: '',
    instruction: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDispositions();
    loadUsers();
  }, [incomingLetterId]);

  const loadDispositions = async () => {
    try {
      setLoading(true);
      const response = await disposisiService.getChain(incomingLetterId);
      setDispositions(response.data);
    } catch (error) {
      console.error('Error loading dispositions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.findAll({ limit: 100 });
      // response.data is PaginatedResponse, response.data.data is User[]
      const allUsers = response.data?.data || [];
      // Filter only internal staff (admin, super_admin)
      const internalUsers = allUsers.filter(u =>
        u.roles?.some(r => ['admin', 'super_admin', 'mentor', 'consultant'].includes(r))
      );
      setUsers(internalUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await disposisiService.create(formData);
      setShowCreateDialog(false);
      setFormData({
        incomingLetterId,
        toUserId: '',
        instruction: '',
        notes: '',
      });
      loadDispositions();
    } catch (error: any) {
      console.error('Error creating disposition:', error);
      alert(error.message || 'Gagal membuat disposisi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Riwayat Disposisi</h3>
          <p className="text-sm text-muted-foreground">Alur disposisi surat ini</p>
        </div>
        {canCreate && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Buat Disposisi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Disposisi Baru</DialogTitle>
                <DialogDescription>Meneruskan surat ke user lain untuk ditindaklanjuti</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="toUserId">Tujuan *</Label>
                  <Select
                    value={formData.toUserId}
                    onValueChange={(value) => setFormData({ ...formData, toUserId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName} {user.roles && user.roles.length > 0 ? `(${user.roles.join(', ')})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instruction">Instruksi *</Label>
                  <Textarea
                    id="instruction"
                    value={formData.instruction}
                    onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                    placeholder="Instruksi untuk user tujuan..."
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Catatan tambahan..."
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Memuat disposisi...</div>
          </CardContent>
        </Card>
      ) : dispositions.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Belum ada disposisi</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {dispositions.map((disposition, index) => {
            const StatusIcon = statusIcons[disposition.status as DispositionStatus];
            return (
              <div key={disposition.id}>
                {index > 0 && (
                  <div className="flex justify-center">
                    <div className="w-0.5 h-6 bg-border" />
                  </div>
                )}
                <Card className={disposition.status === 'COMPLETED' ? 'border-green-200' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={disposition.fromUser?.profilePictureUrl} />
                        <AvatarFallback>
                          {disposition.fromUser?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{disposition.fromUser?.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(disposition.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                            </p>
                          </div>
                          <Badge className={statusColors[disposition.status as DispositionStatus]}>
                            <div className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {disposition.status}
                            </div>
                          </Badge>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                          <p className="text-sm font-medium">Instruksi:</p>
                          <p className="text-sm">{disposition.instruction}</p>
                          {disposition.notes && (
                            <>
                              <p className="text-sm font-medium mt-2">Catatan:</p>
                              <p className="text-sm">{disposition.notes}</p>
                            </>
                          )}
                        </div>
                        {disposition.readAt && (
                          <p className="text-xs text-muted-foreground">
                            Dibaca: {format(new Date(disposition.readAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {index < dispositions.length - 1 && (
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-background p-1">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
