export interface ServiceItem {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  linkPath?: string;
}

export const servicesData: ServiceItem[] = [
  {
    id: 1,
    name: "T-Shirt Noir",
    price: "1500 DA",
    image: "/blackshirt.png",
    category: "Homme",
    linkPath: "tshirt",
  },
  {
    id: 2,
    name: "T-Shirt Classique",
    price: "850 DA",
    image: "/tshirt.png",
    category: "Homme",
    linkPath: "tshirt",
  },

  {
    id: 4,
    name: "T-Shirt Blanc",
    price: "750 DA",
    image: "/white shirt.png",
    category: "Femme",
    linkPath: "tshirt",
  },

  {
    id: 6,
    name: "T-Shirt Mode",
    price: "1000 DA",
    image: "/805shirt.png",
    category: "Femme",
    linkPath: "tshirt",
  },

  {
    id: 9,
    name: "Casquette",
    price: "800 DA",
    image: "/adidas.png",
    category: "Accessoire", // Changed to match UI category name
    linkPath: "hat",
  },
  
];
