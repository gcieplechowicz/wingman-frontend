"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

/**
 * Colors are the dataviz skill's pre-validated categorical palette slots
 * (violet/red, adjacent-pair CVD-checked), not this app's exact spark/violet
 * hex - the palette validator script requires a newer Node than this
 * environment has, so exact-hex substitution couldn't be re-validated here.
 * These slots were chosen specifically because they're the closest
 * pre-validated match to Wingman's own red/violet brand colors.
 */
const CONTACT_COLOR = "#4a3aa7"; // validated palette slot 7 (violet)
const ASSISTANT_COLOR = "#e34948"; // validated palette slot 8 (red)
const GRID_COLOR = "#E6E3ED"; // this app's `border` token
const AXIS_TEXT_COLOR = "#726C82"; // this app's `text-muted` token

type VolumePoint = {
  day: string;
  userMessageCount: number;
  assistantMessageCount: number;
};

export function MessageVolumeChart({ data }: { data: VolumePoint[] }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 md:p-6">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={(day: string) => format(parseISO(day), "d MMM")}
            interval={4}
            tick={{ fill: AXIS_TEXT_COLOR, fontSize: 11 }}
            axisLine={{ stroke: GRID_COLOR }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: AXIS_TEXT_COLOR, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<VolumeTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            height={32}
            iconType="line"
            formatter={(value) => <span className="text-xs text-text-muted">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="userMessageCount"
            name="Them"
            stroke={CONTACT_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="assistantMessageCount"
            name="Assistant"
            stroke={ASSISTANT_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function VolumeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-text-muted mb-1">{format(parseISO(label ?? ""), "EEE, d MMM")}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-0.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-medium text-text-primary">{entry.value}</span>
          <span className="text-text-muted">{entry.name}</span>
        </div>
      ))}
    </div>
  );
}
