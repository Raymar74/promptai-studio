import { useNavigate } from 'react-router-dom';
import { CharacterForge } from '@/components/character-forge/CharacterForge';
import { CharacterProfileSchema } from '@/types/character';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { saveCharacterProfile } from '@/lib/character';

export default function CharacterForgePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleComplete = async (character: CharacterProfileSchema, draftCharacterId?: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión para guardar un personaje");
      return;
    }

    try {
      await saveCharacterProfile(user.id, character, draftCharacterId);
      // Draft completed — remove from localStorage
      localStorage.removeItem('character_forge_draft');
      localStorage.removeItem('character_forge_draft_id');
      toast.success("Personaje guardado con éxito");
      navigate('/characters');
    } catch (e: any) {
      console.error(e);
      toast.error("Error al guardar el personaje: " + e.message);
    }
  };

  const handleCancel = () => {
    navigate('/characters');
  };

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Debes iniciar sesión para crear personajes.</p>
      </div>
    );
  }

  return (
    <div className="container py-10 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full">
        <CharacterForge userId={user.id} onComplete={handleComplete} onCancel={handleCancel} />
      </div>
    </div>
  );
}
