export default function Container({children, direction, className}) {
  return <div className={`flex justify-center items-center ${direction === 'column' ? 'flex-col' : ''} ${className}`}>
    {children}
  </div>
}