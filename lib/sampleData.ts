// A small stand-in for "the user's exported data". In a real product this would
// be the actual personal-data export; for the demo we generate a compact object.

export interface SampleExport {
  schema: string;
  owner: string;
  exportedAt: string;
  profile: { displayName: string; email: string; country: string };
  preferences: { newsletter: boolean; theme: string };
  activity: { type: string; at: string; detail?: string }[];
}

// The category label that goes into the signed consent receipt.
export const DATA_CATEGORY = "profile_export";

export function makeSampleExport(owner: string): SampleExport {
  return {
    schema: "myranda.export.v1",
    owner,
    exportedAt: new Date().toISOString(),
    profile: {
      displayName: "Demo User",
      email: "demo@example.com",
      country: "US",
    },
    preferences: { newsletter: true, theme: "dark" },
    activity: [
      { type: "login", at: "2026-06-01T10:00:00Z" },
      { type: "purchase", at: "2026-06-05T14:30:00Z", detail: "Pro plan" },
    ],
  };
}
