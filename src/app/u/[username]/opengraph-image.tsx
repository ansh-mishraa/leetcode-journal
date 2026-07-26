import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { getAggregatedProfile } from "@/server/aggregation";
import { SKILL_BANDS, type SkillBandKey } from "@/lib/spectrum";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ username: string }> };

export default async function OgImage({ params }: Props) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !user.isPublic) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#12151C",
            color: "#E8E9EC",
            fontSize: 48,
          }}
        >
          LeetCode Journal
        </div>
      ),
      { ...size },
    );
  }

  const profile = await getAggregatedProfile(user.id);
  const band = (profile?.skillBand ?? "NEWCOMER") as SkillBandKey;
  const color = SKILL_BANDS[band].hex;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#12151C",
          color: "#E8E9EC",
          padding: 64,
          fontFamily: "ui-monospace, monospace",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, color: "#8A8F98" }}>LeetCode Journal</div>
            <div style={{ fontSize: 64, marginTop: 12 }}>@{username}</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 24,
              color,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: color,
              }}
            />
            {SKILL_BANDS[band].label}
          </div>
        </div>

        <div style={{ display: "flex", gap: 48 }}>
          <Stat label="SOLVED" value={String(profile?.totals.solved ?? 0)} />
          <Stat label="EASY" value={String(profile?.totals.easy ?? 0)} color="#10B981" />
          <Stat label="MED" value={String(profile?.totals.medium ?? 0)} color="#F59E0B" />
          <Stat label="HARD" value={String(profile?.totals.hard ?? 0)} color="#EF4444" />
        </div>

        <div
          style={{
            display: "flex",
            height: 4,
            width: "100%",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div style={{ flexGrow: profile?.totals.easy ?? 0, background: "#10B981" }} />
          <div style={{ flexGrow: profile?.totals.medium ?? 0, background: "#F59E0B" }} />
          <div style={{ flexGrow: profile?.totals.hard ?? 0, background: "#EF4444" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}

function Stat({
  label,
  value,
  color = "#E8E9EC",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 18, color: "#8A8F98", letterSpacing: 2 }}>{label}</div>
      <div style={{ fontSize: 56, color, marginTop: 8 }}>{value}</div>
    </div>
  );
}
