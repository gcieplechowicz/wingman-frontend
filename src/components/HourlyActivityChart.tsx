"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Same "contact" entity color as MessageVolumeChart - color follows the entity, not the chart. */
const CONTACT_COLOR = "#4a3aa7";
const GRID_COLOR = "#E6E3ED";
const AXIS_TEXT_COLOR = "#726C82";

function hourLabel(hour: number): string {
  if (hour === 0) return "12a";
  if (hour === 12) return "12p";
  return hour < 12 ? `${hour}a` : `${hour - 12}p`;
}

export function HourlyActivityChart({ data }: { data: { hour: number; messageCount: number }[] }) {
  const chartData = data.map((point) => ({ ...point, label: hourLabel(point.hour) }));

  return (
    <div>
      <div className="bg-surface border border-border rounded-2xl p-4 md:p-6">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="20%">
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="label"
              interval={1}
              tick={{ fill: AXIS_TEXT_COLOR, fontSize: 10 }}
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
            <Tooltip content={<HourTooltip />} cursor={{ fill: GRID_COLOR, opacity: 0.4 }} />
            <Bar dataKey="messageCount" name="Messages" fill={CONTACT_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-text-muted mt-2">
        Hours shown in UTC — Telegram doesn't expose a contact's local timezone.
      </p>
    </div>
  );
}

function HourTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CONTACT_COLOR }} />
        <span className="font-medium text-text-primary">{payload[0].value}</span>
        <span className="text-text-muted">messages at {label} UTC</span>
      </div>
    </div>
  );
}
