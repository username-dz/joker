import { useEffect } from "react";
import { FaUsers, FaHeadset, FaPalette } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const features = [
  {
    icon: <FaUsers className="h-10 w-10" />,
    count: "1000+",
    title: "Clients Satisfaits",
    description:
      "Offrir des résultats excellents à travers l'Algérie avec des designs personnalisés que les gens adorent.",
    color: "from-red-400 to-red-600",
  },
  {
    icon: <FaHeadset className="h-10 w-10" />,
    count: "24/7",
    title: "Support Client",
    description:
      "Nous sommes là chaque fois que vous avez besoin d'aide avec vos commandes et designs.",
    color: "from-red-500 to-red-700",
  },
  {
    icon: <FaPalette className="h-10 w-10" />,
    count: "100%",
    title: "Créativité Personnalisée",
    description:
      "Chaque design est unique et adapté à vos besoins et préférences spécifiques.",
    color: "from-red-600 to-red-800",
  },
];

const Features = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2
            className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl"
            data-aos="fade-up"
          >
            Pourquoi Choisir{" "}
            <span className="text-[#DB3F40]">Joker Graphics</span>
          </h2>
          <div
            className="mx-auto mb-6 h-1 w-24 bg-[#DB3F40]"
            data-aos="fade-up"
            data-aos-delay="100"
          ></div>
          <p
            className="mx-auto max-w-2xl text-lg text-gray-600"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Nous offrons une qualité et un service exceptionnels pour donner vie
            à vos idées.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              data-aos="fade-up"
              data-aos-delay={index * 150}
            >
              <div
                className={`bg-gradient-to-r ${feature.color} p-6 text-white`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="inline-block rounded-lg bg-white bg-opacity-20 p-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-3xl font-bold">{feature.count}</h3>
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
