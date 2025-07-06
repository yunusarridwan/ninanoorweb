import Title from "../components/Title";
import {
  FaEnvelope,
  FaHeadphones,
  FaLocationDot,
  FaPhone,
} from "react-icons/fa6";
import Footer from "../components/Footer";

const Contact = () => {
  return (
    <section className="max-padd-container mt-24">
      {/* contact form and details */}
      <div className="flex flex-col xl:flex-row gap-20 py-6">
        {/* contact details */}
        <div>
          {/* title */}
          <Title title1={"Detail"} title2={"Kontak"} title1Styles={"h3"} />
          <p className="max-w-xl mb-4">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptas
            nostrum aspernatur laudantium delectus, quas nulla?
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <h5 className="h5 capitalize mr-4">Location: </h5>
              <p className="flexStart gap-x-2">
                <FaLocationDot />
                Ruko Kemang Pratama Blok AL9, RT.004/RW.001, Bojong Rawalumbu, Kec. Rawalumbu, Kota Bekasi, Jawa Barat 17116
              </p>
            </div>
            <div className="flex flex-col">
              <h5 className="h5 capitalize mr-4">Email: </h5>
              <p className="flexStart gap-x-2">
                <FaEnvelope />
                ninanoor@gmail.com
              </p>
            </div>
            <div className="flex flex-col">
              <h5 className="h5 capitalize mr-4">Phone: </h5>
              <p className="flexStart gap-x-2">
                <FaPhone />
                +6281327522907
              </p>
            </div>
            <div className="flex flex-col">
              <h5 className="h5 capitalize mr-4">Support: </h5>
              <p className="flexStart gap-x-2">
                <FaHeadphones />
                24/7 Support is open
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* location map */}
      <div className="py-20">
        {/* title */}
        <Title title1={"Kunjungi"} title2={"Kami"} title1Styles={"h3"} />
        <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
          <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.8936831304222!2d106.9906163!3d-6.277706499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698d8e053b5735%3A0xd5dc6e0ec78ef1f1!2sNinanoor!5e0!3m2!1sen!2sid!4v1735197091089!5m2!1sen!2sid"
            allowFullScreen=''
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default Contact;
