export type AvatarSubject = {
  id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  avatar_emoji?: string | null;
};

const GRADIENTS = [
  'from-teal-500 to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
];

export function getAvatarGradient(id?: string | null): string {
  if (!id) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}
