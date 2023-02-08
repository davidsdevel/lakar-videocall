export default function Input({className, ...props}) {
  
  return <input className={`px-4 py-2 text-sm border rounded my-1 ${className}`} {...props}/>
}