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

const articleSchema = z.object({
  title_sq: z.string().min(1).max(300),
  title_en: z.string().min(1).max(300),
  content_sq: z.string().min(1),
  content_en: z.string().min(1),
  category_sq: z.string().min(1).max(100),
  category_en: z.string().min(1).max(100),
  image_url: z.string().url().optional().or(z.literal('')),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export default function ArticlesManager() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { logAction } = useAuditLog();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const { data: newArticle, error } = await supabase.from('articles').insert([data as any]).select().single();
      if (error) throw error;
      return newArticle;
    },
    onSuccess: async (newArticle) => {
      await logAction('CREATE', 'articles', newArticle.id, null, newArticle);
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({ title: t('Artikulli u shtua!', 'Article added!') });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: t('Gabim', 'Error'), description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, oldData }: { id: string; data: Partial<ArticleFormData>; oldData: any }) => {
      const { error } = await supabase.from('articles').update(data as any).eq('id', id);
      if (error) throw error;
      return { id, data, oldData };
    },
    onSuccess: async ({ id, data, oldData }) => {
      await logAction('UPDATE', 'articles', id, oldData, data);
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({ title: t('Artikulli u përditësua!', 'Article updated!') });
      setOpen(false);
      setEditingArticle(null);
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: t('Gabim', 'Error'), description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, articleData }: { id: string; articleData: any }) => {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
      return { id, articleData };
    },
    onSuccess: async ({ id, articleData }) => {
      await logAction('DELETE', 'articles', id, articleData, null);
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({ title: t('Artikulli u fshi!', 'Article deleted!') });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: t('Gabim', 'Error'), description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: ArticleFormData = {
      title_sq: formData.get('title_sq') as string,
      title_en: formData.get('title_en') as string,
      content_sq: formData.get('content_sq') as string,
      content_en: formData.get('content_en') as string,
      category_sq: formData.get('category_sq') as string,
      category_en: formData.get('category_en') as string,
      image_url: formData.get('image_url') as string || undefined,
    };

    try {
      articleSchema.parse(data);
      if (editingArticle) {
        updateMutation.mutate({ id: editingArticle.id, data, oldData: editingArticle });
      } else {
        createMutation.mutate(data);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('Gabim në validim', 'Validation error'), description: error.message });
    }
  };

  const openCreateDialog = () => {
    setEditingArticle(null);
    setOpen(true);
  };

  const openEditDialog = (article: any) => {
    setEditingArticle(article);
    setOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('Duke ngarkuar...', 'Loading...')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('Menaxho Artikujt', 'Manage Articles')}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {t('Shto Artikull', 'Add Article')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? t('Modifiko Artikullin', 'Edit Article') : t('Shto Artikull të Ri', 'Add New Article')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title_sq">{t('Titulli (SHQ)', 'Title (SQ)')}</Label>
                  <Input id="title_sq" name="title_sq" defaultValue={editingArticle?.title_sq} required />
                </div>
                <div>
                  <Label htmlFor="title_en">{t('Titulli (ENG)', 'Title (EN)')}</Label>
                  <Input id="title_en" name="title_en" defaultValue={editingArticle?.title_en} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category_sq">{t('Kategoria (SHQ)', 'Category (SQ)')}</Label>
                  <Input id="category_sq" name="category_sq" defaultValue={editingArticle?.category_sq} required />
                </div>
                <div>
                  <Label htmlFor="category_en">{t('Kategoria (ENG)', 'Category (EN)')}</Label>
                  <Input id="category_en" name="category_en" defaultValue={editingArticle?.category_en} required />
                </div>
              </div>
              <div>
                <Label htmlFor="content_sq">{t('Përmbajtja (SHQ)', 'Content (SQ)')}</Label>
                <Textarea id="content_sq" name="content_sq" defaultValue={editingArticle?.content_sq} rows={6} required />
              </div>
              <div>
                <Label htmlFor="content_en">{t('Përmbajtja (ENG)', 'Content (EN)')}</Label>
                <Textarea id="content_en" name="content_en" defaultValue={editingArticle?.content_en} rows={6} required />
              </div>
              <div>
                <Label htmlFor="image_url">{t('URL e Imazhit', 'Image URL')}</Label>
                <Input id="image_url" name="image_url" type="url" defaultValue={editingArticle?.image_url} />
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingArticle ? t('Përditëso', 'Update') : t('Shto', 'Add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Titulli', 'Title')}</TableHead>
              <TableHead>{t('Kategoria', 'Category')}</TableHead>
              <TableHead>{t('Data', 'Date')}</TableHead>
              <TableHead>{t('Veprime', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles?.map((article) => (
              <TableRow key={article.id}>
                <TableCell>{language === 'sq' ? article.title_sq : article.title_en}</TableCell>
                <TableCell>{language === 'sq' ? article.category_sq : article.category_en}</TableCell>
                <TableCell>{new Date(article.published_at!).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(article)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        if (confirm(t('Jeni i sigurt?', 'Are you sure?'))) {
                          deleteMutation.mutate({ id: article.id, articleData: article });
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
