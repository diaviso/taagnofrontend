import type { Metadata } from "next";
import { PublicProfileView } from "@/components/people/public-profile";
import { serverGet } from "@/lib/server-api";
import { shortName, type PublicProfile } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

const getProfile = (id: string) => serverGet<PublicProfile>(`/users/${encodeURIComponent(id)}/public`, 120);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getProfile(id);
  return p ? { title: `${shortName(p)} sur Taagno`, description: `Profil, avis et trajets de ${shortName(p)} sur Taagno.` } : { title: "Profil" };
}

export default async function MemberPage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfile(id);
  return <PublicProfileView id={id} initial={profile} />;
}
