import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileView } from "@/components/people/public-profile";
import { isUuid, serverFetch } from "@/lib/server-api";
import { shortName, type PublicProfile } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

const fetchProfile = (id: string) => serverFetch<PublicProfile>(`/users/${encodeURIComponent(id)}/public`, 120);
const getProfile = async (id: string) => (await fetchProfile(id)).data;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getProfile(id);
  return p ? { title: `${shortName(p)} sur Taagno`, description: `Profil, avis et trajets de ${shortName(p)} sur Taagno.` } : { title: "Profil" };
}

export default async function MemberPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { data: profile, notFound: missing } = await fetchProfile(id);
  if (missing) notFound();
  return <PublicProfileView id={id} initial={profile} />;
}
