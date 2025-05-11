interface City {
  id: number;
  name: string;
  wilayaCode: string;
}

interface Wilaya {
  code: string;
  name: string;
  cities: City[];
}

export const algerianWilayas: Wilaya[] = [
  {
    code: "01",
    name: "Adrar",
    cities: [
      { id: 1, name: "Adrar", wilayaCode: "01" },
      { id: 2, name: "Reggane", wilayaCode: "01" },
      { id: 3, name: "Timimoun", wilayaCode: "01" }
    ]
  },
  {
    code: "16",
    name: "Alger",
    cities: [
      { id: 4, name: "Alger Centre", wilayaCode: "16" },
      { id: 5, name: "Bab El Oued", wilayaCode: "16" },
      { id: 6, name: "Hussein Dey", wilayaCode: "16" },
      { id: 7, name: "Bab Ezzouar", wilayaCode: "16" }
    ]
  },
  {
    code: "31",
    name: "Oran",
    cities: [
      { id: 8, name: "Oran", wilayaCode: "31" },
      { id: 9, name: "Ain Turk", wilayaCode: "31" },
      { id: 10, name: "Es Senia", wilayaCode: "31" }
    ]
  },
  {
    code: "09",
    name: "Blida",
    cities: [
      { id: 11, name: "Blida", wilayaCode: "09" },
      { id: 12, name: "Boufarik", wilayaCode: "09" },
      { id: 13, name: "Larbaâ", wilayaCode: "09" }
    ]
  },
  {
    code: "15",
    name: "Tizi Ouzou",
    cities: [
      { id: 14, name: "Tizi Ouzou", wilayaCode: "15" },
      { id: 15, name: "Azazga", wilayaCode: "15" },
      { id: 16, name: "Draâ Ben Khedda", wilayaCode: "15" }
    ]
  },
  {
    code: "23",
    name: "Annaba",
    cities: [
      { id: 17, name: "Annaba", wilayaCode: "23" },
      { id: 18, name: "El Bouni", wilayaCode: "23" },
      { id: 19, name: "Berrahal", wilayaCode: "23" }
    ]
  },
  {
    code: "25",
    name: "Constantine",
    cities: [
      { id: 20, name: "Constantine", wilayaCode: "25" },
      { id: 21, name: "El Khroub", wilayaCode: "25" },
      { id: 22, name: "Hamma Bouziane", wilayaCode: "25" }
    ]
  },
  {
    code: "19",
    name: "Sétif",
    cities: [
      { id: 23, name: "Sétif", wilayaCode: "19" },
      { id: 24, name: "El Eulma", wilayaCode: "19" },
      { id: 25, name: "Ain Oulmene", wilayaCode: "19" }
    ]
  }
];

export const findCitiesByWilaya = (wilayaCode: string): City[] => {
  const wilaya = algerianWilayas.find(w => w.code === wilayaCode);
  return wilaya ? wilaya.cities : [];
};

export const getWilayaName = (wilayaCode: string): string => {
  const wilaya = algerianWilayas.find(w => w.code === wilayaCode);
  return wilaya ? wilaya.name : "";
};

export default algerianWilayas;