import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { z } from 'zod';

const mythSchema = z.object({
  claim_sq: z.string().min(1).max(500),
  claim_en: z.string().min(1).max(500),
  explanation_sq: z.string().min(1),
  explanation_en: z.string().min(1),
  is_true: z.boolean(),
  scientific_references: z.string().optional(),
});

type MythFormData = z.infer<typeof mythSchema>;

export default function MythsManager() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { logAction } = useAuditLog();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingMyth, setEditingMyth] = useState<any>(null);

  const { data: myths, isLoading } = useQuery({
    queryKey: ['admin-myths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('myths')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MythFormData) => {
      const { data: newMyth, error } = await supabase.from('myths').insert([data as any]).select().single();
      if (error) throw error;
      return newMyth;
    },
    onSuccess: async (newMyth) => {
      await logAction('CREATE', 'myths', newMyth.id, null, newMyth);
      queryClient.invalidateQueries({ queryKey: ['admin-myths'] });
      toast({ title: t('Miti u shtua!', 'Myth added!') });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: t('Gabim', 'Error'), description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, oldData }: { id: string; data: Partial<MythFormData>; oldData: any }) => {
      const { error } = await supabase.from('myths').update(data as any).eq('id', id);
      if (error) throw error;
      return { id, data, oldData };
    },
    onSuccess: async ({ id, data, oldData }) => {
      await logAction('UPDATE', 'myths', id, oldData, data);
      queryClient.invalidateQueries({ queryKey: ['admin-myths'] });
      toast({ title: t('Miti u përditësua!', 'Myth updated!') });
      setOpen(false);
      setEditingMyth(null);
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: t('Gabim', 'Error'), description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, mythData }: { id: string; mythData: any }) => {
      const { error } = await supabase.from('myths').delete().eq('id', id);
      if (error) throw error;
      return { id, mythData };
    },
    onSuccess: async ({ id, mythData }) => {
      await logAction('DELETE', 'myths', id, mythData, null);
      queryClient.invalidateQueries({ queryKey: ['admin-myths'] });
      toast({ title: t('Miti u fshi!', 'Myth deleted!') });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: t('Gabim', 'Error'), description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: MythFormData = {
      claim_sq: formData.get('claim_sq') as string,
      claim_en: formData.get('claim_en') as string,
      explanation_sq: formData.get('explanation_sq') as string,
      explanation_en: formData.get('explanation_en') as string,
      is_true: formData.get('is_true') === 'on',
      scientific_references: formData.get('scientific_references') as string || undefined,
    };

    try {
      mythSchema.parse(data);
      if (editingMyth) {
        updateMutation.mutate({ id: editingMyth.id, data, oldData: editingMyth });
      } else {
        createMutation.mutate(data);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('Gabim në validim', 'Validation error'), description: error.message });
    }
  };

  const openCreateDialog = () => {
    setEditingMyth(null);
    setOpen(true);
  };

  const openEditDialog = (myth: any) => {
    setEditingMyth(myth);
    setOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('Duke ngarkuar...', 'Loading...')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('Menaxho Mitet', 'Manage Myths')}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {t('Shto Mit', 'Add Myth')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMyth ? t('Modifiko Mitin', 'Edit Myth') : t('Shto Mit të Ri', 'Add New Myth')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="claim_sq">{t('Pohimi (SHQ)', 'Claim (SQ)')}</Label>
                  <Input id="claim_sq" name="claim_sq" defaultValue={editingMyth?.claim_sq} required />
                </div>
                <div>
                  <Label htmlFor="claim_en">{t('Pohimi (ENG)', 'Claim (EN)')}</Label>
                  <Input id="claim_en" name="claim_en" defaultValue={editingMyth?.claim_en} required />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_true" name="is_true" defaultChecked={editingMyth?.is_true} />
                <Label htmlFor="is_true">{t('Është e vërtetë?', 'Is it true?')}</Label>
              </div>
              <div>
                <Label htmlFor="explanation_sq">{t('Shpjegimi (SHQ)', 'Explanation (SQ)')}</Label>
                <Textarea id="explanation_sq" name="explanation_sq" defaultValue={editingMyth?.explanation_sq} rows={6} required />
              </div>
              <div>
                <Label htmlFor="explanation_en">{t('Shpjegimi (ENG)', 'Explanation (EN)')}</Label>
                <Textarea id="explanation_en" name="explanation_en" defaultValue={editingMyth?.explanation_en} rows={6} required />
              </div>
              <div>
                <Label htmlFor="scientific_references">{t('Referenca Shkencore', 'Scientific References')}</Label>
                <Textarea id="scientific_references" name="scientific_references" defaultValue={editingMyth?.scientific_references} rows={3} />
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingMyth ? t('Përditëso', 'Update') : t('Shto', 'Add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Pohimi', 'Claim')}</TableHead>
              <TableHead>{t('Statusi', 'Status')}</TableHead>
              <TableHead>{t('Veprime', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myths?.map((myth) => (
              <TableRow key={myth.id}>
                <TableCell>{language === 'sq' ? myth.claim_sq : myth.claim_en}</TableCell>
                <TableCell>
                  <Badge variant={myth.is_true ? 'default' : 'destructive'}>
                    {myth.is_true ? t('E Vërtetë', 'Truth') : t('Mit', 'Myth')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(myth)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        if (confirm(t('Jeni i sigurt?', 'Are you sure?'))) {
                          deleteMutation.mutate({ id: myth.id, mythData: myth });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
