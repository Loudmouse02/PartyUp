import { Campaign } from "@/types";

const STORAGE_KEY = "questtime_campaigns";

export function saveCampaign(campaign: Campaign): void {
  const campaigns = getAllCampaigns();
  const existingIndex = campaigns.findIndex((c) => c.id === campaign.id);
  
  if (existingIndex >= 0) {
    campaigns[existingIndex] = campaign;
  } else {
    campaigns.push(campaign);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

export function getCampaign(id: string): Campaign | null {
  const campaigns = getAllCampaigns();
  const campaign = campaigns.find((c) => c.id === id);
  
  if (!campaign) return null;
  
  // Convert date strings back to Date objects
  return {
    ...campaign,
    createdAt: new Date(campaign.createdAt),
    sessions: campaign.sessions.map((s) => ({
      ...s,
      dateTime: new Date(s.dateTime),
    })),
  };
}

export function getAllCampaigns(): Campaign[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const campaigns = JSON.parse(stored);
    // Convert date strings back to Date objects
    return campaigns.map((campaign: any) => ({
      ...campaign,
      createdAt: new Date(campaign.createdAt),
      sessions: campaign.sessions.map((s: any) => ({
        ...s,
        dateTime: new Date(s.dateTime),
      })),
    }));
  } catch {
    return [];
  }
}

export function deleteCampaign(id: string): void {
  const campaigns = getAllCampaigns();
  const filtered = campaigns.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

