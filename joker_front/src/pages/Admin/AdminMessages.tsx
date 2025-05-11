import React, { useState, useEffect } from "react";
import { FaTrash, FaCheck, FaEye, FaEyeSlash, FaSyncAlt } from "react-icons/fa";
import HttpClient from "../../utils/HttpClient";
import Sidebar from "../../components/sideBar/sideBar";
import { toast } from "react-hot-toast";

interface Message {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface PaginatedMessagesResponse {
  results: Message[];
  count: number;
  page: number;
  total_pages: number;
}

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const messagesPerPage = 20;

  useEffect(() => {
    fetchMessages();
  }, [currentPage]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await HttpClient.get<PaginatedMessagesResponse>(
        `/contacts/?page=${currentPage}&page_size=${messagesPerPage}`
      );

      setMessages(response.results);
      setTotalPages(response.total_pages);
      setTotalCount(response.count);
      setError(null);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(
        "Impossible de charger les messages. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await HttpClient.post(`/contacts/${id}/mark_as_read/`);

      const updatedMessages = messages.map((msg) =>
        msg.id === id ? { ...msg, read: true } : msg
      );
      setMessages(updatedMessages);
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, read: true });
      }
      toast.success("Message marqué comme lu");
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("Erreur lors du marquage du message comme lu");
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await HttpClient.delete(`/contacts/${id}/`);
      const updatedMessages = messages.filter((msg) => msg.id !== id);
      setMessages(updatedMessages);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
        setIsModalOpen(false);
      }
      toast.success("Message supprimé avec succès");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Erreur lors de la suppression du message");
    }
  };

  const openMessageModal = async (message: Message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    if (!message.read) {
      await markAsRead(message.id);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Display loading state
  if (isLoading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Messages des clients
            </h1>
            <p className="text-gray-600">Chargement des messages...</p>
          </div>
          <div className="flex items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-[#DB3F40]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Messages des clients
            </h1>
            <p className="text-red-600">{error}</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={fetchMessages}
              className="rounded bg-[#DB3F40] px-4 py-2 font-medium text-white hover:bg-red-600"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
            Messages des clients
          </h1>
          <p className="text-gray-600">
            Gérez les messages envoyés via le formulaire de contact
          </p>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="text-gray-600">
            Total: <span className="font-semibold">{totalCount}</span> messages
          </div>
          <button
            onClick={fetchMessages}
            className="flex items-center gap-2 rounded bg-[#DB3F40] px-4 py-2 font-medium text-white hover:bg-red-600"
          >
            <FaSyncAlt className={isLoading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg
                className="mb-4 h-16 w-16 text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg text-gray-500">
                Aucun message pour le moment
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        État
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Nom
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {messages.map((message) => (
                      <tr
                        key={message.id}
                        className={`hover:bg-gray-50 ${
                          !message.read ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          {message.read ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
                              <FaCheck className="mr-1" /> Lu
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-sm font-medium text-red-800">
                              <FaEye className="mr-1" /> Non lu
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {message.fullName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {message.email}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {formatDate(message.timestamp)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openMessageModal(message)}
                              className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                            >
                              Voir
                            </button>
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                            >
                              Supprimer
                            </button>
                            {!message.read && (
                              <button
                                onClick={() => markAsRead(message.id)}
                                className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                              >
                                Marquer lu
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className={`rounded-lg border px-3 py-1 ${
                        currentPage === 1
                          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Précédent
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`rounded-lg px-3 py-1 ${
                            currentPage === pageNumber
                              ? "bg-red-600 text-white"
                              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

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
      </div>

      {/* Message Modal */}
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-2 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl sm:mx-0">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                Message de {selectedMessage.fullName}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 hover:bg-gray-200"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Nom complet:
                </p>
                <p className="text-gray-900">{selectedMessage.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email:</p>
                <p className="text-gray-900">{selectedMessage.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Téléphone:</p>
                <p className="text-gray-900">{selectedMessage.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date:</p>
                <p className="text-gray-900">
                  {formatDate(selectedMessage.timestamp)}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500">Message:</p>
              <div className="mt-2 rounded-lg bg-gray-50 p-4 text-gray-800">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
              >
                Fermer
              </button>
              <button
                onClick={() => deleteMessage(selectedMessage.id)}
                className="flex items-center rounded bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
              >
                <FaTrash className="mr-2" /> Supprimer
              </button>
              {!selectedMessage.read && (
                <button
                  onClick={() => markAsRead(selectedMessage.id)}
                  className="flex items-center rounded bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600"
                >
                  <FaCheck className="mr-2" /> Marquer comme lu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
