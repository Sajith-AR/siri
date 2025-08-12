export type Reference = { title: string; url: string };

const KNOWN: Record<string, Reference[]> = {
  "Common cold": [
    { title: "CDC - Common Cold", url: "https://www.cdc.gov/antibiotic-use/colds.html" },
    { title: "NHS - Common cold", url: "https://www.nhs.uk/conditions/common-cold/" },
  ],
  "Viral infection": [
    { title: "WHO - Viral diseases", url: "https://www.who.int/health-topics/viral-diseases" },
  ],
  "Dehydration": [
    { title: "Mayo Clinic - Dehydration", url: "https://www.mayoclinic.org/diseases-conditions/dehydration/" },
  ],
  "Possible cardiac issue": [
    { title: "CDC - Heart Attack", url: "https://www.cdc.gov/heartdisease/heart_attack.htm" },
  ],
};

export function getReferences(names: string[]): Reference[] {
  const out: Reference[] = [];
  for (const n of names) {
    const refs = KNOWN[n];
    if (refs) out.push(...refs);
  }
  return out.slice(0, 5);
}


