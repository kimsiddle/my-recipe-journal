import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '@/context/RecipeContext';
import { RecipeDetail } from '@/components/RecipeDetail';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const RecipePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipe, deleteRecipe, updateRecipe, addNote, deleteNote, addPhoto, deletePhoto, addCookLog, deleteCookLog } = useRecipes();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const recipe = id ? getRecipe(id) : undefined;

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Recipe not found.</p>
        <Button variant="link" onClick={() => navigate('/')}>Back to recipes</Button>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteRecipe(recipe.id);
    setDeleteConfirm(false);
    navigate('/');
    toast.success('Recipe deleted');
  };

  return (
    <div className="px-4 py-8">
      <RecipeDetail
        recipe={recipe}
        onBack={() => navigate('/')}
        onEdit={() => navigate(`/recipe/${recipe.id}/edit`)}
        onDelete={() => setDeleteConfirm(true)}
        onAddNote={async (text) => {
          await addNote(recipe.id, text);
          toast.success('Note added!');
        }}
        onDeleteNote={async (noteId) => {
          await deleteNote(recipe.id, noteId);
          toast.success('Note removed');
        }}
        onRatingChange={async (rating) => {
          await updateRecipe(recipe.id, { ...recipe, rating });
          toast.success('Rating updated!');
        }}
        onAddPhoto={async (dataUrl) => {
          await addPhoto(recipe.id, dataUrl);
          toast.success('Photo added!');
        }}
        onDeletePhoto={async (photoId) => {
          await deletePhoto(recipe.id, photoId);
          toast.success('Photo removed');
        }}
        onAddCookLog={async (entry) => {
          await addCookLog(recipe.id, entry);
          toast.success('Cook log added!');
        }}
        onDeleteCookLog={async (logId) => {
          await deleteCookLog(recipe.id, logId);
          toast.success('Cook log removed');
        }}
      />
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete recipe?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipePage;
