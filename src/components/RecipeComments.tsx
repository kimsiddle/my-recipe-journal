import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Send, MessageSquare, X, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage } from '@/lib/imageUtils';

interface Comment {
  id: string;
  author_name: string;
  text: string;
  photo_url?: string;
  created_at: string;
}

interface RecipeCommentsProps {
  recipeId: string;
  isOwner: boolean;
}

export function RecipeComments({ recipeId, isOwner }: RecipeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('recipe_comments')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: true });
    setComments((data as Comment[]) || []);
  }, [recipeId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const compressed = await compressImage(reader.result as string, 800, 0.6);
        setPhotoPreview(compressed);
      } catch {
        setPhotoPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('recipe_comments').insert({
      recipe_id: recipeId,
      author_name: name.trim(),
      text: text.trim(),
      photo_url: photoPreview || null,
    } as any);
    setSubmitting(false);
    if (error) { toast.error('Failed to post comment'); return; }
    setText('');
    setPhotoPreview(null);
    toast.success('Comment posted!');
    fetchComments();
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from('recipe_comments').delete().eq('id', deleteId);
    setDeleteId(null);
    fetchComments();
  };

  const handleDeletePhoto = async (commentId: string) => {
    const { error } = await supabase
      .from('recipe_comments')
      .update({ photo_url: null } as any)
      .eq('id', commentId);
    if (error) { toast.error('Failed to remove photo'); return; }
    fetchComments();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-display">Comments</h2>
        <span className="text-sm text-muted-foreground">({comments.length})</span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <form onSubmit={handleSubmit} className="mb-4 bg-card border rounded-lg p-3 space-y-3">
        <Input
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <Textarea
          placeholder="Leave a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          required
        />
        {photoPreview && (
          <div className="relative inline-block">
            <img src={photoPreview} alt="Attachment preview" className="h-20 w-20 rounded-md object-cover border" />
            <button
              type="button"
              onClick={() => setPhotoPreview(null)}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="h-3.5 w-3.5 mr-1" />
            Photo
          </Button>
          <Button size="sm" type="submit" disabled={submitting || !name.trim() || !text.trim()}>
            <Send className="h-3.5 w-3.5 mr-1" />
            Post
          </Button>
        </div>
      </form>

      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="group relative bg-card border rounded-lg p-4 transition-shadow hover:shadow-sm">
              <p className="text-sm font-medium">{c.author_name}</p>
              <p className="text-sm leading-relaxed mt-1 pr-6">{c.text}</p>
              {c.photo_url && (
                <div className="relative inline-block mt-2">
                  <img
                    src={c.photo_url}
                    alt="Comment attachment"
                    className="rounded-md max-h-48 object-cover cursor-pointer border"
                    onClick={() => window.open(c.photo_url, '_blank')}
                  />
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(c.id)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">{formatDate(c.created_at)}</p>
              {isOwner && (
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  title="Delete comment"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove comment?</DialogTitle>
            <DialogDescription>This action can't be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Remove</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
