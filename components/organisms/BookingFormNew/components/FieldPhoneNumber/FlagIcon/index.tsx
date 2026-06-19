interface FlagIconProps {
  className?: string
  flag: string
  alt: string
}

const FlagIcon = ({ className, flag, alt }: FlagIconProps) => (
  <img className={className} src={flag} alt={alt} />
)

export default FlagIcon
