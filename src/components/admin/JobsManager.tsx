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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { z } from 'zod';

const jobSchema = z.object({
  business_name: z.string().min(1).max(200),
  position_sq: z.string().min(1).max(200),
  position_en: z.string().min(1).max(200),
  description_sq: z.string().min(1),
  description_en: z.string().min(1),
  location_sq: z.string().min(1).max(200),
  location_en: z.string().min(1).max(200),
  application_link: z.string().url().optional().or(z.literal('')),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function JobsManager() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { logAction } = useAuditLog();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const { data: newJob, error } = await supabase.from('jobs').insert([data as any]).select().single();
      if (error) throw error;
      return newJob;
    },
    onSuccess: async (newJob) => {
      await logAction('CREATE', 'jobs', newJob.id, null, newJob);
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast({ title: t('Puna u shtua!', 'Job added!') });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: t('Gabim', 'Error'), description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, oldData }: { id: string; data: Partial<JobFormData>; oldData: any }) => {
      const { error } = await supabase.from('jobs').update(data as any).eq('id', id);
      if (error) throw error;
      return { id, data, oldData };
    },
    onSuccess: async ({ id, data, oldData }) => {
      await logAction('UPDATE', 'jobs', id, oldData, data);
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast({ title: t('Puna u përditësua!', 'Job updated!') });
      setOpen(false);
      setEditingJob(null);
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: t('Gabim', 'Error'), description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, jobData }: { id: string; jobData: any }) => {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
      return { id, jobData };
    },
    onSuccess: async ({ id, jobData }) => {
      await logAction('DELETE', 'jobs', id, jobData, null);
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast({ title: t('Puna u fshi!', 'Job deleted!') });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: t('Gabim', 'Error'), description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: JobFormData = {
      business_name: formData.get('business_name') as string,
      position_sq: formData.get('position_sq') as string,
      position_en: formData.get('position_en') as string,
      description_sq: formData.get('description_sq') as string,
      description_en: formData.get('description_en') as string,
      location_sq: formData.get('location_sq') as string,
      location_en: formData.get('location_en') as string,
      application_link: formData.get('application_link') as string || undefined,
    };

    try {
      jobSchema.parse(data);
      if (editingJob) {
        updateMutation.mutate({ id: editingJob.id, data, oldData: editingJob });
      } else {
        createMutation.mutate(data);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('Gabim në validim', 'Validation error'), description: error.message });
    }
  };

  const openCreateDialog = () => {
    setEditingJob(null);
    setOpen(true);
  };

  const openEditDialog = (job: any) => {
    setEditingJob(job);
    setOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('Duke ngarkuar...', 'Loading...')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('Menaxho Punët', 'Manage Jobs')}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {t('Shto Punë', 'Add Job')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingJob ? t('Modifiko Punën', 'Edit Job') : t('Shto Punë të Re', 'Add New Job')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="business_name">{t('Emri i Biznesit', 'Business Name')}</Label>
                <Input id="business_name" name="business_name" defaultValue={editingJob?.business_name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position_sq">{t('Pozicioni (SHQ)', 'Position (SQ)')}</Label>
                  <Input id="position_sq" name="position_sq" defaultValue={editingJob?.position_sq} required />
                </div>
                <div>
                  <Label htmlFor="position_en">{t('Pozicioni (ENG)', 'Position (EN)')}</Label>
                  <Input id="position_en" name="position_en" defaultValue={editingJob?.position_en} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location_sq">{t('Vendndodhja (SHQ)', 'Location (SQ)')}</Label>
                  <Input id="location_sq" name="location_sq" defaultValue={editingJob?.location_sq} required />
                </div>
                <div>
                  <Label htmlFor="location_en">{t('Vendndodhja (ENG)', 'Location (EN)')}</Label>
                  <Input id="location_en" name="location_en" defaultValue={editingJob?.location_en} required />
                </div>
              </div>
              <div>
                <Label htmlFor="description_sq">{t('Përshkrimi (SHQ)', 'Description (SQ)')}</Label>
                <Textarea id="description_sq" name="description_sq" defaultValue={editingJob?.description_sq} rows={4} required />
              </div>
              <div>
                <Label htmlFor="description_en">{t('Përshkrimi (ENG)', 'Description (EN)')}</Label>
                <Textarea id="description_en" name="description_en" defaultValue={editingJob?.description_en} rows={4} required />
              </div>
              <div>
                <Label htmlFor="application_link">{t('Link për Aplikim', 'Application Link')}</Label>
                <Input id="application_link" name="application_link" type="url" defaultValue={editingJob?.application_link} />
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingJob ? t('Përditëso', 'Update') : t('Shto', 'Add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Biznesi', 'Business')}</TableHead>
              <TableHead>{t('Pozicioni', 'Position')}</TableHead>
              <TableHead>{t('Vendndodhja', 'Location')}</TableHead>
              <TableHead>{t('Veprime', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs?.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.business_name}</TableCell>
                <TableCell>{language === 'sq' ? job.position_sq : job.position_en}</TableCell>
                <TableCell>{language === 'sq' ? job.location_sq : job.location_en}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(job)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        if (confirm(t('Jeni i sigurt?', 'Are you sure?'))) {
                          deleteMutation.mutate({ id: job.id, jobData: job });
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
