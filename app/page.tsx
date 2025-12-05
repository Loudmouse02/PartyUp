"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sword, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8 max-w-3xl">
          {/* Logo/Title */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Sword className="w-16 h-16 text-amber-500" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              Party Up
            </h1>
            <Sparkles className="w-16 h-16 text-amber-500" />
          </div>

          <p className="text-xl text-slate-300 mb-4">
            Schedule your D&D campaigns with ease
          </p>
          <p className="text-lg text-slate-400 mb-12">
            Create sessions, share with players, and find the perfect time for
            your next adventure
          </p>

          {/* CTA Button */}
          <Link
            href="/campaign/create"
            className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Create Campaign
          </Link>
        </div>
      </div>
    </div>
  );
}

