function SellerCta({ onBecomeSeller }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-neutral-dark px-8 py-16 text-center text-white lg:py-24">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClIzl4Yj4exP4Ss0osCAsOtEcpO341xjqnrlBv-15myDG7OZoTpp36aHN1FPVemVWql749rJinYNm83xhAp_l9TMxiYUqGP3g1E4uQneSApsAD84yTr2qBzDudNOUcUcTavM0hl6Y4mpK_HRyXT_rwK01fElVD1T2MtesZCMT_ls8uU-B6joBadXCQ1ReyQ5-8pRHh653zNcoy1jVd7dPbtogb8l8NrYZSsh-djIOU7WsU-sPw-UrVpH-B_Jj7gxr7LKLqASSmXXxL')",
          }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Got surplus furniture?</h2>
          <p className="mt-4 max-w-lg text-lg text-white/70">
            Join hundreds of sellers reaching customers who need exactly what you have. Fast,
            secure, and easy listing.
          </p>
          <button
            className="mt-10 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-neutral-dark transition-all hover:scale-105 hover:bg-primary/90"
            onClick={onBecomeSeller}
            type="button"
          >
            Become a Seller
          </button>
        </div>
      </div>
    </section>
  )
}

export default SellerCta
