import { Canvas, IImageOptions, TextOptions } from "fabric/fabric-impl";
import { Ref } from "react";

interface TextOptionsId extends TextOptions {
  id: string;
}
interface ImageOptionsId extends IImageOptions {
  id: string;
}

interface ArticleSideInfo {
  name: string;
  src: string;
  texts: TextOptionsId[];
  images: ImageOptionsId[];
}

interface Article {
  id: string;
  articleId : string;
  articleName: string;
  articleFrontSideInfo: ArticleSideInfo;
  articleBackSideInfo: ArticleSideInfo | null;
  active: "front" | "back";
  articleBackground: string;
  articlePrice: number;
}
interface SelectedLayer {
  type: "text" | "image";
  id: string;
}
interface CanvasSliceState {
  canvasRef: Canvas | null | Ref<Canvas>;
  articles: Article[];
  selectedArticleIndex: number;
  selectedLayer: SelectedLayer | null;
  frontCanvas: null | Canvas;
  backCanvas: null | Canvas;
}

export type {
  CanvasSliceState,
  Article,
  SelectedLayer,
  ArticleSideInfo,
  TextOptionsId,
  ImageOptionsId,
};
