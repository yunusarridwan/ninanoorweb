import shipping from '../assets/shipping-fast.svg'
import hot from '../assets/hot-food.svg'
import fresh from '../assets/fresh-food.svg'
import hat from '../assets/hat-chef.svg'

const Features = () => {
  return (
    <section className='max-padd-container py-16 xl:py-28 !pb-12'>
      <div className='max-padd-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 gap-y-12'>
        
        {/* shipping icon */}
        <div className='flexCenter flex-col gap-3'>
          <img src={shipping} alt="" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Pengiriman Cepat</h5>
            <hr className='w-8 bg-secondary h-1 rounded-full border-none' />
          </div>
          <p className='text-center'>Pesanan Anda tiba dengan aman dan tepat waktu.</p>
        </div>

        {/* hot food icon */}
        <div className='flexCenter flex-col gap-3'>
          <img src={hot} alt="" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Makanan Hangat</h5>
            <hr className='w-8 bg-secondary h-1 rounded-full border-none' />
          </div>
          <p className='text-center'>Selalu segar, lezat, nikmat, bergizi, dan menggugah selera.</p>
        </div>

        {/* fresh food icon */}
        <div className='flexCenter flex-col gap-3'>
          <img src={fresh} alt="" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Bahan Berkualitas</h5>
            <hr className='w-8 bg-secondary h-1 rounded-full border-none' />
          </div>
          <p className='text-center'>Kami hanya menggunakan bahan terbaik untuk rasa yang luar biasa.</p>
        </div>

        {/* chef hat icon */}
        <div className='flexCenter flex-col gap-3'>
          <img src={hat} alt="" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Koki Berpengalaman</h5>
            <hr className='w-8 bg-secondary h-1 rounded-full border-none' />
          </div>
          <p className='text-center'>Setiap hidangan dibuat dengan keahlian dan dedikasi tinggi.</p>
        </div>
        
      </div>
    </section>
  )
}

export default Features