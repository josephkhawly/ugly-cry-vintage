import { formatPrice } from '@/lib/money'

const Price = ({
  amount,
  className,
  currencyCode = 'USD',
}: {
  amount: string
  className?: string
  currencyCode: string
}) => (
  <p className={className}>
    {formatPrice({ amount, currencyCode })}
  </p>
)

export default Price
