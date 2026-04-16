export interface ScaleDefinition {
  name: string;
  intervals: number[];
  degreeNames: string[];
}

export const SCALES: ScaleDefinition[] = [
  { name: "Major",            intervals: [0,2,4,5,7,9,11],      degreeNames: ["1","2","3","4","5","6","7"] },
  { name: "Natural Minor",    intervals: [0,2,3,5,7,8,10],      degreeNames: ["1","2","b3","4","5","b6","b7"] },
  { name: "Harmonic Minor",   intervals: [0,2,3,5,7,8,11],      degreeNames: ["1","2","b3","4","5","b6","7"] },
  { name: "Melodic Minor",    intervals: [0,2,3,5,7,9,11],      degreeNames: ["1","2","b3","4","5","6","7"] },
  { name: "Pentatonic Major", intervals: [0,2,4,7,9],           degreeNames: ["1","2","3","5","6"] },
  { name: "Pentatonic Minor", intervals: [0,3,5,7,10],          degreeNames: ["1","b3","4","5","b7"] },
  { name: "Blues",            intervals: [0,3,5,6,7,10],        degreeNames: ["1","b3","4","b5","5","b7"] },
  { name: "Dorian",           intervals: [0,2,3,5,7,9,10],      degreeNames: ["1","2","b3","4","5","6","b7"] },
  { name: "Phrygian",         intervals: [0,1,3,5,7,8,10],      degreeNames: ["1","b2","b3","4","5","b6","b7"] },
  { name: "Lydian",           intervals: [0,2,4,6,7,9,11],      degreeNames: ["1","2","3","#4","5","6","7"] },
  { name: "Mixolydian",       intervals: [0,2,4,5,7,9,10],      degreeNames: ["1","2","3","4","5","6","b7"] },
  { name: "Whole Tone",       intervals: [0,2,4,6,8,10],        degreeNames: ["1","2","3","#4","#5","b7"] },
  { name: "Diminished (HW)",  intervals: [0,1,3,4,6,7,9,10],    degreeNames: ["1","b2","b3","3","b5","5","6","b7"] },
  { name: "Chromatic",        intervals: [0,1,2,3,4,5,6,7,8,9,10,11], degreeNames: ["1","b2","2","b3","3","4","b5","5","b6","6","b7","7"] },
];
