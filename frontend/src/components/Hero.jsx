import { NavLink } from "react-router-dom";
import { LuCroissant } from "react-icons/lu";
import { MdOutlineShareLocation } from "react-icons/md";

const Hero = () => {
  return (
    <section className="mx-auto max-w-[1440px]">
      <div className="relative bg-hero bg-cover bg-center bg-no-repeat h-[811px] w-full">
        <div className="max-padd-container relative top-36 sm:top-72 xl:top-48">
          <h1 className="h1 max-w-[55rem] capitalize">
            Nikmati Roti yang Selalu Fresh
            <span className="text-secondary"> Langsung ke Pintu Anda</span>
          </h1>
          <p className="regular-16 xl:regular-20 mt-6 mb-6 max-w-[43rem]">
            Kami hadir untuk menyajikan makanan terbaik dengan kualitas premium.
            Setiap hidangan dibuat dengan bahan segar, penuh cinta, dan keahlian
            tinggi. Nikmati pengalaman kuliner yang berbeda dan jadilah bagian
            dari perjalanan kami!
          </p>
          <div className="max-xs:flex-col flex gap-2">
            <NavLink to={"/menu"} className={"btn-white flexCenter gap-x-2"}>
              <LuCroissant className="text-xl" />
              Pesan Sekarang
            </NavLink>
            <NavLink to={"/orders"} className={"btn-white flexCenter gap-x-2"}>
              <MdOutlineShareLocation className="text-xl" /> Track Order
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
