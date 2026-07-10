export default function Input({ className, ...props }) {
	const _className = `px-4 py-2 text-sm border focus:outline-main-200 rounded my-1 ${className}`;

	if (props.type === "textarea")
		return <textarea className={_className} {...props} />;

	return <input className={_className} {...props} />;
}
