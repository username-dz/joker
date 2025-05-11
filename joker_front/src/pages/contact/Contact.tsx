import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaLinkedin, FaSquareXTwitter } from "react-icons/fa6";
import HttpClient from "../../utils/HttpClient"; // Import HttpClient

const schema = z.object({
  fullName: z.string().min(5, "Veuillez entrer votre nom complet"),
  email: z.string().email("Veuillez entrer une adresse e-mail valide"),
  phoneNumber: z
    .string()
    .regex(
      /^(?:\+?213|0)(?:5|6|7)(?:[0-9] ?){8}$/,
      "Veuillez entrer un numéro de téléphone valide"
    )
    .min(1, "Veuillez entrer votre numéro de téléphone"),
  message: z.string().min(1, "Veuillez entrer un message"),
});

type ContactFormData = z.infer<typeof schema>;

const ContactForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    try {
      // Create message object
      const messageData = {
        ...data,
        timestamp: new Date().toISOString(),
      };

      // Send to backend API
      await HttpClient.post("/contacts/", messageData);

      // Clear the form
      reset();

      // Show success message
      setFormSubmitted(true);
      setSubmissionError(null);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmissionError(
        "Une erreur est survenue. Veuillez réessayer plus tard."
      );
    }
  };

  if (formSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 py-12">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-10 w-10 text-[#DB3F40]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-800">Merci !</h2>
          <p className="mb-8 text-lg text-gray-600">
            Votre message a été envoyé avec succès. Nous vous répondrons dans
            les plus brefs délais.
          </p>
          <button
            onClick={() => setFormSubmitted(false)}
            className="rounded-lg bg-[#DB3F40] px-6 py-3 font-medium text-white shadow-md transition duration-300 hover:bg-red-700"
          >
            Envoyer un autre message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex flex-col lg:flex-row">
            {/* Info Section */}
            <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#DB3F40] to-[#9E1E20] p-12 text-white lg:w-2/5">
              <div className="absolute left-0 top-0 h-full w-full">
                <svg
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 1200 1200"
                >
                  <circle
                    cx="400"
                    cy="300"
                    r="400"
                    fill="currentColor"
                    fillOpacity="0.1"
                  ></circle>
                  <circle
                    cx="900"
                    cy="800"
                    r="600"
                    fill="currentColor"
                    fillOpacity="0.1"
                  ></circle>
                </svg>
              </div>

              <div className="relative z-10">
                <h2 className="mb-8 text-4xl font-bold">Prenons contact</h2>

                <div className="mb-10">
                  <h3 className="mb-2 text-xl font-semibold">
                    Rendez-nous visite
                  </h3>
                  <p className="mb-1 text-red-100">
                    Venez nous dire bonjour à nos bureaux
                  </p>
                  <p className="text-lg">Azzaba, Skikda, Algérie</p>
                </div>

                <div className="mb-10">
                  <h3 className="mb-2 text-xl font-semibold">
                    Discutez avec nous
                  </h3>
                  <p className="mb-1 text-red-100">
                    Notre équipe est là pour vous aider
                  </p>
                  <p className="text-lg transition duration-300 hover:text-red-200">
                    jokergraphics@gmail.com
                  </p>
                </div>

                <div className="mb-12">
                  <h3 className="mb-2 text-xl font-semibold">Appelez-nous</h3>
                  <p className="mb-1 text-red-100">
                    Du samedi au vendredi de 8h à 18h
                  </p>
                  <p className="text-lg transition duration-300 hover:text-red-200">
                    0697 09 36 06
                  </p>
                </div>

                <div className="flex space-x-6">
                  <a
                    href="https://www.facebook.com/JokerGraphics1"
                    target="_blank"
                    aria-label="Facebook"
                    className="transform text-white transition hover:scale-110 hover:text-red-200"
                  >
                    <FaFacebook className="h-7 w-7" />
                  </a>
                  <a
                    href="https://www.instagram.com/joker.graphics/"
                    target="_blank"
                    aria-label="Instagram"
                    className="transform text-white transition hover:scale-110 hover:text-red-200"
                  >
                    <FaInstagram className="h-7 w-7" />
                  </a>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="w-full p-12 lg:w-3/5">
              <h2 className="mb-8 text-3xl font-bold text-gray-800">
                Envoyez-nous un message
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Nom Complet
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Ahmed Benali"
                      {...register("fullName")}
                      className={`w-full rounded-lg border px-4 py-3 pl-12 ${errors.fullName ? "border-red-500" : "border-gray-300"} transition duration-300 focus:border-[#DB3F40] focus:ring focus:ring-red-200 focus:ring-opacity-50`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="contact@example.com"
                      {...register("email")}
                      className={`w-full rounded-lg border px-4 py-3 pl-12 ${errors.email ? "border-red-500" : "border-gray-300"} transition duration-300 focus:border-[#DB3F40] focus:ring focus:ring-red-200 focus:ring-opacity-50`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      id="phoneNumber"
                      type="text"
                      placeholder="0698459897"
                      {...register("phoneNumber")}
                      className={`w-full rounded-lg border px-4 py-3 pl-12 ${errors.phoneNumber ? "border-red-500" : "border-gray-300"} transition duration-300 focus:border-[#DB3F40] focus:ring focus:ring-red-200 focus:ring-opacity-50`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-4 pt-3">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Dites-nous en quoi nous pouvons vous aider..."
                      {...register("message")}
                      className={`w-full rounded-lg border px-4 py-3 pl-12 ${errors.message ? "border-red-500" : "border-gray-300"} transition duration-300 focus:border-[#DB3F40] focus:ring focus:ring-red-200 focus:ring-opacity-50`}
                    ></textarea>
                  </div>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {submissionError && (
                  <p className="mt-4 text-sm text-red-600">{submissionError}</p>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`transform rounded-lg bg-[#DB3F40] px-6 py-3 font-medium text-white shadow-md transition duration-300 hover:scale-105 hover:bg-[#c02c2d] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="mr-2 h-5 w-5 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Envoi en cours...
                      </span>
                    ) : (
                      "Envoyer le message"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
