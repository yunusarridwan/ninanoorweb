import { GiCheckMark } from "react-icons/gi";
import process1 from "../assets/process1.jpeg"
import process2 from "../assets/process2.jpeg"

const Process = () => {
  return (
    <section className="max-padd-container py-16 xl:py-20">
      {/* container */}
      <div className="flex flex-col gap-20 xl:flex-row">

        {/* left side */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="h3 max-w-[411px]">Pesan Kue, Roti, & Snack Favoritmu dalam Beberapa Klik</h3>
          <p>
          Nikmati kemudahan memesan kue, roti, dan snack lezat kapan saja, di mana saja. Ikuti langkah mudah ini dan nikmati kelezatan yang langsung diantar ke pintu rumahmu!
          </p>
          <div className="m-7 flex flex-col gap-4">
            <div className="flexStart gap-x-4">
              <span className="bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full"><GiCheckMark /></span>
              <p>Dari roti yang lembut, kue yang manis, hingga snack yang renyah.</p>
            </div>
            <div className="flexStart gap-x-4">
              <span className="bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full"><GiCheckMark /></span>
              <p>Cukup satu klik, pesanan langsung siap diproses.</p>
            </div>
            <div className="flexStart gap-x-4">
              <span className="bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full"><GiCheckMark /></span>
              <p>Isi detailmu dan selesaikan pesanan dalam hitungan detik.</p>
            </div>
            <div className="flexStart gap-x-4">
              <span className="bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full"><GiCheckMark /></span>
              <p>Pantau perjalanan pesananmu hingga tiba dengan aman!</p>
            </div>
          </div>
        </div>

        {/* right side */}
        <div className="flex-1 flex gap-6 xl:gap-12">
          <div className="relative bottom-5">
            <img src={process1} alt="" className="rounded-xl" />
          </div>
          <div className="relative top-6">
            <img src={process2} alt="" className="rounded-xl" />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Process;
