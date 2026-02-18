/** Top US dog breeds (AKC registration) + Mixed / Other. Sorted A-Z. */
export const BREEDS = [
  "Australian Shepherd",
  "Beagle",
  "Bernese Mountain Dog",
  "Boston Terrier",
  "Boxer",
  "Bulldog",
  "Cavalier King Charles Spaniel",
  "Dachshund",
  "Doberman Pinscher",
  "French Bulldog",
  "German Shepherd",
  "German Shorthaired Pointer",
  "Golden Retriever",
  "Labrador Retriever",
  "Miniature Schnauzer",
  "Pembroke Welsh Corgi",
  "Poodle",
  "Rottweiler",
  "Shih Tzu",
  "Siberian Husky",
  "Yorkshire Terrier",
  "Mixed Breed",
  "Other",
] as const;

export type Breed = (typeof BREEDS)[number];
