export default function Button({className, transparent, children, ...props}) {
  const customClassName = transparent
    ? 'bg-none border border-white'
    : 'bg-gradient-to-r from-green-400 to-main-500';

  return <button className={`rounded-full px-6 py-2 my-1 w-fit text-white ${customClassName} ${className}`} {...props}>{children}</button>;
}