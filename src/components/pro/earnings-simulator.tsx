"use client";

import { KeyRound, Route } from "lucide-react";
import { useState } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Segmented } from "@/components/ui/misc";
import { fcfa } from "@/lib/format";

function Slider({ label, value, onChange, min, max, step, format }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; format: (v: number) => string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[14px]">
        <span className="font-semibold text-ink-soft">{label}</span>
        <span className="font-extrabold text-ink">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2.5 h-2 w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
        style={{ background: `linear-gradient(90deg, var(--brand) ${pct}%, var(--line) ${pct}%)` }}
      />
    </label>
  );
}

/** « Combien pouvez-vous gagner ? » : estimation mensuelle. */
export function EarningsSimulator() {
  const [mode, setMode] = useState<"carpool" | "rental">("carpool");
  const [trips, setTrips] = useState(8);
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState(5000);
  const [days, setDays] = useState(10);
  const [dayPrice, setDayPrice] = useState(30000);
  const total = mode === "carpool" ? trips * seats * price : days * dayPrice;

  return (
    <div className="grid gap-6 rounded-[28px] border border-line/70 bg-white p-6 shadow-lift sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div>
        <Segmented
          layoutId="simulator"
          value={mode}
          onChange={setMode}
          options={[
            { value: "carpool", label: <span className="flex items-center gap-1.5"><Route className="h-4 w-4" /> Covoiturage</span> },
            { value: "rental", label: <span className="flex items-center gap-1.5"><KeyRound className="h-4 w-4" /> Location</span> },
          ]}
        />
        <div className="mt-7 space-y-6">
          {mode === "carpool" ? (
            <>
              <Slider label="Trajets par mois" value={trips} onChange={setTrips} min={1} max={30} step={1} format={(v) => `${v}`} />
              <Slider label="Places remplies par trajet" value={seats} onChange={setSeats} min={1} max={6} step={1} format={(v) => `${v}`} />
              <Slider label="Prix par place" value={price} onChange={setPrice} min={1000} max={15000} step={500} format={fcfa} />
            </>
          ) : (
            <>
              <Slider label="Jours loués par mois" value={days} onChange={setDays} min={1} max={30} step={1} format={(v) => `${v} j`} />
              <Slider label="Prix par jour" value={dayPrice} onChange={setDayPrice} min={10000} max={100000} step={2500} format={fcfa} />
            </>
          )}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[24px] bg-aurora p-7 text-white">
        <div className="dot-grid absolute inset-0 opacity-50" />
        <div className="relative">
          <p className="text-[14px] font-bold text-white/85">Vous pourriez gagner environ</p>
          <p className="mt-2 text-[40px] font-extrabold leading-none tracking-tight sm:text-[46px]">
            <AnimatedNumber value={total} format={fcfa} duration={0.6} />
          </p>
          <p className="mt-1 text-[14px] font-semibold text-white/85">par mois, sans commission</p>
          <p className="mt-6 text-[12.5px] leading-relaxed text-white/70">
            Estimation indicative : vous fixez vos prix et vous êtes payé directement par vos passagers ou vos locataires.
          </p>
        </div>
      </div>
    </div>
  );
}
