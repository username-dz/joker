import { useState, useEffect, useRef, useContext } from "react";
import { motion } from "framer-motion";
import DesignShop from "../../components/designShop/DesignShop";
import ColorPicker from "../../components/colorPicker/ColorPicker";
import CreateImage from "../../components/createImage/CreateImage";
import TextCustomize from "../../components/rightSectionCustomize/RightSectionCustomize";
import SubmitOrderButton from "../../components/submitOrderButton/SubmitOrderButton";
import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { useShop } from "../../contexts/ShopContext";
import DeleteLayer from "../../components/deleteLayer/DeleteLayer";
import {
  FaTextHeight,
  FaPaintBrush,
  FaImage,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import SelectArticle from "../../components/SelectArticle/SelectArticle";
import OrderModel from "../../components/orderModel/OrderModel";
import { Article, SelectedLayer } from "../../interfaces/CanvasSliceInterfaces";
import { Link, useLocation } from "react-router-dom";
import { MiniEditorContext } from "../../contexts/MiniEditorContext";

const Shop = () => {
  const location = useLocation();
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [animatedEntrance, setAnimatedEntrance] = useState(false);
  const miniEditorRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Add these new state variables and refs for resizing
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 });

  // Use the shared context
  const {
    showMiniEditor,
    setShowMiniEditor,
    activeTab,
    setActiveTab,
    position,
    setPosition,
    size,
    setSize,
  } = useContext(MiniEditorContext);

  const { articles, selectedLayer, getCurrentArticle } = useShop();
  const currentArticle = getCurrentArticle();

  useEffect(() => {
    setTimeout(() => {
      setAnimatedEntrance(true);
    }, 100);
  }, []);

  const isExist = articles.find(
    (article: Article) =>
      article.articleName === location.pathname.split("/")[2],
  );

  if (!isExist) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex min-h-screen flex-col items-center justify-center bg-[#f9f9f9] px-6 py-16"
      >
        <div className="w-full max-w-md overflow-hidden rounded-xl bg-white p-8 text-center shadow-xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50"
          >
            <FaExclamationTriangle className="h-12 w-12 text-[#DB3F40]" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-3 text-2xl font-bold text-gray-800"
          >
            Article Non Trouvé
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8 text-gray-600"
          >
            Nous n'avons pas trouvé l'article que vous recherchez. Il a
            peut-être été supprimé ou l'URL est incorrecte.
          </motion.p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/design"
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-[#DB3F40] to-[#f05545] px-6 py-3 font-medium text-white transition-all duration-300 hover:shadow-lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <FaArrowLeft />
                Parcourir les Articles
              </span>
              <span className="absolute bottom-0 left-0 h-full w-0 bg-black bg-opacity-20 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              to="/"
              className="group relative rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
            >
              Retour à l'Accueil
            </Link>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre
          équipe de support.
        </p>
      </motion.div>
    );
  }

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSize(e.target.value);
  };

  const toggleMiniEditor = () => {
    setShowMiniEditor(!showMiniEditor);
  };

  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    e.preventDefault(); // Prevent text selection during drag

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    dragStartRef.current = { x: clientX, y: clientY };
    lastPositionRef.current = { ...position };
    setIsDragging(true);
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    // Use requestAnimationFrame for smoother updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setPosition({
        x: lastPositionRef.current.x + deltaX,
        y: lastPositionRef.current.y + deltaY,
      });
    });
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    setIsDragging(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Update the last position for the next drag
    lastPositionRef.current = { ...position };
  };

  const handleResizeStart = (
    e: React.MouseEvent | React.TouchEvent,
    direction: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setResizeDirection(direction);
    resizeStartRef.current = {
      width: size.width,
      height: size.height,
      x: clientX,
      y: clientY,
    };
    setIsResizing(true);
  };

  const handleResize = (e: MouseEvent | TouchEvent) => {
    if (!isResizing) return;

    e.preventDefault();
    e.stopPropagation();

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const deltaX = clientX - resizeStartRef.current.x;
    const deltaY = clientY - resizeStartRef.current.y;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const minWidth = 250;
      const minHeight = 300;
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.8;

      let newWidth = resizeStartRef.current.width;
      let newHeight = resizeStartRef.current.height;

      if (resizeDirection.includes("right")) {
        newWidth = Math.max(
          minWidth,
          Math.min(maxWidth, resizeStartRef.current.width + deltaX),
        );
      }

      if (resizeDirection.includes("bottom")) {
        newHeight = Math.max(
          minHeight,
          Math.min(maxHeight, resizeStartRef.current.height + deltaY),
        );
      }

      setSize({
        width: newWidth,
        height: newHeight,
      });
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    if (isDragging) {
      // Use passive: false to properly handle preventDefault
      window.addEventListener("mousemove", handleDrag, { passive: false });
      window.addEventListener("touchmove", handleDrag, { passive: false });
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchend", handleDragEnd);
      window.addEventListener("touchcancel", handleDragEnd);
    }

    return () => {
      // Always clean up event listeners
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("touchmove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchend", handleDragEnd);
      window.removeEventListener("touchcancel", handleDragEnd);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDragging, position]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResize, { passive: false });
      window.addEventListener("touchmove", handleResize, { passive: false });
      window.addEventListener("mouseup", handleResizeEnd);
      window.addEventListener("touchend", handleResizeEnd);
      window.addEventListener("touchcancel", handleResizeEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("touchmove", handleResize);
      window.removeEventListener("mouseup", handleResizeEnd);
      window.removeEventListener("touchend", handleResizeEnd);
      window.removeEventListener("touchcancel", handleResizeEnd);
    };
  }, [isResizing]);

  useEffect(() => {
    setAnimatedEntrance(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-5 py-8 text-sm font-medium md:p-1 lg:p-10">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-[#DB3F40] to-purple-600 opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-md">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden flex-1 pl-4 text-lg font-semibold md:block md:pl-9 md:text-xl lg:mb-0 lg:text-3xl"
          >
            <span className="relative">
              Personnaliser ma commande
              <span className="absolute -bottom-1 left-0 h-1 w-16 rounded-full bg-[#DB3F40]"></span>
            </span>
          </motion.p>
          <SelectArticle />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-1 justify-center rounded-xl bg-white p-6 shadow-md md:pt-20"
          >
            <DesignShop />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="hidden flex-col gap-6 rounded-xl bg-white px-6 py-6 shadow-md md:flex md:p-10 md:py-10 lg:p-10"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentArticle.articleName}
                </h2>
                <p className="text-sm text-gray-500">
                  Personnalisez tous les détails selon vos préférences
                </p>
              </div>
              <p className="rounded-lg bg-[#DB3F40] bg-opacity-10 px-4 py-2 text-xl font-bold text-[#DB3F40]">
                {currentArticle.articlePrice}Da
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div className="rounded-lg bg-gray-50 p-5 shadow-inner">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <FaTextHeight className="text-[#DB3F40]" />
                  Texte et Image
                </h3>
                <TextCustomize />
              </div>

              <div className="rounded-lg bg-gray-50 p-5 shadow-inner">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <FaPaintBrush className="text-[#DB3F40]" />
                  Fond
                </h3>
                <div className="w-full">
                  <div className="flex cursor-pointer flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <p className="font-medium">Couleur</p>
                    <ColorPicker type="articleBackGround" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-5 shadow-inner">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <FaImage className="text-[#DB3F40]" />
                  Détails de la Commande
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-700">Taille</p>
                    <select
                      className="h-12 cursor-pointer rounded-lg bg-gray-50 p-2 outline-none focus:ring-2 focus:ring-[#DB3F40]"
                      value={selectedSize}
                      onChange={handleSizeChange}
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-xl shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-[#DB3F40] hover:text-white"
                      aria-label="Diminuer la quantité"
                    >
                      <CiCircleMinus className="h-full w-full" />
                    </button>
                    <p className="w-8 text-center font-bold">{quantity}</p>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-[#DB3F40] hover:text-white"
                      aria-label="Augmenter la quantité"
                    >
                      <CiCirclePlus className="h-full w-full" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <SubmitOrderButton setIsModelOpen={setIsModelOpen} />
                {isModelOpen && (
                  <OrderModel
                    setIsModelOpen={setIsModelOpen}
                    price={currentArticle.articlePrice * quantity}
                    preSelectedSize={selectedSize}
                    quantity={quantity}
                    currentArticle={currentArticle}
                  />
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col gap-1 overflow-hidden rounded-xl bg-white shadow-md sm:gap-4 md:hidden"
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="text-lg font-semibold">
                {currentArticle.articleName}
              </h2>
              <p className="rounded-full bg-[#DB3F40] px-3 py-1 text-sm font-bold text-white">
                {currentArticle.articlePrice}Da
              </p>
            </div>

            <div className="flex justify-around border-b border-gray-100">
              {["text", "background", "orderDetails"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex flex-1 items-center justify-center gap-1.5 p-3 transition-all ${
                    activeTab === tab
                      ? "border-b-2 border-[#DB3F40] font-medium text-[#DB3F40]"
                      : "text-gray-500"
                  }`}
                >
                  {tab === "text" && <FaTextHeight />}
                  {tab === "background" && <FaPaintBrush />}
                  {tab === "orderDetails" && <FaImage />}
                  <span className="text-xs capitalize">
                    {tab === "orderDetails"
                      ? "Commande"
                      : tab === "background"
                        ? "Fond"
                        : "Texte et Image"}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === "text" && <TextCustomize />}

              {activeTab === "background" && (
                <div className="flex flex-col gap-4">
                  <p className="font-medium">Couleur de fond</p>
                  <ColorPicker type="articleBackGround" />
                </div>
              )}

              {activeTab === "orderDetails" && (
                <div className="flex flex-col gap-4">
                  <p className="font-medium">Détails de la Commande</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-sm">Taille</p>
                      <select
                        className="cursor-pointer rounded-lg bg-white p-2"
                        value={selectedSize}
                        onChange={handleSizeChange}
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xl">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:text-[#DB3F40]"
                        aria-label="Diminuer la quantité"
                      >
                        <CiCircleMinus className="h-6 w-6" />
                      </button>
                      <p className="w-5 text-center">{quantity}</p>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:text-[#DB3F40]"
                        aria-label="Augmenter la quantité"
                      >
                        <CiCirclePlus className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-gray-100 p-3 text-center text-xs text-gray-600">
                    <p>
                      Prix total:{" "}
                      <span className="font-bold text-[#DB3F40]">
                        {currentArticle.articlePrice * quantity} DA
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 mt-auto bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <SubmitOrderButton setIsModelOpen={setIsModelOpen} />
              {isModelOpen && (
                <OrderModel
                  setIsModelOpen={setIsModelOpen}
                  price={currentArticle.articlePrice * quantity}
                  preSelectedSize={selectedSize}
                  quantity={quantity}
                  currentArticle={currentArticle}
                />
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {showMiniEditor && (
        <motion.div
          ref={miniEditorRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-50 flex max-h-[70vh] w-[90%] max-w-xs flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          style={{
            top: position.y,
            left: position.x,
            width: size.width,
            height: size.height,
          }}
        >
          <div
            className="flex cursor-grab items-center justify-between bg-gradient-to-r from-[#DB3F40] to-[#f05545] px-4 py-3 text-white active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="flex items-center gap-2">
              {/* Drag handle icon - more visible */}
              <div className="flex h-6 w-6 items-center justify-center rounded bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              </div>
              <div className="flex flex-col gap-0">
                <h3 className="text-sm font-medium">Éditer le Design</h3>
                <span className="text-[9px] text-white/80">
                  Tenir et glisser ici pour déplacer
                </span>
              </div>
            </div>
            <button
              className="rounded-full p-1 hover:bg-white/20"
              onClick={() => setShowMiniEditor(false)}
            >
              ✕
            </button>
          </div>

          <div className="flex justify-around border-b border-gray-100">
            {["text", "background", "orderDetails"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-1 items-center justify-center gap-1.5 p-3 transition-all ${
                  activeTab === tab
                    ? "border-b-2 border-[#DB3F40] font-medium text-[#DB3F40]"
                    : "text-gray-500"
                }`}
              >
                {tab === "text" && <FaTextHeight />}
                {tab === "background" && <FaPaintBrush />}
                {tab === "orderDetails" && <FaImage />}
                <span className="text-xs capitalize">
                  {tab === "orderDetails"
                    ? "Commande"
                    : tab === "background"
                      ? "Fond"
                      : "Texte"}
                </span>
              </button>
            ))}
          </div>

          <div className="overflow-y-auto p-4">
            {activeTab === "text" && (
              <div className="mini-editor-content">
                <TextCustomize />
              </div>
            )}

            {activeTab === "background" && (
              <div className="mini-editor-content flex flex-col gap-4">
                <p className="font-medium">Couleur de fond</p>
                <ColorPicker type="articleBackGround" />
              </div>
            )}

            {activeTab === "orderDetails" && (
              <div className="mini-editor-content flex flex-col gap-4">
                <p className="font-medium">Détails de la Commande</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-sm">Taille</p>
                    <select
                      className="cursor-pointer rounded-lg bg-white p-2"
                      value={selectedSize}
                      onChange={handleSizeChange}
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:text-[#DB3F40]"
                      aria-label="Diminuer la quantité"
                    >
                      <CiCircleMinus className="h-6 w-6" />
                    </button>
                    <p className="w-5 text-center">{quantity}</p>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:text-[#DB3F40]"
                      aria-label="Augmenter la quantité"
                    >
                      <CiCirclePlus className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="absolute bottom-0 right-0 z-10 h-8 w-8 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
            onTouchStart={(e) => handleResizeStart(e, "bottom-right")}
          >
            <div className="absolute bottom-0 right-0 flex h-8 w-8 items-end justify-end overflow-hidden p-1">
              <div className="absolute bottom-0 right-0 h-[2px] w-7 bg-[#DB3F40]"></div>
              <div className="absolute bottom-0 right-0 h-7 w-[2px] bg-[#DB3F40]"></div>
              <div className="absolute bottom-1 right-1 h-[2px] w-5 bg-[#DB3F40]"></div>
              <div className="absolute bottom-1 right-1 h-5 w-[2px] bg-[#DB3F40]"></div>
              <div className="absolute bottom-2 right-2 h-[2px] w-3 bg-[#DB3F40]"></div>
              <div className="absolute bottom-2 right-2 h-3 w-[2px] bg-[#DB3F40]"></div>
            </div>
          </div>

          <div className="bg-gray-50 p-2 text-center text-[10px] text-gray-500">
            <p>
              Glissez pour déplacer • Coin inférieur droit pour redimensionner
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Shop;
