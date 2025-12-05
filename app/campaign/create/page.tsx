"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { zonedTimeToUtc } from "date-fns-tz";
import { supabase } from "@/lib/supabase";

// Common timezones for D&D players
const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona Time (MST)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const [campaignName, setCampaignName] = useState("");
  const [dmName, setDmName] = useState("");
  const [dmTimezone, setDmTimezone] = useState("");
  const [sessions, setSessions] = useState<
    Array<{ date: string; time: string }>
  >([{ date: "", time: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSession = () => {
    setSessions([...sessions, { date: "", time: "" }]);
  };

  const handleRemoveSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const handleSessionChange = (
    index: number,
    field: "date" | "time",
    value: string
  ) => {
    const updated = [...sessions];
    updated[index][field] = value;
    setSessions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!campaignName || !dmName || !dmTimezone) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Create sessions from date/time inputs
    const sessionObjects = sessions
      .filter((s) => s.date && s.time)
      .map((s) => {
        // Combine date and time - this creates a date string in local time
        // We need to interpret this as being in the DM's timezone
        const localDateTimeString = `${s.date}T${s.time}:00`;
        
        // Convert the local date/time string to UTC, treating it as if it's in the DM's timezone
        const utcDate = zonedTimeToUtc(localDateTimeString, dmTimezone);

        return {
          id: crypto.randomUUID(),
          dateTime: utcDate.toISOString(),
          timezone: dmTimezone,
        };
      });

    if (sessionObjects.length === 0) {
      setError("Please add at least one session date and time");
      setIsSubmitting(false);
      return;
    }

    try {
      // Insert campaign into Supabase
      const { data, error: insertError } = await supabase
        .from("campaigns")
        .insert({
          title: campaignName,
          dm_name: dmName,
          timezone: dmTimezone,
          dates: sessionObjects,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (!data) {
        throw new Error("Failed to create campaign");
      }

      // Redirect to voting page
      router.push(`/campaign/${data.id}/vote`);
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      setError(err.message || "Failed to create campaign. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          Create Campaign
        </h1>
        <p className="text-slate-400 mb-8">
          Set up your D&D campaign and propose session times
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200"
              placeholder="The Lost Mines of Phandelver"
              required
            />
          </div>

          {/* DM Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Dungeon Master Name *
            </label>
            <input
              type="text"
              value={dmName}
              onChange={(e) => setDmName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200"
              placeholder="Your name"
              required
            />
          </div>

          {/* DM Timezone */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Timezone *
            </label>
            <select
              value={dmTimezone}
              onChange={(e) => setDmTimezone(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200"
              required
            >
              <option value="">Select your timezone</option>
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Session Times */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Proposed Session Times *
            </label>
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="date"
                    value={session.date}
                    onChange={(e) =>
                      handleSessionChange(index, "date", e.target.value)
                    }
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200"
                  />
                  <input
                    type="time"
                    value={session.time}
                    onChange={(e) =>
                      handleSessionChange(index, "time", e.target.value)
                    }
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200"
                  />
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSession(index)}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSession}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Another Time
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-slate-900 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? "Creating Campaign..." : "Create Campaign & Get Voting Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

