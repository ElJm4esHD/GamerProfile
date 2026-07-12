/** Orden de scores: Gameplay, Story, Graphics, Sound, Originality, Emotional. */
export interface SeedGame {
  name: string;
  type: string;
  scores: readonly [number, number, number, number, number, number];
}

export const SEED_GAMES: readonly SeedGame[] = [
  { name: "Clair Obscur: Expedition 33", type: "Full Game", scores: [88, 100, 88, 94, 93, 95] },
  { name: "Death Stranding", type: "Full Game", scores: [86, 99, 87, 92, 90, 92] },
  { name: "Death Stranding 2: On the Beach", type: "Full Game", scores: [88, 93, 95, 83, 86, 100] },
  { name: "What Remains of Edith Finch", type: "Full Game", scores: [85, 98, 88, 82, 95, 92] },
  { name: "Hellblade: Senua's Sacrifice", type: "Full Game", scores: [83, 89, 85, 100, 87, 88] },
  { name: "A Plague Tale: Requiem", type: "Full Game", scores: [85, 89, 87, 92, 84, 89] },
  { name: "Outer Wilds", type: "Full Game", scores: [86, 96, 78, 93, 89, 84] },
  { name: "The Last of Us Part I", type: "Full Game", scores: [73, 96, 84, 89, 84, 92] },
  { name: "The Last of Us Part II", type: "Full Game", scores: [78, 85, 93, 85, 79, 90] },
  { name: "Still Wakes the Deep", type: "Full Game", scores: [72, 89, 93, 78, 87, 91] },
  { name: "A Plague Tale: Innocence", type: "Full Game", scores: [84, 83, 85, 87, 83, 78] },
  { name: "Return of the Obra Dinn", type: "Full Game", scores: [71, 88, 76, 77, 98, 73] },
  { name: "REANIMAL", type: "Full Game", scores: [68, 75, 94, 77, 83, 70] },
  { name: "Firewatch", type: "Full Game", scores: [65, 89, 62, 78, 70, 88] },
  { name: "Little Nightmares", type: "Full Game", scores: [59, 79, 89, 67, 90, 60] },
  { name: "Middle-earth: Shadow of Mordor", type: "Full Game", scores: [82, 75, 78, 68, 65, 72] },
  { name: "Metro Last Light Redux", type: "Full Game", scores: [62, 74, 77, 69, 70, 53] },
  { name: "Metro 2033 Redux", type: "Full Game", scores: [75, 70, 60, 69, 80, 50] },
  { name: "DOOM: The Dark Ages", type: "Full Game", scores: [86, 60, 71, 65, 70, 50] },
  { name: "Dishonored", type: "Full Game", scores: [74, 64, 78, 42, 72, 60] },
  { name: "Still Wakes the Deep: Siren's Rest", type: "DLC", scores: [49, 68, 63, 60, 70, 57] },
];