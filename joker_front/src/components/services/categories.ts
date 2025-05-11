export interface Category {
  id: number;
  name: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Tous",
    image: "Group 6.png",
  },
  {
    id: 2,
    name: "Homme",
    image: "tshirt.jpg",
  },
  {
    id: 3,
    name: "Femme",
    image: "tshirt.jpg",
  },
  {
    id: 4,
    name: "Accessoire",
    image: "adidas.png",
  },
  // {
  //   id: 5,
  //   name: "Cartes Visites",
  //   image: "model.png",
  // },
];
