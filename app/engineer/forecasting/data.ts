// data.ts
export type ConstructionData = {
  [mainTopic: string]: string[] | { [subTopic: string]: string[] };
};

export const constructionData: ConstructionData = {
  "Pre-Pour Checklist": {
    "Drawing & Documentation Approvals": [
      "Latest approved drawing available on-site",
      "Work inspected and approved by Engineer/Consultant",
      "Pour area marked and identified",
      "Checklist signed by Site Engineer",
      "Consultant/QA approval obtained",
      "Pour card filled and signed"
    ],
    "Shuttering / Formwork": [
      "Formwork dimensions checked (length, width, height)",
      "Formwork is properly aligned and level",
      "Formwork is tight (no leakage)",
      "Shuttering oil applied where needed",
      "Supports/bracings are secure"
    ]
  },
  "Foundation Pour Checklist": [
    "Excavation (L/B/H)",
    "Base Dressing",
    "Compaction",
    "PCC",
    "Centerline",
    "All Levels",
    "Formwork/Supports",
    "Reinforcement (L/Ø/)",
    "Embedded Items",
    "Concrete Grade",
    "Slump Test and Cube Casting",
    "Curing"
  ],
  "Beam Pour Checklist": [
    "Formwork dimension & alignment",
    "Reinforcement as per drawing",
    "Cover blocks provided",
    "Supports and bracings checked",
    "Conduits and sleeves placed",
    "Shuttering oil applied",
    "Concrete grade confirmed",
    "Slump Test and Cube Casting",
    "Proper vibration during pour",
    "Curing method available"
  ],
  "Column Pour Checklist": [
    "Centerline & verticality",
    "Formwork alignment & tightness",
    "Reinforcement as per drawing",
    "Cover blocks & stirrups",
    "Conduits & sleeves",
    "Shuttering oil applied",
    "Stability of formwork",
    "Concrete grade",
    "Slump Test and Cube Casting",
    "Cube sample",
    "Proper vibration",
    "Curing arrangements"
  ],
  "Slab Pour Checklist": [
    "Formwork level, slope, dimensions",
    "Props and supports spacing",
    "Reinforcement spacing & bends",
    "Cover blocks placement",
    "Conduits & sleeves",
    "Expansion joints & inserts",
    "Concrete grade",
    "Slump Test and Cube Casting",
    "Pour sequence planning",
    "Vibration and surface levelling",
    "Curing arrangements"
  ],
  "Staircase Pour Checklist": [
    "Shuttering dimensions and alignment",
    "Landing levels and rise/tread check",
    "Reinforcement as per drawing",
    "Cover blocks & stirrups",
    "Conduits and sleeves if any",
    "Shuttering oil",
    "Concrete grade",
    "Slump Test and Cube Casting",
    "Pouring sequence",
    "Vibration and levelling",
    "Curing"
  ],
  "Wall Pour Checklist": [
    "Shuttering plumb, alignment & tightness",
    "Reinforcement and spacing check",
    "Cover blocks & ties",
    "Openings and sleeves",
    "Shuttering oil",
    "Concrete grade",
    "Slump Test and Cube Casting",
    "Pouring in layers",
    "Vibration",
    "Curing"
  ]
};

export function validateConstructionData(data: ConstructionData): boolean {
  return Object.values(data).every((value) => {
    if (Array.isArray(value)) {
      return value.length > 0 && value.every((task) => typeof task === "string" && task.length > 0);
    } else if (typeof value === "object" && value !== null) {
      return Object.values(value).every(
        (subValue) =>
          Array.isArray(subValue) &&
          subValue.length > 0 &&
          subValue.every((task) => typeof task === "string" && task.length > 0)
      );
    }
    return false;
  });
}