/**
 * Images Cloudinary redimensionnées à la volée (format et qualité automatiques) :
 * une vignette de liste ne télécharge pas la photo d'origine.
 */
export function cdn(url: string | null | undefined, width: number) {
  if (!url) return null;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/c_limit,w_${width},q_auto,f_auto/`);
}
