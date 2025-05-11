import { useState, useEffect } from "react";
import HttpClient from "../../utils/HttpClient";
import Sidebar from "../../components/sideBar/sideBar";
import Loader from "../../components/loaders/Loader";
import { toast } from "react-hot-toast";
import {
  FaEye,
  FaSearch,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
  FaExpand,
  FaDownload,
} from "react-icons/fa";

// Define interface for the article object based on the Django model
interface Request {
  id: number;
  article: string;
  description: string;
  phone: string;
  text: string;
  color: string;
  size: string;
  creation_date: string;
  is_seen: boolean;
  state: string;
  city: string;
  is_delivered: boolean;
  price: number;
  uuid: string;
  // Cover all possible image field names that could be in the response
  frontImage?: string | null;
  backImage?: string | null;
  front_image?: string | null;
  back_image?: string | null;
  front_image_url?: string | null;
  back_image_url?: string | null;
}

const Admin: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [detailsVisible, setDetailsVisible] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const requestsPerPage = 8;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await HttpClient.get<{
        results: Request[];
        count: number;
        page: number;
        total_pages: number;
      }>("requests/");

      // Extract the results array from the paginated response
      setRequests(response.results || []);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des demandes:", err);
      setError("Échec du chargement des demandes.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number): void => {
    setRequestToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!requestToDelete) return;

    try {
      await HttpClient.delete(`requests/${requestToDelete}/`);
      toast.success("Demande supprimée avec succès !");
      fetchRequests();
    } catch (err) {
      console.error("Erreur lors de la suppression de la demande:", err);
      toast.error("Échec de la suppression de la demande.");
    } finally {
      setDeleteConfirmOpen(false);
      setRequestToDelete(null);
    }
  };

  // Mark request as seen when opening details
  const markAsSeen = async (request: Request): Promise<void> => {
    // Only proceed if the request is currently unseen
    if (request.state !== "unseen") return;

    try {
      // Update the request state on the server
      // Use just is_seen instead of trying to set state to "seen"
      await HttpClient.patch(`requests/${request.id}/`, {
        is_seen: true,
      });

      // Update the local state
      setRequests((prevRequests) =>
        prevRequests.map((r) =>
          r.id === request.id ? { ...r, state: "seen", is_seen: true } : r
        )
      );

      toast.success("Demande marquée comme vue");
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la demande:", err);
      toast.error("Échec de la mise à jour de la demande");
    }
  };

  const toggleDetails = (id: number, request: Request): void => {
    // Only toggle the specific card that was clicked
    setDetailsVisible((prevVisible) => (prevVisible === id ? null : id));

    // If we're opening details and request is unseen, mark it as seen
    if (detailsVisible !== id && request.state === "unseen") {
      markAsSeen(request);
    }
  };

  const showEnlargedImage = (src: string, alt: string): void => {
    if (!src) return;
    setEnlargedImage({ src, alt });
  };

  const validateImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;

    // More tolerant check for data URLs
    if (url.startsWith("data:image/") || url.startsWith("data:application/")) {
      return url.length > 100; // Ensure it has some actual content
    }

    // Handle http URLs
    if (url.startsWith("http")) {
      return true;
    }

    return false;
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    }
  };

  const renderImageWithDownload = (url: string, alt: string, index: number) => (
    <div className="group relative">
      <img
        src={url}
        alt={alt}
        className="max-h-48 w-auto cursor-pointer rounded border border-gray-200 object-contain hover:opacity-90"
        onClick={() => showEnlargedImage(url, alt)}
        onError={(e) => {
          e.currentTarget.src = "/empty_image.png";
          e.currentTarget.onerror = null;
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadImage(url, `design-${index}.png`);
          }}
          className="rounded-full bg-white p-2 text-gray-700 shadow-lg hover:bg-gray-100"
          title="Télécharger"
        >
          <FaDownload className="h-5 w-5" />
        </button>
        <button
          onClick={() => showEnlargedImage(url, alt)}
          className="rounded-full bg-white p-2 text-gray-700 shadow-lg hover:bg-gray-100"
          title="Agrandir"
        >
          <FaExpand className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  // Filter requests based on search term
  const filteredRequests = requests.filter(
    (request) =>
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader
          backgroundColor="transparent"
          color="#3b82f6"
          className="h-12 w-12"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <div className="text-center text-xl text-red-500">{error}</div>
        <button
          onClick={fetchRequests}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 focus:outline-none"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
            Demandes des clients
          </h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des demandes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaSearch />
              </span>
            </div>
          </div>
        </header>

        {filteredRequests.length === 0 ? (
          <div className="mt-20 text-center text-lg text-gray-500">
            Aucune demande client trouvée.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentRequests.map((request) => (
                <div
                  key={request.id}
                  className={`rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${
                    request.state === "unseen"
                      ? "bg-red-50 border-l-4 border-red-500"
                      : ""
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-semibold capitalize text-gray-800">
                      {request.article.replace("_", " ")}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        request.state === "finished"
                          ? "bg-green-100 text-green-800"
                          : request.state === "progress"
                            ? "bg-blue-100 text-blue-800"
                            : request.state === "unseen"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {request.state}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-gray-600">
                    {request.description || "Aucune description disponible"}
                  </p>

                  <div className="mt-6 flex justify-between">
                    <div>
                      <button
                        onClick={() => handleDeleteClick(request.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 focus:outline-none"
                      >
                        <FaTrash size={14} />
                        <span>Supprimer</span>
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent bubbling to parent containers
                        toggleDetails(request.id, request);
                      }}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                      <FaEye size={14} />
                      <span>
                        {detailsVisible === request.id ? "Masquer" : "Voir"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredRequests.length > requestsPerPage && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`rounded-lg border px-3 py-1 ${
                      currentPage === 1
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Précédent
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-lg px-3 py-1 ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`rounded-lg border px-3 py-1 ${
                      currentPage === totalPages
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {detailsVisible !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-0">
          <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-xl md:h-auto md:max-h-[90vh] md:w-11/12 md:rounded-lg">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-gray-100 p-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Détails de la Commande
              </h3>
              <button
                onClick={() => setDetailsVisible(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                aria-label="Fermer"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 md:p-6">
              {(() => {
                const request = requests.find((r) => r.id === detailsVisible);
                if (!request) return null;

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded bg-gray-50 p-3 shadow-sm">
                        <span className="text-xs text-gray-500">Article</span>
                        <p className="font-medium capitalize">
                          {request.article.replace("_", " ")}
                        </p>
                      </div>
                      <div className="rounded bg-gray-50 p-3 shadow-sm">
                        <span className="text-xs text-gray-500">État</span>
                        <p className="font-medium">{request.state}</p>
                      </div>
                      <div className="rounded bg-gray-50 p-3 shadow-sm">
                        <span className="text-xs text-gray-500">Taille</span>
                        <p className="font-medium">{request.size || "N/A"}</p>
                      </div>
                      <div className="rounded bg-gray-50 p-3 shadow-sm">
                        <span className="text-xs text-gray-500">Prix</span>
                        <p className="font-medium">{request.price} DA</p>
                      </div>
                      <div className="rounded bg-gray-50 p-3 shadow-sm">
                        <span className="text-xs text-gray-500">Couleur</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: request.color }}
                          ></div>
                          <p className="font-medium">{request.color}</p>
                        </div>
                      </div>
                      <div className="rounded bg-gray-50 p-3 shadow-sm">
                        <span className="text-xs text-gray-500">Créé le</span>
                        <p className="font-medium">
                          {new Date(request.creation_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="rounded bg-gray-50 p-3 shadow-sm">
                      <span className="text-xs text-gray-500">Description</span>
                      <p className="font-medium">
                        {request.description || "Aucune description disponible"}
                      </p>
                    </div>

                    {request.phone && (
                      <div className="rounded bg-gray-50 p-3 shadow-sm">
                        <span className="text-xs text-gray-500">Téléphone</span>
                        <p className="font-medium">{request.phone}</p>
                      </div>
                    )}

                    {request.text && (
                      <div className="rounded bg-gray-50 p-3 shadow-sm">
                        <span className="text-xs text-gray-500">Texte</span>
                        <p className="font-medium">{request.text}</p>
                      </div>
                    )}

                    {request.city && (
                      <div className="rounded bg-gray-50 p-3 shadow-sm">
                        <span className="text-xs text-gray-500">Ville</span>
                        <p className="font-medium">{request.city}</p>
                      </div>
                    )}

                    {/* Customer Design Section */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                      <h4 className="mb-4 font-semibold text-gray-800">
                        Design du client
                      </h4>
                      <div className="flex flex-wrap items-center justify-center gap-6">
                        {/* Front image - try all possible field names */}
                        {validateImageUrl(request.frontImage) ||
                        validateImageUrl(request.front_image) ||
                        validateImageUrl(request.front_image_url) ? (
                          <div className="w-full sm:w-2/5">
                            <p className="mb-2 text-center font-medium text-gray-700">
                              Avant
                            </p>
                            {renderImageWithDownload(
                              request.front_image_url ||
                                request.front_image ||
                                request.frontImage ||
                                "",
                              "Design avant",
                              1
                            )}
                          </div>
                        ) : (
                          <div className="w-full sm:w-2/5">
                            <p className="mb-2 text-center font-medium text-gray-700">
                              Avant
                            </p>
                            <div className="flex h-48 items-center justify-center rounded border border-gray-200 bg-gray-50">
                              <p className="text-gray-400">Pas d'image</p>
                            </div>
                          </div>
                        )}

                        {/* Back image - try all possible field names */}
                        {validateImageUrl(request.backImage) ||
                        validateImageUrl(request.back_image) ||
                        validateImageUrl(request.back_image_url) ? (
                          <div className="w-full sm:w-2/5">
                            <p className="mb-2 text-center font-medium text-gray-700">
                              Arrière
                            </p>
                            {renderImageWithDownload(
                              request.back_image_url ||
                                request.back_image ||
                                request.backImage ||
                                "",
                              "Design arrière",
                              2
                            )}
                          </div>
                        ) : (
                          <div className="w-full sm:w-2/5">
                            <p className="mb-2 text-center font-medium text-gray-700">
                              Arrière
                            </p>
                            <div className="flex h-48 items-center justify-center rounded border border-gray-200 bg-gray-50">
                              <p className="text-gray-400">Pas d'image</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add extra bottom padding to ensure content isn't hidden by sticky footer */}
                    <div className="h-16"></div>
                  </div>
                );
              })()}
            </div>

            <div className="sticky bottom-0 z-10 flex justify-end space-x-3 border-t bg-gray-50 p-4">
              <button
                onClick={() => setDetailsVisible(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Fermer
              </button>
              <button
                onClick={() => handleDeleteClick(detailsVisible)}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="bg-red-50 p-6">
              <div className="flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="mt-4 text-center text-lg font-medium text-gray-900">
                Confirmation de suppression
              </h3>
              <p className="mt-2 text-center text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer cette demande ? Cette action
                est irréversible.
              </p>
            </div>
            <div className="bg-white p-4 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              >
                Supprimer
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setRequestToDelete(null);
                }}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              className="absolute -right-4 -top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedImage(null);
              }}
            >
              <FaTimes />
            </button>
            <img
              src={enlargedImage.src}
              alt={enlargedImage.alt}
              className="max-h-[85vh] max-w-full rounded border-2 border-white object-contain shadow-xl"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-image.png";
                e.currentTarget.onerror = null;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
