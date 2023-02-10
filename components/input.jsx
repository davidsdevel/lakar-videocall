export default function Input({className, ...props}) {
  const _className = `px-4 py-2 text-sm border rounded my-1 ${className}`;

  if (props.type === 'textarea')
    return <texarea className={_className} {...props}/>

  return <input className={_className} {...props}/>
}