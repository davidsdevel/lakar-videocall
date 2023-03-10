export default function Button({className, children, ...props}) {
  return <button className={`border rounded px-4 py-1 my-1 w-fit ${className}`} {...props}>{children}</button>;
}