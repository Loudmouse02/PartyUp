"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, X, HelpCircle, Wand2, Sword, Eye, Share2 } from "lucide-react";
import Link from "next/link";
import { Campaign, Player, Session, PlayerClass, VoteValue } from "@/types";
import { supabase } from "@/lib/supabase";
import TimezoneDisplay from "@/components/TimezoneDisplay";

const PLAYER_CLASSES: Array<{ value: PlayerClass; icon: React.ReactNode; label: string }> = [
  { value: "wizard", icon: <Wand2 className="w-5 h-5" />, label: "Wizard" },
  { value: "fighter", icon: <Sword className="w-5 h-5" />, label: "Fighter" },
  { value: "rogue", icon: <Eye className="w-5 h-5" />, label: "Rogue" },
];

interface DatabaseCampaign {
  id: string;
  title: string;
  dm_name: string;
  timezone: string;
  dates: Array<{ id: string; dateTime: string; timezone: string }>;
  created_at: string;
}

interface DatabaseVote {
  id: string;
  campaign_id: string;
  player_name: string;
  availability: Record<string, VoteValue>;
  created_at: string;
}

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerClass, setPlayerClass] = useState<PlayerClass>("wizard");
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [votes, setVotes] = useState<Record<string, VoteValue>>({});
  const [shareCopied, setShareCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch campaign
        const { data: campaignData, error: campaignError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", campaignId)
          .single();

        if (campaignError) {
          throw campaignError;
        }

        if (!campaignData) {
          router.push("/");
          return;
        }

        const dbCampaign = campaignData as DatabaseCampaign;

        // Transform database campaign to app campaign format
        const sessions: Session[] = dbCampaign.dates.map((dateObj) => ({
          id: dateObj.id,
          campaignId: dbCampaign.id,
          dateTime: new Date(dateObj.dateTime),
          timezone: dateObj.timezone,
        }));

        const transformedCampaign: Campaign = {
          id: dbCampaign.id,
          name: dbCampaign.title,
          dmName: dbCampaign.dm_name,
          dmTimezone: dbCampaign.timezone,
          sessions,
          players: [], // We'll load players from votes if needed
          votes: [],
          createdAt: new Date(dbCampaign.created_at),
        };

        setCampaign(transformedCampaign);

        // Load existing player from localStorage if they've voted before
        const savedPlayerName = localStorage.getItem(`partyup_player_${campaignId}`);
        if (savedPlayerName) {
          setPlayerName(savedPlayerName);
          
          // Fetch their votes
          const { data: voteData, error: voteError } = await supabase
            .from("votes")
            .select("*")
            .eq("campaign_id", campaignId)
            .eq("player_name", savedPlayerName)
            .single();

          if (!voteError && voteData) {
            const dbVote = voteData as DatabaseVote;
            setVotes(dbVote.availability || {});
            
            // Create player object from saved name
            setCurrentPlayer({
              id: savedPlayerName, // Use name as ID for simplicity
              name: savedPlayerName,
              class: playerClass, // Default, could be stored separately if needed
            });
          }
        }
      } catch (err: any) {
        console.error("Error fetching campaign:", err);
        setError(err.message || "Failed to load campaign");
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId, router]);

  const handleSetPlayer = async () => {
    if (!playerName.trim() || !campaign) return;

    const player: Player = {
      id: playerName, // Use name as ID
      name: playerName,
      class: playerClass,
    };

    setCurrentPlayer(player);
    localStorage.setItem(`partyup_player_${campaignId}`, playerName);

    // Check if player has existing votes and load them
    const { data: voteData, error: voteError } = await supabase
      .from("votes")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("player_name", playerName)
      .maybeSingle();

    if (!voteError && voteData) {
      const dbVote = voteData as DatabaseVote;
      setVotes(dbVote.availability || {});
    }
  };

  const handleVote = async (sessionId: string, value: VoteValue) => {
    if (!currentPlayer || !campaign) return;

    const newVotes = { ...votes, [sessionId]: value };
    setVotes(newVotes);

    try {
      // Check if vote exists
      const { data: existingVote } = await supabase
        .from("votes")
        .select("id")
        .eq("campaign_id", campaignId)
        .eq("player_name", currentPlayer.name)
        .maybeSingle();

      if (existingVote) {
        // Update existing vote
        const { error: updateError } = await supabase
          .from("votes")
          .update({ availability: newVotes })
          .eq("campaign_id", campaignId)
          .eq("player_name", currentPlayer.name);

        if (updateError) throw updateError;
      } else {
        // Insert new vote
        const { error: insertError } = await supabase
          .from("votes")
          .insert({
            campaign_id: campaignId,
            player_name: currentPlayer.name,
            availability: newVotes,
          });

        if (insertError) throw insertError;
      }
    } catch (err: any) {
      console.error("Error saving vote:", err);
      // Revert the vote on error
      setVotes(votes);
      alert("Failed to save vote. Please try again.");
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => {
        setShareCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center">
        <p>Loading campaign...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Campaign not found"}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-200 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {shareCopied ? "Copied!" : "Share Campaign"}
          </button>
        </div>

        {/* Campaign Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            {campaign.name}
          </h1>
          <p className="text-slate-400">
            DM: {campaign.dmName} • Your timezone: {userTimezone}
          </p>
        </div>

        {/* Player Identity Section */}
        {!currentPlayer ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Player Identity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200"
                  placeholder="Enter your character or player name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Class Icon
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PLAYER_CLASSES.map((pc) => (
                    <button
                      key={pc.value}
                      type="button"
                      onClick={() => setPlayerClass(pc.value)}
                      className={`flex flex-col items-center gap-2 px-4 py-3 border rounded-lg transition-all ${
                        playerClass === pc.value
                          ? "border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      {pc.icon}
                      <span className="text-sm">{pc.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSetPlayer}
                disabled={!playerName.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-slate-900 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {currentPlayer.name}
                </h2>
                <div className="flex items-center gap-2 text-slate-400">
                  {PLAYER_CLASSES.find((pc) => pc.value === currentPlayer.class)
                    ?.icon}
                  <span>
                    {
                      PLAYER_CLASSES.find(
                        (pc) => pc.value === currentPlayer.class
                      )?.label
                    }
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentPlayer(null);
                  setPlayerName("");
                  setVotes({});
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
              >
                Change Player
              </button>
            </div>
          </div>
        )}

        {/* Voting Grid */}
        {currentPlayer && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Vote on Session Times</h2>
            <p className="text-slate-400 mb-6">
              All times are displayed in your local timezone
            </p>
            <div className="space-y-4">
              {campaign.sessions.map((session) => {
                const vote = votes[session.id] || null;
                return (
                  <div
                    key={session.id}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <TimezoneDisplay
                          utcDate={session.dateTime}
                          className="text-lg font-semibold"
                        />
                      </div>
                      <div className="flex gap-2">
                        {/* Yes Button */}
                        <button
                          onClick={() => handleVote(session.id, "yes")}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            vote === "yes"
                              ? "bg-green-500/20 border-green-500 text-green-400"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-green-500 hover:text-green-400"
                          }`}
                          title="Yes, I can make it"
                        >
                          <Check className="w-6 h-6" />
                        </button>
                        {/* Maybe Button */}
                        <button
                          onClick={() => handleVote(session.id, "maybe")}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            vote === "maybe"
                              ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-yellow-500 hover:text-yellow-400"
                          }`}
                          title="Maybe, I might be able to make it"
                        >
                          <HelpCircle className="w-6 h-6" />
                        </button>
                        {/* No Button */}
                        <button
                          onClick={() => handleVote(session.id, "no")}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            vote === "no"
                              ? "bg-red-500/20 border-red-500 text-red-400"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-red-500 hover:text-red-400"
                          }`}
                          title="No, I can't make it"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

