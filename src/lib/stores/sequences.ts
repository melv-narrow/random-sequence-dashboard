import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Sequence } from '@/types'

interface SequencesState {
  sequences: Sequence[]
  addSequence: (sequence: Sequence) => void
  clearSequences: () => void
  removeSequence: (id: string) => void
}

export const useSequencesStore = create<SequencesState>()(
  persist(
    (set) => ({
      sequences: [],
      addSequence: (sequence) => 
        set((state) => ({
          sequences: [...state.sequences, sequence]
        })),
      clearSequences: () => set({ sequences: [] }),
      removeSequence: (id) =>
        set((state) => ({
          sequences: state.sequences.filter((seq) => seq._id !== id)
        })),
    }),
    {
      name: 'sequences-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
