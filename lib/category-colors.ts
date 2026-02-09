// Couleurs pastel assignées par index de catégorie (trié alphabétiquement)
export const categoryColors = [
  "#7CA5D8", // bleu
  "#D88C8C", // corail
  "#8BC49A", // vert sauge
  "#C9A0D8", // violet
  "#D8B86C", // ambre
  "#6CB8B8", // turquoise
  "#D87CAA", // rose
  "#8B8BD8", // indigo
  "#B8D86C", // lime
  "#D8A06C", // pêche
]

export function getCategoryColor(index: number): string {
  return categoryColors[index % categoryColors.length]
}
