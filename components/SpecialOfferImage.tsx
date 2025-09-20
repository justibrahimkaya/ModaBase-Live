'use client'

interface SpecialOfferImageProps {
  images: string[]
  productName: string
}

export default function SpecialOfferImage({ images, productName }: SpecialOfferImageProps) {
  const imageSrc = images[0] && (images[0].startsWith('data:') || images[0].startsWith('http') || images[0].startsWith('/')) 
    ? images[0] 
    : '/default-product.svg'

  return (
    <img
      src={imageSrc}
      alt={productName}
      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/default-product.svg';
      }}
    />
  )
}
