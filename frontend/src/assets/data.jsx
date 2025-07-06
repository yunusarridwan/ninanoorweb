import cakes from "../assets/categories/cakes.svg";
import bread from "../assets/categories/bread.svg";
import snacks from "../assets/categories/snacks.svg";
import pudding from "../assets/categories/pudding.svg";
import minibread from "../assets/categories/minibread.svg";

export const categories = [
  {
    name: "Cakes",
    image: cakes,
  },
  {
    name: "Bread",
    image: bread,
  },
  {
    name: "Snacks",
    image: snacks,
  },
  {
    name: "Pudding",
    image: pudding,
  },
  {
    name: "Mini Bread",
    image: minibread,
  }
];

// FOOTER SECTION
export const FOOTER_LINKS = [
  {
    title: "Halaman Kami",
    links: [
      "Menu",
      "Kontak",
      "Order",
      "Ulasan",
      "Keranjang",
    ],
  },
];

export const FOOTER_CONTACT_INFO = {
  title: "Kontak Kami",
  links: [
    { label: "Nomor Telepon", value: "0813-2752-1293" },
    { label: "Email", value: "Ninanoor@gmail.com" },
  ],
};
