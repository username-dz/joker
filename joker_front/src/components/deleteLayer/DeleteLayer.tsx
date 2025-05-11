import { useShop } from "../../contexts/ShopContext";

const DeleteLayer = () => {
  const { selectedLayer, deleteLayer } = useShop();

  return (
    <button
      onClick={() => deleteLayer(selectedLayer)}
      className="flex transform items-center justify-center gap-2 rounded-lg py-3 text-red-500 transition-all duration-300 hover:scale-110 md:h-12 md:w-auto"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="h-8 w-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a1 1 0 011-1h4a1 1 0 011 1v2M4 7h16"
        />
      </svg>
    </button>
  );
};

export default DeleteLayer;
