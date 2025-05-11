import { useState, useEffect } from "react";
import HttpClient from "../../utils/HttpClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Loader from "../loaders/Loader";
import { Article } from "../../interfaces/CanvasSliceInterfaces";
import { AxiosError } from "axios";
import { useShop } from "../../contexts/ShopContext";
import { algerianWilayas, findCitiesByWilaya } from "../../data/algeria-cities";
import { FaArrowLeft, FaUpload, FaTimes } from "react-icons/fa";

interface OrderModelProps {
  setIsModelOpen: (value: boolean) => void;
  price: number;
  preSelectedSize?: string;
  quantity?: number;
  currentArticle: Article;
}

const OrderModel = ({
  setIsModelOpen,
  price,
  preSelectedSize = "",
  quantity = 1,
  currentArticle,
}: OrderModelProps) => {
  const { frontCanvas, backCanvas } = useShop();
  const navigate = useNavigate();

  const [step, setStep] = useState<"form" | "confirmation">("form");
  const [selectedWilaya, setSelectedWilaya] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [availableCities, setAvailableCities] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [selectedSize, setSelectedSize] = useState<string>(preSelectedSize);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [customDesignFile, setCustomDesignFile] = useState<File | null>(null);
  const [customDesignPreview, setCustomDesignPreview] = useState<string>("");

  // Update cities when wilaya changes
  useEffect(() => {
    if (selectedWilaya) {
      const cities = findCitiesByWilaya(selectedWilaya);
      setAvailableCities(cities);
      setSelectedCity(""); // Reset selected city when wilaya changes
    }
  }, [selectedWilaya]);

  // Map frontend article names to backend-compatible values
  const getBackendArticleType = (frontendName: string): string => {
    const articleMap: Record<string, string> = {
      tshirt: "t_shirt",
      "T-shirt": "t_shirt",
      "t shirt": "t_shirt",
      "t-shirt": "t_shirt",
      sweatshirt: "sweet_shirt",
      Sweatshirt: "sweet_shirt",
      "sweet shirt": "sweet_shirt",
      hoodie: "sweet_shirt",
      Hoodie: "sweet_shirt",
      mug: "mug",
      Mug: "mug",
      cup: "mug",
      Cup: "mug",
      "key ring": "key_ring",
      keyring: "key_ring",
      Keyring: "key_ring",
      "Key Ring": "key_ring",
    };

    // Case insensitive search
    const lowercaseName = frontendName.toLowerCase();
    for (const [key, value] of Object.entries(articleMap)) {
      if (lowercaseName.includes(key.toLowerCase())) {
        return value;
      }
    }

    // Default if no match found
    return "t_shirt";
  };

  if (!currentArticle) {
    console.error("currentArticle is not defined in OrderModel");
    return (
      <div className="fixed left-0 top-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/80">
        <div className="container fixed mt-6 h-[80vh] w-[90%] max-w-[500px] overflow-auto rounded-2xl bg-white p-6 text-center sm:w-[50vw]">
          <div className="flex flex-col items-center justify-center gap-2">
            <h2 className="text-2xl font-bold text-red-500">Erreur</h2>
            <p className="text-gray-600">
              Une erreur s'est produite lors du chargement des données de
              l'article.
            </p>
            <button
              onClick={() => setIsModelOpen(false)}
              className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition duration-300 hover:bg-gray-100"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSizeSelection = (size: string) => {
    setSelectedSize(size);
  };

  useEffect(() => {
    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModelOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [setIsModelOpen]);

  // Helper function to convert canvas to a File object that works with Cloudinary
  const canvasToFile = async (
    canvas: fabric.Canvas | null,
    fileName: string
  ): Promise<File | null> => {
    if (!canvas) {
      console.error("No canvas provided");
      return null;
    }

    try {
      // Force the canvas to render
      canvas.renderAll();

      // Get the canvas HTML element directly - this is more reliable
      const canvasEl = canvas.lowerCanvasEl;
      if (!canvasEl) {
        console.error("Canvas element not found");
        return null;
      }

      // Generate high quality PNG
      const dataURL = canvasEl.toDataURL("image/png", 1.0);
      console.log(
        `Generated data URL for ${fileName}, length: ${dataURL.length} bytes`
      );

      // Basic validation
      if (!dataURL || dataURL === "data:," || dataURL.length < 100) {
        console.error("Invalid data URL generated");
        return null;
      }

      // Convert data URL to binary
      const byteString = atob(dataURL.split(",")[1]);
      const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];

      // Convert binary string to array buffer
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // Create blob with proper MIME type
      const blob = new Blob([ab], { type: mimeString });
      console.log(`Created blob for ${fileName}, size: ${blob.size} bytes`);

      if (blob.size === 0) {
        console.error("Generated blob has zero size");
        return null;
      }

      // Add timestamp to prevent caching issues
      const timestamp = Date.now();
      const fileExt = mimeString.split("/")[1] || "png";
      const uniqueFileName = `${fileName.split(".")[0]}_${timestamp}.${fileExt}`;

      // Create File with proper name and type
      const file = new File([blob], uniqueFileName, {
        type: mimeString,
        lastModified: timestamp,
      });

      console.log(
        `Created File object: ${uniqueFileName}, size: ${file.size} bytes, type: ${file.type}`
      );
      return file;
    } catch (error) {
      console.error("Error converting canvas to file:", error);
      return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("Le fichier est trop volumineux. Maximum 10MB autorisé.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Seuls les fichiers image sont autorisés.");
        return;
      }

      setCustomDesignFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCustomDesignPreview(previewUrl);
    }
  };

  const removeCustomDesign = () => {
    if (customDesignPreview) {
      URL.revokeObjectURL(customDesignPreview);
    }
    setCustomDesignFile(null);
    setCustomDesignPreview("");
  };

  const needsSize = (articleName: string): boolean => {
    const articleType = articleName.toLowerCase();
    return (
      articleType.includes("shirt") ||
      articleType.includes("t-shirt") ||
      articleType.includes("sweet")
    );
  };

  const validateForm = (): boolean => {
    if (!name || !phone || !selectedWilaya || !selectedCity) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }

    if (needsSize(currentArticle.articleName) && !selectedSize) {
      toast.error("Veuillez sélectionner une taille");
      return false;
    }

    if (!phone.match(/^(0|(\+213))([567][0-9]{8}|[0-9]{9})$/)) {
      toast.error("Veuillez entrer un numéro de téléphone algérien valide");
      return false;
    }

    return true;
  };

  const proceedToConfirmation = () => {
    if (validateForm()) {
      setStep("confirmation");
    }
  };

  const createOrder = async (): Promise<void | string> => {
    if (!selectedSize || !phone || !selectedWilaya || !selectedCity || !name) {
      return toast.error("Veuillez remplir tous les champs");
    }

    if (!phone.match(/^(0|(\+213))([567][0-9]{8}|[0-9]{9})$/)) {
      return toast.error(
        "Veuillez entrer un numéro de téléphone algérien valide"
      );
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // First deselect all objects on both canvases to ensure clean rendering
      if (frontCanvas) {
        frontCanvas.discardActiveObject();
        frontCanvas.renderAll();
      }
      if (backCanvas) {
        backCanvas.discardActiveObject();
        backCanvas.renderAll();
      }

      // Add a small delay to ensure canvas rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Capture canvas images
      let frontImageFile = null;
      let backImageFile = null;

      if (customDesignFile) {
        frontImageFile = customDesignFile;
      } else {
        // Capture canvas images as before
        if (frontCanvas) {
          frontImageFile = await canvasToFile(frontCanvas, "front_design.png");
        }
        if (backCanvas && currentArticle.articleName.toLowerCase() !== "cup") {
          backImageFile = await canvasToFile(backCanvas, "back_design.png");
        }
      }

      if (!frontImageFile && !customDesignFile) {
        toast.error("Aucun design n'a été fourni");
        setIsLoading(false);
        return;
      }

      const cityData = `${selectedCity}, ${algerianWilayas.find((w) => w.code === selectedWilaya)?.name || ""}`;

      const orderDescription = customDescription
        ? customDescription
        : `Commande pour ${name} - ${currentArticle.articleName}${selectedSize ? ` (${selectedSize})` : ""} en ${currentArticle.articleBackground || "blanc"}`;

      const orderData = {
        article: getBackendArticleType(currentArticle.articleName || ""),
        size: needsSize(currentArticle.articleName) ? selectedSize : "",
        phone: phone,
        city: cityData,
        name: name,
        description: orderDescription,
        color: currentArticle.articleBackground || "white",
        price: (price || currentArticle.articlePrice).toString(),
        quantity: quantity.toString(),
        state: "unseen",
        is_seen: false,
        is_delivered: false,
        front_image: frontImageFile,
        back_image: backImageFile,
      };

      // Use the original HttpClient which handles CSRF tokens automatically
      console.log("Submitting order with image files:", {
        article: getBackendArticleType(currentArticle.articleName || ""),
        size: needsSize(currentArticle.articleName) ? selectedSize : "",
        hasFrontImage: !!frontImageFile,
        hasBackImage: !!backImageFile,
      });

      // Send the order data using HttpClient which handles CSRF
      const response = await HttpClient.post("requests/", orderData);

      console.log("Order creation response:", response);

      // Prepare image URLs for localStorage
      let frontImageURL = null;
      let backImageURL = null;

      // Use the URLs returned from the server if available
      if (response.front_image_url) {
        frontImageURL = response.front_image_url;
      } else if (frontImageFile) {
        frontImageURL = URL.createObjectURL(frontImageFile);
      }

      if (response.back_image_url) {
        backImageURL = response.back_image_url;
      } else if (backImageFile) {
        backImageURL = URL.createObjectURL(backImageFile);
      }

      // Save the order with design images to localStorage
      const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");

      // Create the complete order record for localStorage
      const newOrder = {
        id: response.id || Date.now(),
        date: new Date().toISOString(),
        name: currentArticle.articleName || "Custom Item",
        articleType: getBackendArticleType(currentArticle.articleName || ""),
        color: currentArticle.articleBackground || "white",
        size: needsSize(currentArticle.articleName) ? selectedSize : "",
        price: price || 0,
        quantity: quantity || 1,
        status: "processing",
        frontImage: frontImageURL,
        backImage: backImageURL,
      };

      // Add to start of array (newest first)
      savedOrders.unshift(newOrder);

      // Limit orders to prevent localStorage overflow
      const limitedOrders = savedOrders.slice(0, 20);
      localStorage.setItem("orders", JSON.stringify(limitedOrders));

      toast.success("Commande créée avec succès !");

      setTimeout(() => {
        setIsModelOpen(false);
        navigate("/my-orders/");
      }, 1500);
    } catch (error) {
      console.error("Error creating order:", error);

      // Properly type error as AxiosError
      const axiosError = error as AxiosError<any>;

      if (axiosError.response) {
        console.error("Status:", axiosError.response.status);
        console.error("Data:", axiosError.response.data);

        // Show more specific error message from backend
        const errorData = axiosError.response.data;
        if (errorData?.detail && errorData.detail.includes("CSRF")) {
          setErrorMessage(
            "Erreur de sécurité CSRF. Veuillez rafraîchir la page et réessayer."
          );
          toast.error(
            "Erreur de sécurité CSRF. Veuillez rafraîchir la page et réessayer."
          );
        } else if (errorData?.article) {
          setErrorMessage(`Erreur d'article : ${errorData.article}`);
          toast.error(`Erreur d'article : ${errorData.article}`);
        } else if (errorData?.non_field_errors) {
          setErrorMessage(`Erreur : ${errorData.non_field_errors.join(", ")}`);
          toast.error(`Erreur : ${errorData.non_field_errors.join(", ")}`);
        } else if (errorData?.front_image) {
          setErrorMessage(`Erreur d'image avant : ${errorData.front_image}`);
          toast.error(`Erreur d'image avant : ${errorData.front_image}`);
        } else if (errorData?.back_image) {
          setErrorMessage(`Erreur d'image arrière : ${errorData.back_image}`);
          toast.error(`Erreur d'image arrière : ${errorData.back_image}`);
        } else {
          setErrorMessage(
            "Échec de création de la commande. Veuillez réessayer."
          );
          toast.error("Échec de création de la commande. Veuillez réessayer.");
        }
      } else {
        setErrorMessage(
          "Échec de création de la commande. Veuillez réessayer."
        );
        toast.error("Échec de création de la commande. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderOrderConfirmation = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Confirmation de la commande</h3>

      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <div className="flex justify-between">
          <span className="font-medium">Article:</span>
          <span>{currentArticle.articleName}</span>
        </div>
        {needsSize(currentArticle.articleName) && (
          <div className="flex justify-between">
            <span className="font-medium">Taille:</span>
            <span>{selectedSize}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-medium">Quantité:</span>
          <span>{quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Prix:</span>
          <span>{price} DA</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Nom:</span>
          <span>{name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Téléphone:</span>
          <span>{phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Ville:</span>
          <span>
            {selectedCity},{" "}
            {algerianWilayas.find((w) => w.code === selectedWilaya)?.name}
          </span>
        </div>
      </div>

      {customDesignPreview ? (
        <div className="space-y-2">
          <p className="font-medium">Design personnalisé:</p>
          <img
            src={customDesignPreview}
            alt="Design personnalisé"
            className="max-h-48 mx-auto object-contain rounded border"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-medium">Design créé:</p>
          <div className="flex justify-center gap-4">
            {frontCanvas && (
              <img
                src={frontCanvas.toDataURL()}
                alt="Design avant"
                className="max-h-48 object-contain rounded border"
              />
            )}
            {backCanvas &&
              currentArticle.articleName.toLowerCase() !== "cup" && (
                <img
                  src={backCanvas.toDataURL()}
                  alt="Design arrière"
                  className="max-h-48 object-contain rounded border"
                />
              )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description supplémentaire (optionnelle):
        </label>
        <textarea
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Ajoutez des détails ou instructions particulières..."
          rows={3}
        />
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setStep("form")}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <FaArrowLeft /> Retour
        </button>
        <button
          onClick={createOrder}
          disabled={isLoading}
          className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader
                backgroundColor="transparent"
                color="white"
                width={20}
                height={20}
              />
              <span>Traitement...</span>
            </div>
          ) : (
            "Confirmer la commande"
          )}
        </button>
      </div>
    </div>
  );

  const renderOrderForm = () => (
    <>
      <h2 className="text-2xl font-bold">Finaliser Votre Commande</h2>
      <p className="text-gray-600">Produit : {currentArticle.articleName}</p>
      <p className="text-gray-600">Prix : {price} DA</p>
      {quantity > 1 && <p className="text-gray-600">Quantité : {quantity}</p>}

      {/* Size selection if needed */}
      {needsSize(currentArticle.articleName) && !preSelectedSize && (
        <div className="mt-4 w-full">
          <p className="mb-2 text-left font-semibold">Choisir une Taille</p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            {["S", "M", "L", "XL", "XXL"].map((size) => (
              <button
                key={size}
                onClick={() => handleSizeSelection(size)}
                className={`rounded-lg border-2 px-4 py-2 ${
                  selectedSize === size
                    ? "bg-blue-500 text-white"
                    : "bg-white text-black"
                } transition duration-300 hover:bg-blue-500 hover:text-white`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom design upload */}
      <div className="mt-6 w-full">
        <p className="mb-2 text-left font-semibold">
          Télécharger votre propre design (optionnel)
        </p>
        <div className="flex items-center gap-4">
          <label className="flex-1">
            <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-500 focus:outline-none">
              {customDesignPreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={customDesignPreview}
                    alt="Aperçu du design"
                    className="object-contain w-full h-full"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeCustomDesign();
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FaUpload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Cliquez ou glissez votre fichier ici
                  </p>
                </div>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={!!customDesignPreview}
            />
          </label>
        </div>
      </div>

      {/* Personal information form */}
      <div className="mt-6 w-full">
        <p className="mb-2 text-left font-semibold">Vos Informations</p>
        <div className="mt-2 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nom Complet *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Numéro de Téléphone *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <select
            value={selectedWilaya}
            onChange={(e) => setSelectedWilaya(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Sélectionner une wilaya *</option>
            {algerianWilayas.map((wilaya) => (
              <option key={wilaya.code} value={wilaya.code}>
                {wilaya.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedWilaya}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Sélectionner une ville *</option>
            {availableCities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 w-full rounded-lg bg-red-100 p-3 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
        <button
          onClick={() => setIsModelOpen(false)}
          className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition duration-300 hover:bg-gray-100 sm:w-1/2"
        >
          Annuler
        </button>
        <button
          onClick={proceedToConfirmation}
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition duration-300 hover:bg-blue-700 disabled:bg-blue-400 sm:w-1/2"
        >
          Vérifier la commande
        </button>
      </div>
    </>
  );

  return (
    <div
      className="fixed left-0 top-0 z-[10000] flex h-screen w-screen items-center justify-center bg-black/80"
      onClick={() => setIsModelOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="container fixed mt-6 h-[80vh] w-[90%] max-w-[500px] overflow-auto rounded-2xl bg-white p-6 text-center sm:w-[50vw]"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          {step === "form" ? renderOrderForm() : renderOrderConfirmation()}
        </div>
      </div>
    </div>
  );
};

export default OrderModel;
