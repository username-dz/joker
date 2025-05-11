import React, { createContext, useState, useContext } from "react";
import * as fabric from "fabric";
import articlesInitialState from "../data/data";
import {
  Article,
  SelectedLayer,
  TextOptionsId,
  ImageOptionsId,
} from "../interfaces/CanvasSliceInterfaces";

interface ShopContextType {
  // Canvas instances
  frontCanvas: fabric.Canvas | null;
  setFrontCanvas: (canvas: fabric.Canvas | null) => void;
  backCanvas: fabric.Canvas | null;
  setBackCanvas: (canvas: fabric.Canvas | null) => void;

  // Articles state
  articles: Article[];
  selectedArticleIndex: number;
  selectedLayer: SelectedLayer | null;

  // Image loading state
  imagesLoad: boolean[] | null;

  // Context actions (formerly Redux actions)
  setSelectedLayer: (layer: SelectedLayer | null) => void;
  setActiveSide: (side: "front" | "back") => void;
  changeArticle: (article: Article) => void;
  setArticleBackground: (color: string) => void;
  createText: (text: any) => void;
  createImage: (image: any) => void;
  editText: (options: TextOptionsId) => void;
  editImage: (options: ImageOptionsId) => void;
  deleteLayer: (layer: SelectedLayer | null) => void;
  setImagesLoad: (loadingState: boolean[] | null) => void;
  removeImageLoading: () => void;
  resetBackSide: () => void;
  resetFrontSide: () => void; // Added resetFrontSide function

  // Utility getters
  getCurrentArticle: () => Article;
  getCurrentFrontSide: () => any;
  getCurrentBackSide: () => any;
  getCurrentSelectedText: () => any;
}

export const ShopContext = createContext<ShopContextType>(
  {} as ShopContextType
);

export const useShop = () => {
  return useContext(ShopContext);
};

interface ShopProviderProps {
  children: React.ReactNode;
}

export const ShopProvider = ({ children }: ShopProviderProps) => {
  const [articles, setArticles] = useState<Article[]>(articlesInitialState);
  const [selectedArticleIndex, setSelectedArticleIndex] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState<SelectedLayer | null>(
    null
  );
  const [frontCanvas, setFrontCanvas] = useState<fabric.Canvas | null>(null);
  const [backCanvas, setBackCanvas] = useState<fabric.Canvas | null>(null);
  const [imagesLoad, setImagesLoad] = useState<boolean[] | null>(null);

  // Helper function to get current article
  const getCurrentArticle = () => {
    return articles[selectedArticleIndex];
  };

  // Helper function to get current front side
  const getCurrentFrontSide = () => {
    const article = getCurrentArticle();
    return article.articleFrontSideInfo;
  };

  // Helper function to get current back side
  const getCurrentBackSide = () => {
    const article = getCurrentArticle();
    return article.articleBackSideInfo;
  };

  // Helper function to get current selected text
  const getCurrentSelectedText = () => {
    if (!selectedLayer || selectedLayer.type !== "text") return null;

    const article = getCurrentArticle();
    const side =
      article.active === "front"
        ? article.articleFrontSideInfo
        : article.articleBackSideInfo;

    return side?.texts.find((text) => text.id === selectedLayer.id);
  };

  // Set active side (front or back)
  const setActiveSide = (side: "front" | "back") => {
    setArticles((prevArticles) => {
      const newArticles = [...prevArticles];
      const newArticle = { ...newArticles[selectedArticleIndex], active: side };
      newArticles[selectedArticleIndex] = newArticle;
      return newArticles;
    });
  };

  // Change article
  const changeArticle = (article: Article) => {
    const articleIndex = articles.findIndex((a) => a.id === article.id);
    if (articleIndex !== -1) {
      setSelectedArticleIndex(articleIndex);
    }
  };

  // Set article background
  const setArticleBackground = (color: string) => {
    setArticles((prevArticles) => {
      const newArticles = [...prevArticles];
      const newArticle = {
        ...newArticles[selectedArticleIndex],
        articleBackground: color,
      };
      newArticles[selectedArticleIndex] = newArticle;
      return newArticles;
    });
  };

  // Create text
  const createText = (text: any) => {
    setArticles((prevArticles) => {
      const newArticles = [...prevArticles];
      const currentArticle = { ...newArticles[selectedArticleIndex] };

      if (
        currentArticle.active === "front" &&
        currentArticle.articleFrontSideInfo
      ) {
        currentArticle.articleFrontSideInfo = {
          ...currentArticle.articleFrontSideInfo,
          texts: [...(currentArticle.articleFrontSideInfo.texts || []), text],
        };
      } else if (
        currentArticle.active === "back" &&
        currentArticle.articleBackSideInfo
      ) {
        currentArticle.articleBackSideInfo = {
          ...currentArticle.articleBackSideInfo,
          texts: [...(currentArticle.articleBackSideInfo.texts || []), text],
        };
      }

      newArticles[selectedArticleIndex] = currentArticle;
      return newArticles;
    });
  };

  // Create image
  const createImage = (image: any) => {
    setArticles((prevArticles) => {
      const newArticles = [...prevArticles];
      const currentArticle = { ...newArticles[selectedArticleIndex] };

      if (
        currentArticle.active === "front" &&
        currentArticle.articleFrontSideInfo
      ) {
        currentArticle.articleFrontSideInfo = {
          ...currentArticle.articleFrontSideInfo,
          images: [
            ...(currentArticle.articleFrontSideInfo.images || []),
            image,
          ],
        };
      } else if (
        currentArticle.active === "back" &&
        currentArticle.articleBackSideInfo
      ) {
        currentArticle.articleBackSideInfo = {
          ...currentArticle.articleBackSideInfo,
          images: [...(currentArticle.articleBackSideInfo.images || []), image],
        };
      }

      newArticles[selectedArticleIndex] = currentArticle;
      return newArticles;
    });
  };

  // Edit text
  const editText = (options: TextOptionsId) => {
    setArticles((prevArticles) => {
      const newArticles = [...prevArticles];
      const currentArticle = { ...newArticles[selectedArticleIndex] };

      if (
        currentArticle.active === "front" &&
        currentArticle.articleFrontSideInfo
      ) {
        const textIndex = currentArticle.articleFrontSideInfo.texts.findIndex(
          (text) => text.id === options.id
        );

        if (textIndex !== -1) {
          currentArticle.articleFrontSideInfo = {
            ...currentArticle.articleFrontSideInfo,
            texts: [
              ...currentArticle.articleFrontSideInfo.texts.slice(0, textIndex),
              {
                ...currentArticle.articleFrontSideInfo.texts[textIndex],
                ...options,
              },
              ...currentArticle.articleFrontSideInfo.texts.slice(textIndex + 1),
            ],
          };
        }
      } else if (
        currentArticle.active === "back" &&
        currentArticle.articleBackSideInfo
      ) {
        const textIndex = currentArticle.articleBackSideInfo.texts.findIndex(
          (text) => text.id === options.id
        );

        if (textIndex !== -1) {
          currentArticle.articleBackSideInfo = {
            ...currentArticle.articleBackSideInfo,
            texts: [
              ...currentArticle.articleBackSideInfo.texts.slice(0, textIndex),
              {
                ...currentArticle.articleBackSideInfo.texts[textIndex],
                ...options,
              },
              ...currentArticle.articleBackSideInfo.texts.slice(textIndex + 1),
            ],
          };
        }
      }

      newArticles[selectedArticleIndex] = currentArticle;
      return newArticles;
    });
  };

  // Edit image
  const editImage = (options: ImageOptionsId) => {
    setArticles((prevArticles) => {
      const newArticles = [...prevArticles];
      const currentArticle = { ...newArticles[selectedArticleIndex] };

      if (
        currentArticle.active === "front" &&
        currentArticle.articleFrontSideInfo
      ) {
        const imageIndex = currentArticle.articleFrontSideInfo.images.findIndex(
          (img) => img.id === options.id
        );

        if (imageIndex !== -1) {
          currentArticle.articleFrontSideInfo = {
            ...currentArticle.articleFrontSideInfo,
            images: [
              ...currentArticle.articleFrontSideInfo.images.slice(
                0,
                imageIndex
              ),
              {
                ...currentArticle.articleFrontSideInfo.images[imageIndex],
                ...options,
              },
              ...currentArticle.articleFrontSideInfo.images.slice(
                imageIndex + 1
              ),
            ],
          };
        }
      } else if (
        currentArticle.active === "back" &&
        currentArticle.articleBackSideInfo
      ) {
        const imageIndex = currentArticle.articleBackSideInfo.images.findIndex(
          (img) => img.id === options.id
        );

        if (imageIndex !== -1) {
          currentArticle.articleBackSideInfo = {
            ...currentArticle.articleBackSideInfo,
            images: [
              ...currentArticle.articleBackSideInfo.images.slice(0, imageIndex),
              {
                ...currentArticle.articleBackSideInfo.images[imageIndex],
                ...options,
              },
              ...currentArticle.articleBackSideInfo.images.slice(
                imageIndex + 1
              ),
            ],
          };
        }
      }

      newArticles[selectedArticleIndex] = currentArticle;
      return newArticles;
    });
  };

  // Delete layer
  const deleteLayer = (layer: SelectedLayer | null) => {
    if (!layer) return;

    setArticles((prevArticles) => {
      const newArticles = [...prevArticles];
      const currentArticle = { ...newArticles[selectedArticleIndex] };

      if (
        currentArticle.active === "front" &&
        currentArticle.articleFrontSideInfo
      ) {
        if (layer.type === "text") {
          currentArticle.articleFrontSideInfo = {
            ...currentArticle.articleFrontSideInfo,
            texts: currentArticle.articleFrontSideInfo.texts.filter(
              (text) => text.id !== layer.id
            ),
          };
        } else if (layer.type === "image") {
          currentArticle.articleFrontSideInfo = {
            ...currentArticle.articleFrontSideInfo,
            images: currentArticle.articleFrontSideInfo.images.filter(
              (img) => img.id !== layer.id
            ),
          };
        }
      } else if (
        currentArticle.active === "back" &&
        currentArticle.articleBackSideInfo
      ) {
        if (layer.type === "text") {
          currentArticle.articleBackSideInfo = {
            ...currentArticle.articleBackSideInfo,
            texts: currentArticle.articleBackSideInfo.texts.filter(
              (text) => text.id !== layer.id
            ),
          };
        } else if (layer.type === "image") {
          currentArticle.articleBackSideInfo = {
            ...currentArticle.articleBackSideInfo,
            images: currentArticle.articleBackSideInfo.images.filter(
              (img) => img.id !== layer.id
            ),
          };
        }
      }

      newArticles[selectedArticleIndex] = currentArticle;
      return newArticles;
    });

    // Clear selected layer after deletion
    setSelectedLayer(null);
  };

  // Handle image loading state
  const removeImageLoading = () => {
    if (imagesLoad !== null) {
      setImagesLoad((prevState) => {
        const newState = [...prevState!];
        newState.pop();
        return newState.length > 0 ? newState : null;
      });
    }
  };

  // Reset back side
  const resetBackSide = () => {
    setArticles((prevArticles) => {
      const newArticles = [...prevArticles];
      const currentArticle = { ...newArticles[selectedArticleIndex] };

      if (currentArticle.articleBackSideInfo) {
        currentArticle.articleBackSideInfo = {
          ...currentArticle.articleBackSideInfo,
          texts: [],
          images: [],
        };
      }

      newArticles[selectedArticleIndex] = currentArticle;
      return newArticles;
    });

    // Clear canvas objects if backCanvas exists but preserve background
    if (backCanvas) {
      // Store the background image temporarily
      const backgroundImage = backCanvas.backgroundImage;

      // Remove only user-added objects
      const objects = backCanvas.getObjects();
      objects.forEach((obj) => backCanvas.remove(obj));

      // Restore background if it exists
      if (backgroundImage) {
        backCanvas.backgroundImage = backgroundImage;
      }

      backCanvas.requestRenderAll();
    }
  };

  // Reset front side
  const resetFrontSide = () => {
    setArticles((prevArticles) => {
      const newArticles = [...prevArticles];
      const currentArticle = { ...newArticles[selectedArticleIndex] };

      if (currentArticle.articleFrontSideInfo) {
        currentArticle.articleFrontSideInfo = {
          ...currentArticle.articleFrontSideInfo,
          texts: [],
          images: [],
        };
      }

      newArticles[selectedArticleIndex] = currentArticle;
      return newArticles;
    });

    // Clear canvas objects if frontCanvas exists but preserve background
    if (frontCanvas) {
      // Store the background image temporarily
      const backgroundImage = frontCanvas.backgroundImage;

      // Remove only user-added objects
      const objects = frontCanvas.getObjects();
      objects.forEach((obj) => frontCanvas.remove(obj));

      // Restore background if it exists
      if (backgroundImage) {
        frontCanvas.backgroundImage = backgroundImage;
      }

      frontCanvas.requestRenderAll();
    }
  };

  const contextValue: ShopContextType = {
    frontCanvas,
    setFrontCanvas,
    backCanvas,
    setBackCanvas,
    articles,
    selectedArticleIndex,
    selectedLayer,
    imagesLoad,
    setSelectedLayer,
    setActiveSide,
    changeArticle,
    setArticleBackground,
    createText,
    createImage,
    editText,
    editImage,
    deleteLayer,
    setImagesLoad,
    removeImageLoading,
    resetBackSide,
    resetFrontSide,
    getCurrentArticle,
    getCurrentFrontSide,
    getCurrentBackSide,
    getCurrentSelectedText,
  };

  return (
    <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>
  );
};
