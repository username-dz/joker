import { v4 as uuid } from "uuid";
import { Article } from "../interfaces/CanvasSliceInterfaces";

const articlesInitialState: Article[] = [
  {
    articleId: uuid(),
    id: uuid(),
    articleName: "tshirt",
    articleFrontSideInfo: {
      name: "front",
      src: "/crew_front.png",
      texts: [],
      images: [],
    },
    articleBackSideInfo: {
      name: "back",
      src: "/crew_back.png",
      texts: [],
      images: [],
    },
    active: "front",
    articlePrice: 5000,
    articleBackground: "#ffffff",
  },

  {
    articleId: uuid(),
    id: uuid(),
    articleName: "cup",
    articleFrontSideInfo: {
      name: "front cup",
      src: "/cup-test-front.png",
      texts: [],
      images: [],
    },
    articleBackSideInfo: {
      name: "back cup",
      src: "/cup-test-back.webp",
      texts: [],
      images: [],
    },
    active: "back",
    articlePrice: 500,
    articleBackground: "#ffffff",
  },
  {
    articleId: uuid(),
    id: uuid(),
    articleName: "hat",
    articleFrontSideInfo: {
      name: "front hat",
      src: "/hat.png",
      texts: [],
      images: [],
    },
    articleBackSideInfo: null,
    active: "front",
    articlePrice: 1000,
    articleBackground: "#ffffff",
  },
];

export default articlesInitialState;
