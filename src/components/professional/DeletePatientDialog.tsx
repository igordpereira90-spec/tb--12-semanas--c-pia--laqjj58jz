import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { deleteUser } from '@/services/users'
import type { AppUser } from '@/services/users'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Trash2 } from 'lucide-react'

interface Props {
  patient: AppUser
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

export function DeletePatientDialog({ patient, open, onOpenChange, onDeleted }: Props) {
  const { toast } = useToast()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteUser(patient.id)
      toast({ title: 'Sucesso', description: 'Paciente removido com sucesso.' })
      onOpenChange(false)
      onDeleted()
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir o paciente. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl text-slate-800">Excluir Paciente</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600">
            Tem certeza de que deseja excluir este paciente? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={deleting}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Excluindo
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
